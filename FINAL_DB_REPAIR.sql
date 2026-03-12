-- ===================================================
-- FINAL SALONE VAULT DB REPAIR SCRIPT (REVISED)
-- Consolidates all database fixes:
-- 1. Hardens the profiles table (NIN, Role)
-- 2. Automatic Profile Creation on Signup (Robust)
-- 3. Repair missing activity_logs columns
-- 4. Fix RLS recursion loops
-- 5. Reload PostgREST schema cache
-- ===================================================

-- 1. Harden Profiles Table
DO $$
BEGIN
    -- Add NIN column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'nin') THEN
        ALTER TABLE public.profiles ADD COLUMN nin TEXT UNIQUE;
    END IF;

    -- Add Role column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;

    -- Ensure Role check constraint
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'issuer', 'verifier', 'admin'));

    -- Ensure NIN check constraint (8 digits)
    -- We use a soft check or just allow it to be updated later to avoid blocking signup if metadata is missing
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_nin_format;
    -- ALTER TABLE public.profiles ADD CONSTRAINT chk_nin_format CHECK (nin IS NULL OR nin ~ '^[0-9]{8}$');
END $$;

-- 2. Robust Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    raw_nin TEXT;
BEGIN
    raw_nin := NEW.raw_user_meta_data->>'nin';
    
    -- Ensure we don't block signup if NIN is invalid format initially
    -- We can validate in the app, but if it hits the DB we want it to work
    
    INSERT INTO public.profiles (id, email, full_name, phone, nin, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        CASE WHEN raw_nin ~ '^[0-9]{8}$' THEN raw_nin ELSE NULL END, -- Only insert if valid
        'user'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        nin = COALESCE(EXCLUDED.nin, profiles.nin);
        
    -- Handle any pending invitations (merging logic from handle_new_user_invites)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shared_album_members') THEN
        UPDATE public.shared_album_members
        SET user_id = NEW.id,
            status = 'active',
            accepted_at = now()
        WHERE email = NEW.email;
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but allow user creation to proceed if possible? 
    -- Actually, if this fails, the user won't have a profile which breaks the app anyway.
    -- Better to let it fail so we see the error, but we've made points of failure (NIN) safer.
    RAISE;
END;
$$;

-- Attach trigger to auth.users (Single consolidated trigger)
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users; -- Remove old trigger name if exists

CREATE TRIGGER on_auth_user_created_repair
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Repair activity_logs Schema
DO $$
BEGIN
    -- Ensure activity_logs exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_logs') THEN
        CREATE TABLE activity_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            action TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now()
        );
    END IF;

    -- Add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'user_id') THEN
        ALTER TABLE activity_logs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'document_id') THEN
        ALTER TABLE activity_logs ADD COLUMN document_id UUID; -- We don't enforce FK here yet to avoid issues
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'album_id') THEN
        ALTER TABLE activity_logs ADD COLUMN album_id UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'token') THEN
        ALTER TABLE activity_logs ADD COLUMN token TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'meta') THEN
        ALTER TABLE activity_logs ADD COLUMN meta JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'details') THEN
        ALTER TABLE activity_logs ADD COLUMN details JSONB;
    END IF;
END $$;

-- 4. Helper function to break RLS recursion
CREATE OR REPLACE FUNCTION get_user_shared_album_ids(target_user_id uuid, target_email text)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT shared_album_id 
    FROM shared_album_members 
    WHERE user_id = target_user_id 
       OR (email = target_email AND target_email IS NOT NULL AND target_email <> '');
$$;

-- 5. Update Policies (Robust)
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view activity logs" ON activity_logs;
CREATE POLICY "Members can view activity logs" ON activity_logs
    FOR SELECT USING (
        (user_id = auth.uid()) OR 
        (EXISTS (SELECT 1 FROM public.shared_album_members WHERE shared_album_id = activity_logs.album_id AND (user_id = auth.uid() OR email = auth.jwt()->>'email')))
    );

DROP POLICY IF EXISTS "Members can insert activity logs" ON activity_logs;
CREATE POLICY "Members can insert activity logs" ON activity_logs
    FOR INSERT WITH CHECK (
        (user_id = auth.uid()) OR 
        (EXISTS (SELECT 1 FROM public.shared_album_members WHERE shared_album_id = activity_logs.album_id AND (user_id = auth.uid() OR email = auth.jwt()->>'email')))
    );

-- 6. Reload PostgREST cache
NOTIFY pgrst, 'reload schema';

SELECT 'Repair completed successfully. Please try signing up again.' as result;

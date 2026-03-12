-- ===================================================
-- FINAL SALONE VAULT DB REPAIR SCRIPT
-- Consolidates all database fixes:
-- 1. Automatic Profile Creation on Signup
-- 2. Repair missing activity_logs columns
-- 3. Fix RLS recursion loops
-- 4. Reload PostgREST schema cache
-- ===================================================

-- 1. Ensure Profile Creation Trigger
-- This function handles the metadata sent from the frontend during signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, nin, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.raw_user_meta_data->>'nin',
    'user'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    nin = COALESCE(EXCLUDED.nin, profiles.nin);
  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Repair Schema: Add missing columns to activity_logs
DO $$
BEGIN
    -- Add document_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'document_id') THEN
        ALTER TABLE activity_logs ADD COLUMN document_id UUID REFERENCES documents(id) ON DELETE SET NULL;
    END IF;

    -- Add token
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'token') THEN
        ALTER TABLE activity_logs ADD COLUMN token TEXT;
    END IF;

    -- Add details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'details') THEN
        ALTER TABLE activity_logs ADD COLUMN details JSONB;
    END IF;

    -- Add meta
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'meta') THEN
        ALTER TABLE activity_logs ADD COLUMN meta JSONB;
    END IF;
END $$;

-- 3. Helper function to break RLS recursion
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

-- 4. Update Policies to use the function (prevents PGRST204)

-- Shared Albums
DROP POLICY IF EXISTS "Members can view shared albums" ON shared_albums;
CREATE POLICY "Members can view shared albums" ON shared_albums
    FOR SELECT USING (
        id IN (SELECT get_user_shared_album_ids(auth.uid(), auth.jwt()->>'email'))
    );

-- Activity Logs
DROP POLICY IF EXISTS "Members can view activity logs" ON activity_logs;
CREATE POLICY "Members can view activity logs" ON activity_logs
    FOR SELECT USING (
        (user_id = auth.uid()) 
        OR 
        (album_id IN (SELECT get_user_shared_album_ids(auth.uid(), auth.jwt()->>'email')))
    );

DROP POLICY IF EXISTS "Members can insert activity logs" ON activity_logs;
CREATE POLICY "Members can insert activity logs" ON activity_logs
    FOR INSERT WITH CHECK (
        (user_id = auth.uid()) 
        OR 
        (album_id IN (SELECT get_user_shared_album_ids(auth.uid(), auth.jwt()->>'email')))
    );

-- 5. Reload PostgREST cache
NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
    RAISE NOTICE 'Repair completed successfully. Please try signing up again.';
END $$;

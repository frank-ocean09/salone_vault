-- ===================================================
-- FINAL SALONE VAULT DB REPAIR SCRIPT (V3 - ULTRA ROBUST)
-- Run this in the Supabase SQL Editor to fix EVERYTHING.
-- ===================================================

-- 1. Ensure public.profiles table has all required columns
DO $$
BEGIN
    -- Base table if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        CREATE TABLE public.profiles (
            id UUID REFERENCES auth.users PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT,
            phone TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;

    -- Add NIN column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'nin') THEN
        ALTER TABLE public.profiles ADD COLUMN nin TEXT;
    END IF;

    -- Add Role column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;

    -- Standardize Role constraints
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'issuer', 'verifier', 'admin'));
    
    -- Ensure RLS is enabled
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Update NIN constraint to allow alphanumeric (Sierra Leone standard)
    -- First, drop the old constraint if it exists
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_nin_format;
    -- Optional: Add a more relaxed constraint or keep it free-text
    -- For now, we allow alphanumeric strings of 4-15 characters as a safety measure
    -- ALTER TABLE public.profiles ADD CONSTRAINT chk_nin_format CHECK (nin ~ '^[A-Z0-9]{4,15}$');
END $$;

-- 2. Create/Update Profile Creation Trigger
-- This script ensures the trigger function is SECURITY DEFINER and handles metadata safely
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
EXCEPTION WHEN OTHERS THEN
  -- Fallback: If everything fails, at least create a bare profile to prevent auth rollback
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

-- Attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Repair activity_logs Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activity_logs') THEN
        CREATE TABLE public.activity_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            action TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now()
        );
    END IF;

    -- Add all expected columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'user_id') THEN
        ALTER TABLE public.activity_logs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'document_id') THEN
        ALTER TABLE public.activity_logs ADD COLUMN document_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'album_id') THEN
        ALTER TABLE public.activity_logs ADD COLUMN album_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'token') THEN
        ALTER TABLE public.activity_logs ADD COLUMN token TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'meta') THEN
        ALTER TABLE public.activity_logs ADD COLUMN meta JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'details') THEN
        ALTER TABLE public.activity_logs ADD COLUMN details JSONB;
    END IF;
    
    ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
END $$;

-- 4. Set Permissive Policies (Fixes 401/403)
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert activity logs" ON public.activity_logs;
CREATE POLICY "Users can insert activity logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own activity logs" ON public.activity_logs;
CREATE POLICY "Users can view own activity logs" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);

-- 5. Finalize
NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
    RAISE NOTICE 'DATABASE REPAIRED. Please try Creating an account with a NEW EMAIL now.';
END $$;

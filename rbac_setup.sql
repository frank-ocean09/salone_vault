-- Add role column to profiles if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Add check constraint for valid roles
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'issuer', 'verifier', 'admin'));

-- Add issuer_id to documents to track who issued it
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS issuer_id UUID REFERENCES auth.users(id);

-- Update RLS Policies for Profiles

-- Drop existing policies to be safe (or alter them)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Helper Functions (SECURITY DEFINER to bypass RLS recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_issuer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'issuer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_verifier()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'verifier'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. View Profile: Users see own, Admins and Issuers see others
DROP POLICY IF EXISTS "Profiles visibility" ON profiles;
CREATE POLICY "Profiles visibility" ON profiles
FOR SELECT USING (
    auth.uid() = id -- User sees own
    OR 
    is_admin() -- Admin sees all
    OR
    is_issuer() -- Issuer sees all (to find recipients)
);

-- 2. Update Profile: Users update own, Admins update all
DROP POLICY IF EXISTS "Profiles update" ON profiles;
CREATE POLICY "Profiles update" ON profiles
FOR UPDATE USING (
    auth.uid() = id 
    OR 
    is_admin()
);

-- Update RLS Policies for Documents

DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;

-- 1. View Documents
DROP POLICY IF EXISTS "Documents visibility" ON documents;
CREATE POLICY "Documents visibility" ON documents
FOR SELECT USING (
    user_id = auth.uid() -- Owner
    OR 
    issuer_id = auth.uid() -- Issuer
    OR
    is_admin() -- Admin
);

-- 2. Insert Documents
DROP POLICY IF EXISTS "Documents insert" ON documents;
CREATE POLICY "Documents insert" ON documents
FOR INSERT WITH CHECK (
    -- User uploading for themselves
    (user_id = auth.uid() AND issuer_id IS NULL)
    OR
    -- Issuer uploading for others
    (
        is_issuer()
        AND issuer_id = auth.uid()
    )
    OR
    -- Admin
    is_admin()
);

-- 3. Update/Delete Documents
DROP POLICY IF EXISTS "Documents modify" ON documents;
CREATE POLICY "Documents modify" ON documents
FOR ALL USING (
    user_id = auth.uid() -- Owner
    OR
    is_admin() -- Admin
);

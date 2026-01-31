-- ==========================================
-- SHARED ALBUMS SETUP SCRIPT
-- Run this script in your Supabase SQL Editor
-- ==========================================

-- 1. Enable UUID Extension (Standard)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Shared Albums Table
CREATE TABLE IF NOT EXISTS shared_albums (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  folder_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- 3. Create Shared Album Members Table
CREATE TABLE IF NOT EXISTS shared_album_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  shared_album_id uuid REFERENCES shared_albums(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  email text,
  role text NOT NULL DEFAULT 'viewer', -- 'viewer', 'uploader', 'owner'
  status text NOT NULL DEFAULT 'invited', -- 'invited', 'active'
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  CONSTRAINT unique_album_email UNIQUE (shared_album_id, email)
);

-- 4. Create Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    album_id UUID REFERENCES shared_albums(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Add shared_album_id to Documents (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'shared_album_id') THEN
        ALTER TABLE documents ADD COLUMN shared_album_id UUID REFERENCES shared_albums(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_shared_album_owner ON shared_albums(owner_id);
CREATE INDEX IF NOT EXISTS idx_shared_album_member_email ON shared_album_members(email);
CREATE INDEX IF NOT EXISTS idx_shared_album_member_user ON shared_album_members(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_shared_album_id ON documents(shared_album_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_album_id ON activity_logs(album_id);

-- 7. Triggers

-- Trigger: Automatically add Album Owner as a member with 'owner' role
CREATE OR REPLACE FUNCTION add_owner_as_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO shared_album_members (shared_album_id, user_id, email, role, status, accepted_at)
  VALUES (
      NEW.id, 
      NEW.owner_id, 
      (SELECT email FROM auth.users WHERE id = NEW.owner_id), 
      'owner', 
      'active', 
      now()
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_shared_album_created ON shared_albums;
CREATE TRIGGER on_shared_album_created
  AFTER INSERT ON shared_albums
  FOR EACH ROW EXECUTE FUNCTION add_owner_as_member();

-- Trigger: Link new users to pending invites
CREATE OR REPLACE FUNCTION handle_new_user_invites()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE shared_album_members
  SET user_id = NEW.id,
      status = 'active',
      accepted_at = now()
  WHERE email = NEW.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_invites();


-- 8. Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE shared_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_album_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Shared Albums Policies
DROP POLICY IF EXISTS "Owners can manage their shared albums" ON shared_albums;
CREATE POLICY "Owners can manage their shared albums" ON shared_albums
    FOR ALL USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Members can view shared albums" ON shared_albums;
CREATE POLICY "Members can view shared albums" ON shared_albums
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM shared_album_members
            WHERE shared_album_members.shared_album_id = shared_albums.id
            AND (shared_album_members.user_id = auth.uid() OR shared_album_members.email = auth.jwt()->>'email')
        )
    );

-- Shared Album Members Policies
DROP POLICY IF EXISTS "Owners can manage members" ON shared_album_members;
CREATE POLICY "Owners can manage members" ON shared_album_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM shared_albums
            WHERE shared_albums.id = shared_album_members.shared_album_id
            AND shared_albums.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Members can view other members" ON shared_album_members;
CREATE POLICY "Members can view other members" ON shared_album_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM shared_album_members AS me
            WHERE me.shared_album_id = shared_album_members.shared_album_id
            AND (me.user_id = auth.uid() OR me.email = auth.jwt()->>'email')
        )
    );

-- Activity Logs Policies
DROP POLICY IF EXISTS "Members can view activity logs" ON activity_logs;
CREATE POLICY "Members can view activity logs" ON activity_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM shared_album_members
            WHERE shared_album_members.shared_album_id = activity_logs.album_id
            AND (user_id = auth.uid() OR email = auth.jwt()->>'email')
        )
    );

DROP POLICY IF EXISTS "Members can insert activity logs" ON activity_logs;
CREATE POLICY "Members can insert activity logs" ON activity_logs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM shared_album_members
            WHERE shared_album_members.shared_album_id = activity_logs.album_id
            AND (user_id = auth.uid() OR email = auth.jwt()->>'email')
        )
    );

-- Documents Policies (Update Existing)
-- We need to ensure documents policies cover shared albums.

-- DROP existing policies first to be safe
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;
DROP POLICY IF EXISTS "Users can view own documents" ON documents;

-- View Policy
CREATE POLICY "Users can view documents" ON documents
  FOR SELECT USING (
      -- Private docs
      (shared_album_id IS NULL AND auth.uid() = user_id)
      OR
      -- Shared docs
      (shared_album_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM shared_album_members
          WHERE shared_album_id = documents.shared_album_id
          AND (user_id = auth.uid() OR email = auth.jwt()->>'email')
      ))
  );

-- Insert Policy
CREATE POLICY "Users can insert documents" ON documents
  FOR INSERT WITH CHECK (
    auth.uid() = user_id -- Must always be the uploader
    AND (
       (shared_album_id IS NULL) -- Private
       OR
       (
         shared_album_id IS NOT NULL AND EXISTS ( -- Shared: Check role
            SELECT 1 FROM shared_album_members
            WHERE shared_album_id = documents.shared_album_id
            AND (user_id = auth.uid() OR email = auth.jwt()->>'email')
            AND (role = 'uploader' OR role = 'owner')
         )
       )
    )
  );

-- Delete Policy
CREATE POLICY "Users can delete documents" ON documents
  FOR DELETE USING (
      -- Private
      (shared_album_id IS NULL AND auth.uid() = user_id)
      OR
      -- Shared: ONLY Album Owner can delete
      (shared_album_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM shared_albums
          WHERE id = documents.shared_album_id
          AND owner_id = auth.uid()
      ))
  );

-- Update Policy
CREATE POLICY "Users can update documents" ON documents
  FOR UPDATE USING (
      (shared_album_id IS NULL AND auth.uid() = user_id)
      OR
      (shared_album_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM shared_albums
          WHERE id = documents.shared_album_id
          AND owner_id = auth.uid()
      ))
  );

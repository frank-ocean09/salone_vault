-- ===================================================
-- REPAIR VAULT SCRIPT
-- Consolidates all database fixes:
-- 1. Fixes missing activity_logs columns
-- 2. Fixes RLS recursion loops
-- 3. Reloads schema cache to fix 400 errors
-- ===================================================

-- 1. Repair Schema: Add missing columns to activity_logs
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

-- 2. Helper function to break RLS recursion
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

-- 3. Update Policies to use the function

-- Shared Albums
DROP POLICY IF EXISTS "Members can view shared albums" ON shared_albums;
CREATE POLICY "Members can view shared albums" ON shared_albums
    FOR SELECT USING (
        id IN (SELECT get_user_shared_album_ids(auth.uid(), auth.jwt()->>'email'))
    );

-- Shared Album Members
DROP POLICY IF EXISTS "Members can view other members" ON shared_album_members;
CREATE POLICY "Members can view other members" ON shared_album_members
    FOR SELECT USING (
        shared_album_id IN (SELECT get_user_shared_album_ids(auth.uid(), auth.jwt()->>'email'))
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

-- Documents
DROP POLICY IF EXISTS "Users can view documents" ON documents;
CREATE POLICY "Users can view documents" ON documents
  FOR SELECT USING (
      (auth.uid() = user_id)
      OR
      (shared_album_id IN (SELECT get_user_shared_album_ids(auth.uid(), auth.jwt()->>'email')))
  );

-- Insert: Must be uploader or owner
DROP POLICY IF EXISTS "Users can insert documents" ON documents;
CREATE POLICY "Users can insert documents" ON documents
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND (
       (shared_album_id IS NULL)
       OR
       (
         shared_album_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM shared_album_members
            WHERE shared_album_id = documents.shared_album_id
            AND (user_id = auth.uid() OR email = auth.jwt()->>'email')
            AND (role = 'uploader' OR role = 'owner')
         )
       )
    )
  );

-- Delete: Private or Album Owner
DROP POLICY IF EXISTS "Users can delete documents" ON documents;
CREATE POLICY "Users can delete documents" ON documents
  FOR DELETE USING (
      (shared_album_id IS NULL AND auth.uid() = user_id)
      OR
      (shared_album_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM shared_albums
          WHERE id = documents.shared_album_id
          AND owner_id = auth.uid()
      ))
  );

-- Update: Private or Album Owner
DROP POLICY IF EXISTS "Users can update documents" ON documents;
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

-- 4. Reload PostgREST cache (Fixes PGRST204)
NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
    RAISE NOTICE 'Repair completed successfully and cache reloaded.';
END $$;

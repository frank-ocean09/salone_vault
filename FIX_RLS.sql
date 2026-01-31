-- ===================================================
-- FIX RLS RECURSION SCRIPT
-- Resolves 500 Errors caused by infinite policy loops
-- ===================================================

-- 1. Create a secure helper function to check membership
-- This function runs as "Security Definer" (superuser) to bypass RLS recursion
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

-- 2. Update Shared Albums Policy to use the function
DROP POLICY IF EXISTS "Members can view shared albums" ON shared_albums;
CREATE POLICY "Members can view shared albums" ON shared_albums
    FOR SELECT USING (
        id IN (
            SELECT get_user_shared_album_ids(auth.uid(), auth.jwt()->>'email')
        )
    );

-- 3. Update Shared Album Members Policy to use the function
DROP POLICY IF EXISTS "Members can view other members" ON shared_album_members;
CREATE POLICY "Members can view other members" ON shared_album_members
    FOR SELECT USING (
        shared_album_id IN (
            SELECT get_user_shared_album_ids(auth.uid(), auth.jwt()->>'email')
        )
    );

-- 4. Update Documents Policy to use the function
-- First drop the conflicting ones
DROP POLICY IF EXISTS "Users can view documents" ON documents;
DROP POLICY IF EXISTS "Users can insert documents" ON documents;
DROP POLICY IF EXISTS "Users can delete documents" ON documents;
DROP POLICY IF EXISTS "Users can update documents" ON documents;

-- Recreate with safe lookup
CREATE POLICY "Users can view documents" ON documents
  FOR SELECT USING (
      -- Private docs
      (shared_album_id IS NULL AND auth.uid() = user_id)
      OR
      -- Shared docs (using helper function to avoid recursion)
      (
          shared_album_id IN (
              SELECT get_user_shared_album_ids(auth.uid(), auth.jwt()->>'email')
          )
      )
  );

-- Insert: Must be uploader or owner
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

-- 5. Fix Activity Logs Policy
DROP POLICY IF EXISTS "Members can view activity logs" ON activity_logs;
CREATE POLICY "Members can view activity logs" ON activity_logs
    FOR SELECT
    USING (
        (user_id = auth.uid()) -- Personal logs
        OR
        (album_id IN (
             SELECT get_user_shared_album_ids(auth.uid(), auth.jwt()->>'email')
        ))
    );

DROP POLICY IF EXISTS "Members can insert activity logs" ON activity_logs;
CREATE POLICY "Members can insert activity logs" ON activity_logs
    FOR INSERT
    WITH CHECK (
        (user_id = auth.uid()) -- Logging own actions
        OR
        (album_id IN (
             SELECT get_user_shared_album_ids(auth.uid(), auth.jwt()->>'email')
        ))
    );

-- Shared Albums V2 Migration

-- 1. Add description to shared_albums
ALTER TABLE shared_albums ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Add shared_album_id to documents
ALTER TABLE documents ADD COLUMN IF NOT EXISTS shared_album_id UUID REFERENCES shared_albums(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_documents_shared_album_id ON documents(shared_album_id);

-- 3. Prevent duplicate invites
ALTER TABLE shared_album_members ADD CONSTRAINT unique_album_email UNIQUE (shared_album_id, email);

-- 4. Trigger to link new users to pending invites automatically
CREATE OR REPLACE FUNCTION handle_new_user_invites()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update any pending invitations for this email to link to the new user_id
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

-- 5. Trigger to automatically add the Owner as a 'member' (role='owner') for easier querying
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
  ON CONFLICT DO NOTHING; -- In case logic runs twice
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_shared_album_created ON shared_albums;
CREATE TRIGGER on_shared_album_created
  AFTER INSERT ON shared_albums
  FOR EACH ROW EXECUTE FUNCTION add_owner_as_member();


-- 6. Update Documents RLS for Shared Uploads & Deletes

-- Drop old policies to replace them
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;


-- INSERT POLICY: 
-- Allow if:
-- 1. Personal upload (shared_album_id IS NULL)
-- 2. OR Shared upload AND user is Owner OR Member with upload role
CREATE POLICY "Users can insert documents" ON documents
  FOR INSERT WITH CHECK (
    auth.uid() = user_id -- Must always be the uploader
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

-- DELETE POLICY:
-- Strict: Only the Owner of the album can delete shared files.
-- Users can delete their own PRIVATE files.
-- Users CANNOT delete their own SHARED files (to prevent data loss for the group), unless they are the album owner.
CREATE POLICY "Users can delete documents" ON documents
  FOR DELETE USING (
      -- Case 1: Private document
      (shared_album_id IS NULL AND auth.uid() = user_id)
      OR
      -- Case 2: Shared document, ONLY Album Owner can delete
      (shared_album_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM shared_albums
          WHERE id = documents.shared_album_id
          AND owner_id = auth.uid()
      ))
  );

-- UPDATE POLICY:
-- Similar to Delete, usually we don't allow editing files in this V1, but let's allow renaming if you are owner/uploader?
-- Plan says: "Edit files: Owner OK, Shared User NO".
CREATE POLICY "Users can update documents" ON documents
  FOR UPDATE USING (
      -- Case 1: Private document
      (shared_album_id IS NULL AND auth.uid() = user_id)
      OR
      -- Case 2: Shared document, ONLY Album Owner can edit
      (shared_album_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM shared_albums
          WHERE id = documents.shared_album_id
          AND owner_id = auth.uid()
      ))
  );

-- Securely fetch documents for a shared album
-- This function verifies that the executing user is a member of the album before returning documents.

CREATE OR REPLACE FUNCTION get_shared_album_documents(album_id uuid)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  name text,
  type text,
  file_path text,
  file_size bigint,
  hash text,
  status text,
  folder_id uuid,
  user_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_folder_id uuid;
BEGIN
  -- 1. Check if user is a member (or owner) of the shared album
  IF NOT EXISTS (
    SELECT 1 FROM shared_albums sa
    LEFT JOIN shared_album_members sam ON sam.shared_album_id = sa.id
    WHERE sa.id = album_id
    AND (
      sa.owner_id = auth.uid() 
      OR sam.user_id = auth.uid() 
      OR sam.email = auth.jwt()->>'email'
    )
  ) THEN
    RAISE EXCEPTION 'Access denied: You are not a member of this shared album';
  END IF;

  -- 2. Get the folder_id associated with the album
  SELECT folder_id INTO target_folder_id
  FROM shared_albums
  WHERE shared_albums.id = album_id;

  IF target_folder_id IS NULL THEN
    RETURN; -- No folder linked, return empty
  END IF;

  -- 3. Return documents from that folder
  RETURN QUERY
  SELECT d.id, d.created_at, d.name, d.type, d.file_path, d.file_size, d.hash, d.status, d.folder_id, d.user_id
  FROM documents d
  WHERE d.folder_id = target_folder_id;
END;
$$;

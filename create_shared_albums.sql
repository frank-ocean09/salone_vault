-- Create shared_albums and shared_album_members

CREATE TABLE IF NOT EXISTS shared_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shared_album_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_album_id uuid REFERENCES shared_albums(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id), -- Optional; invite by email for non-registered users
  email text, -- Email used for invite (redundant if user_id is set)
  role text NOT NULL DEFAULT 'viewer', -- 'viewer' or 'uploader'
  status text NOT NULL DEFAULT 'invited', -- 'invited' or 'accepted'
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz
);

-- Add indexes for quick lookup
CREATE INDEX IF NOT EXISTS idx_shared_album_owner ON shared_albums(owner_id);
CREATE INDEX IF NOT EXISTS idx_shared_album_member_email ON shared_album_members(email);
CREATE INDEX IF NOT EXISTS idx_shared_album_member_user ON shared_album_members(user_id);

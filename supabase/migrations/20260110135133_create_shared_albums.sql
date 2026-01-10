-- Create shared_albums and shared_album_members

CREATE TABLE IF NOT EXISTS shared_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- Changed profiles(id) to auth.users(id) for safety if profiles missing
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shared_album_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_album_id uuid REFERENCES shared_albums(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  email text,
  role text NOT NULL DEFAULT 'viewer',
  status text NOT NULL DEFAULT 'invited',
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz
);

-- Add indexes for quick lookup
CREATE INDEX IF NOT EXISTS idx_shared_album_owner ON shared_albums(owner_id);
CREATE INDEX IF NOT EXISTS idx_shared_album_member_email ON shared_album_members(email);
CREATE INDEX IF NOT EXISTS idx_shared_album_member_user ON shared_album_members(user_id);

-- Enable RLS
ALTER TABLE shared_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_album_members ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can do everything
CREATE POLICY "Owners can manage their shared albums" ON shared_albums
    FOR ALL USING (auth.uid() = owner_id);

-- Policy: Members can view albums they belong to
CREATE POLICY "Members can view shared albums" ON shared_albums
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM shared_album_members
            WHERE shared_album_members.shared_album_id = shared_albums.id
            AND (shared_album_members.user_id = auth.uid() OR shared_album_members.email = auth.jwt()->>'email')
        )
    );

-- Policy: Owners manage members
CREATE POLICY "Owners can manage members" ON shared_album_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM shared_albums
            WHERE shared_albums.id = shared_album_members.shared_album_id
            AND shared_albums.owner_id = auth.uid()
        )
    );

-- Policy: Members can view themselves and other members
CREATE POLICY "Members can view other members" ON shared_album_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM shared_album_members AS me
            WHERE me.shared_album_id = shared_album_members.shared_album_id
            AND (me.user_id = auth.uid() OR me.email = auth.jwt()->>'email')
        )
    );

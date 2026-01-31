-- ==========================================
-- FOLDER SHARING & PERMISSIONS SETUP
-- ==========================================

-- 1. Create Folder Access Table
CREATE TABLE IF NOT EXISTS folder_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_level TEXT NOT NULL CHECK (permission_level IN ('view_only', 'upload_only', 'view_upload')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(folder_id, user_id)
);

-- 2. Add folder_id to activity_logs if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'folder_id') THEN
        ALTER TABLE activity_logs ADD COLUMN folder_id UUID REFERENCES folders(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Enable RLS on folder_access
ALTER TABLE folder_access ENABLE ROW LEVEL SECURITY;

-- 4. Folder Access Policies
CREATE POLICY "Folder owners can manage access"
    ON folder_access FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM folders
            WHERE folders.id = folder_access.folder_id
            AND folders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own access entries"
    ON folder_access FOR SELECT
    USING (user_id = auth.uid());

-- 5. Update Folders RLS
-- We need to allow users to see folders shared with them
DROP POLICY IF EXISTS "Users can view own folders" ON folders;
CREATE POLICY "Users can view own or shared folders"
    ON folders FOR SELECT
    USING (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM folder_access
            WHERE folder_access.folder_id = folders.id
            AND folder_access.user_id = auth.uid()
        )
    );

-- 6. Update Documents RLS
-- View Policy
DROP POLICY IF EXISTS "Users can view documents" ON documents;
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
CREATE POLICY "Users can view documents"
    ON documents FOR SELECT
    USING (
        -- Owner
        user_id = auth.uid()
        OR
        -- Folder Shared (View Only or View & Upload)
        EXISTS (
            SELECT 1 FROM folder_access
            WHERE folder_access.folder_id = documents.folder_id
            AND folder_access.user_id = auth.uid()
            AND folder_access.permission_level IN ('view_only', 'view_upload')
        )
        -- Keep shared album access if it exists (from previous migrations)
        OR
        (shared_album_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM shared_album_members
            WHERE shared_album_id = documents.shared_album_id
            AND (user_id = auth.uid() OR email = auth.jwt()->>'email')
        ))
    );

-- Insert Policy
DROP POLICY IF EXISTS "Users can insert documents" ON documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
CREATE POLICY "Users can insert documents"
    ON documents FOR INSERT
    WITH CHECK (
        -- Regular upload (personal)
        (auth.uid() = user_id AND folder_id IS NULL AND shared_album_id IS NULL)
        OR
        -- Upload to own folder
        (auth.uid() = user_id AND EXISTS (
            SELECT 1 FROM folders WHERE id = documents.folder_id AND user_id = auth.uid()
        ))
        OR
        -- Upload to shared folder (Upload Only or View & Upload)
        (auth.uid() = user_id AND EXISTS (
            SELECT 1 FROM folder_access
            WHERE folder_access.folder_id = documents.folder_id
            AND folder_access.user_id = auth.uid()
            AND folder_access.permission_level IN ('upload_only', 'view_upload')
        ))
        -- Keep shared album insert
        OR
        (auth.uid() = user_id AND shared_album_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM shared_album_members
            WHERE shared_album_id = documents.shared_album_id
            AND (user_id = auth.uid() OR email = auth.jwt()->>'email')
            AND (role = 'uploader' OR role = 'owner')
        ))
    );

-- 7. Add Trigger for updated_at on folder_access
CREATE TRIGGER update_folder_access_updated_at BEFORE UPDATE ON folder_access
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

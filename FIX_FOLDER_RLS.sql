-- ==========================================
-- FIX: INFINITE RECURSION IN FOLDER RLS
-- ==========================================

-- 1. Function to check folder ownership without triggering RLS
-- SECURITY DEFINER allows this function to bypass RLS checks for the folders table lookup
CREATE OR REPLACE FUNCTION is_folder_owner(f_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM folders WHERE id = f_id AND user_id = auth.uid()
    );
$$;

-- 2. Function to get shared folder IDs for a user
-- Breaks recursion by fetching shared folders without checking folder visibility first
CREATE OR REPLACE FUNCTION get_shared_folder_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT folder_id FROM folder_access WHERE user_id = auth.uid();
$$;

-- 3. Update folder_access policies
-- Uses helper function to verify ownership instead of joining folders directly
DROP POLICY IF EXISTS "Folder owners can manage access" ON folder_access;
CREATE POLICY "Folder owners can manage access"
    ON folder_access FOR ALL
    USING (is_folder_owner(folder_id));

-- 4. Update folders policies
-- Uses helper function to fetch shared folders to break the dependency cycle
DROP POLICY IF EXISTS "Users can view own or shared folders" ON folders;
CREATE POLICY "Users can view own or shared folders"
    ON folders FOR SELECT
    USING (
        user_id = auth.uid()
        OR
        id IN (SELECT get_shared_folder_ids())
    );

-- 5. Update documents policies
-- Uses helper functions for more robust and recursion-free access checks
DROP POLICY IF EXISTS "Users can view documents" ON documents;
CREATE POLICY "Users can view documents"
    ON documents FOR SELECT
    USING (
        -- Owner
        user_id = auth.uid()
        OR
        -- Folder Shared (Check via helper)
        folder_id IN (SELECT get_shared_folder_ids())
        OR
        -- Handle nested folder access or shared albums
        (shared_album_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM shared_album_members
            WHERE shared_album_id = documents.shared_album_id
            AND (user_id = auth.uid() OR email = auth.jwt()->>'email')
        ))
    );

-- 6. Reload schema cache
NOTIFY pgrst, 'reload schema';

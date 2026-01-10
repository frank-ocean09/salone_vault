-- Fix RLS Infinite Recursion for Shared Albums

-- 1. Create a secure helper function to check membership
-- This function is SECURITY DEFINER, meaning it runs with the privileges of the creator (postgres),
-- bypassing RLS on the tables it queries. This breaks the infinite recursion.
CREATE OR REPLACE FUNCTION check_shared_album_access(album_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM shared_album_members
    WHERE shared_album_id = album_id
    AND (user_id = auth.uid() OR email = auth.jwt()->>'email')
  );
END;
$$;

-- 2. Drop existing recursive policies
DROP POLICY IF EXISTS "Members can view shared albums" ON shared_albums;
DROP POLICY IF EXISTS "Members can view other members" ON shared_album_members;

-- 3. Re-create policies using the secure helper function
CREATE POLICY "Members can view shared albums" ON shared_albums
    FOR SELECT USING (
        check_shared_album_access(id)
    );

CREATE POLICY "Members can view other members" ON shared_album_members
    FOR SELECT USING (
        check_shared_album_access(shared_album_id)
    );

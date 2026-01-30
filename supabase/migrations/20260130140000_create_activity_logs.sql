-- Create Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    album_id UUID REFERENCES shared_albums(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable if system action or user deleted
    action TEXT NOT NULL, -- 'created', 'invited', 'permission_changed', 'uploaded', 'removed', 'viewed'
    details JSONB, -- Store extra info like file name, invited email, etc.
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for Activity Logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- View Logs: Users can view logs for albums they are members of (including owner)
CREATE POLICY "Members can view activity logs" ON activity_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM shared_album_members
            WHERE shared_album_id = activity_logs.album_id
            AND (user_id = auth.uid() OR email = auth.jwt()->>'email')
        )
    );

-- Insert Logs: Authenticated users can insert logs (usually done via API functions, but good to have policy)
-- meaningful logs should ideally be created by the triggering action/function, but client-side logging is often easier for 'viewed' etc.
-- Let's allow members to insert logs for their albums (e.g. "uploaded document")
CREATE POLICY "Members can insert activity logs" ON activity_logs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM shared_album_members
            WHERE shared_album_id = activity_logs.album_id
            AND (user_id = auth.uid() OR email = auth.jwt()->>'email')
        )
    );

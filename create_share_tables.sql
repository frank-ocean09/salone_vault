-- Create share_tokens table for secure document sharing
CREATE TABLE IF NOT EXISTS share_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
    token TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    max_uses INTEGER DEFAULT NULL,
    uses INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity_logs table for tracking all share-related actions
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    token TEXT,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE share_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for share_tokens
-- Users can view tokens they created
CREATE POLICY "Users can view their own share tokens"
    ON share_tokens FOR SELECT
    USING (auth.uid() = created_by);

-- Users can create share tokens for their documents
CREATE POLICY "Users can create share tokens for their documents"
    ON share_tokens FOR INSERT
    WITH CHECK (
        auth.uid() = created_by AND
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = share_tokens.document_id
            AND documents.user_id = auth.uid()
        )
    );

-- Users can update (revoke) their own share tokens
CREATE POLICY "Users can update their own share tokens"
    ON share_tokens FOR UPDATE
    USING (auth.uid() = created_by);

-- Users can delete their own share tokens
CREATE POLICY "Users can delete their own share tokens"
    ON share_tokens FOR DELETE
    USING (auth.uid() = created_by);

-- RLS Policies for activity_logs
-- Users can view their own activity logs
CREATE POLICY "Users can view their own activity logs"
    ON activity_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own activity logs
CREATE POLICY "Users can insert their own activity logs"
    ON activity_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_share_tokens_token ON share_tokens(token);
CREATE INDEX IF NOT EXISTS idx_share_tokens_document_id ON share_tokens(document_id);
CREATE INDEX IF NOT EXISTS idx_share_tokens_created_by ON share_tokens(created_by);
CREATE INDEX IF NOT EXISTS idx_share_tokens_expires_at ON share_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_document_id ON activity_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

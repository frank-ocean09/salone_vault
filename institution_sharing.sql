-- Institution Management
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL, -- e.g., 'SLP', 'MOH'
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add institution_id to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES institutions(id);

-- Inter-institution document sharing
CREATE TABLE IF NOT EXISTS institution_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
    from_institution_id UUID REFERENCES institutions(id) NOT NULL,
    to_institution_id UUID REFERENCES institutions(id) NOT NULL,
    permission TEXT CHECK (permission IN ('view', 'upload', 'both')) DEFAULT 'view',
    shared_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add claim support to documents for citizen delivery
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS claim_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS claimed BOOLEAN DEFAULT FALSE;

-- Enable RLS
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Institutions are readable by all authenticated users" 
ON institutions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Institution shares visibility" 
ON institution_shares FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.institution_id = from_institution_id OR profiles.institution_id = to_institution_id)
    )
);

CREATE POLICY "Institution shares insertion" 
ON institution_shares FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.institution_id = from_institution_id
        AND profiles.role IN ('issuer', 'admin')
    )
);

-- Insert seed data for institutions
INSERT INTO institutions (name, code) VALUES 
('Sierra Leone Police', 'SLP'),
('Ministry of Health', 'MOH'),
('Ministry of Lands', 'MOL'),
('University of Sierra Leone', 'USL')
ON CONFLICT (code) DO NOTHING;

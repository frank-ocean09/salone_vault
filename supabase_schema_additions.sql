-- Add issuer column to documents and set via trigger
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS issuer TEXT;

-- Add blockchain fields if not present
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS blockchain_address TEXT,
ADD COLUMN IF NOT EXISTS anchor_tx TEXT,
ADD COLUMN IF NOT EXISTS anchored_at TIMESTAMPTZ;

-- Add folder name to documents for organizing files
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS folder_name TEXT;

-- Add snapshot columns to verification_tokens
ALTER TABLE verification_tokens
ADD COLUMN IF NOT EXISTS document_type_snapshot TEXT,
ADD COLUMN IF NOT EXISTS issuer_snapshot TEXT,
ADD COLUMN IF NOT EXISTS blockchain_address_snapshot TEXT,
ADD COLUMN IF NOT EXISTS file_hash TEXT,
ADD COLUMN IF NOT EXISTS document_snapshot JSONB;

-- Ensure verification_tokens has expires_at column (may already exist)
ALTER TABLE verification_tokens
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Create index on blockchain_address
CREATE INDEX IF NOT EXISTS idx_documents_blockchain_address ON documents(blockchain_address);

-- Create index on token
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);

-- Trigger function to auto-assign issuer before insert
CREATE OR REPLACE FUNCTION set_document_issuer()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.issuer IS NULL THEN
    CASE NEW.type
      WHEN 'Birth Certificate' THEN NEW.issuer := 'Births & Deaths';
      WHEN 'National ID Card' THEN NEW.issuer := 'NCRA';
      WHEN 'Passport' THEN NEW.issuer := 'Immigration Department';
      WHEN 'Voter ID' THEN NEW.issuer := 'Electoral Commission';
      WHEN 'Driver''s License' THEN NEW.issuer := 'DMV';
      WHEN 'Academic Certificate' THEN NEW.issuer := 'Ministry of Education / Institution';
      ELSE NEW.issuer := 'Unknown Issuer';
    END CASE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger
DROP TRIGGER IF EXISTS trg_set_document_issuer ON documents;
CREATE TRIGGER trg_set_document_issuer
BEFORE INSERT ON documents
FOR EACH ROW EXECUTE FUNCTION set_document_issuer();

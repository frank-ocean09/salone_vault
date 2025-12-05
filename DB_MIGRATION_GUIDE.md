# Database Migration - Add Verification Token Snapshot Columns

## Problem
The `verification_tokens` table is missing snapshot columns required by the Dashboard's share link creation:
- `document_type_snapshot`
- `issuer_snapshot`
- `blockchain_address_snapshot`
- `file_hash`

## Solution
Run the updated SQL migration to add these columns.

## Steps to Apply

### Option 1: Via Supabase Dashboard (Recommended - Quickest)

1. Go to https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** → **New Query**
4. Copy and paste the SQL below
5. Click **Run**

### Option 2: Via Supabase CLI

```bash
cd "c:\Users\Rugiatu\Documents\Coding Project\hackathon"
supabase db push  # Applies migrations from ./supabase/migrations/
```

### SQL to Execute

```sql
-- Add issuer column to documents and set via trigger
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS issuer TEXT;

-- Add blockchain fields if not present
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS blockchain_address TEXT,
ADD COLUMN IF NOT EXISTS anchor_tx TEXT,
ADD COLUMN IF NOT EXISTS anchored_at TIMESTAMPTZ;

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
```

## What Gets Added

| Column | Type | Purpose |
|--------|------|---------|
| `document_type_snapshot` | TEXT | Stores document type at token creation time |
| `issuer_snapshot` | TEXT | Stores issuer at token creation time |
| `blockchain_address_snapshot` | TEXT | Stores blockchain address at token creation time |
| `file_hash` | TEXT | Stores file hash for verification |
| `document_snapshot` | JSONB | Full document metadata snapshot in JSON |
| `expires_at` | TIMESTAMPTZ | When token expires (already exists, just ensuring it's there) |

## Indexes Added

- `idx_documents_blockchain_address` — Fast lookups by blockchain address
- `idx_verification_tokens_token` — Fast token lookups during verification

## Trigger Added

- `set_document_issuer()` — Automatically assigns issuer based on document type if not explicitly set
- `trg_set_document_issuer` — Runs before each document insert

## After Running

Once the migration completes:
1. Refresh the browser (http://localhost:5174)
2. Try creating a share link again
3. The verification token should now be created successfully

## Verification

You can verify the columns exist by running in Supabase SQL Editor:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'verification_tokens'
ORDER BY ordinal_position;
```

Should show all the new columns listed above.

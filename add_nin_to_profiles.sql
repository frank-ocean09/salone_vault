-- Add NIN column to profiles table
ALTER TABLE profiles
ADD COLUMN nin TEXT UNIQUE;

-- Add a check constraint to ensure NIN follows a specific format (e.g., 8 digits)
ALTER TABLE profiles
ADD CONSTRAINT chk_nin_format CHECK (nin ~ '^[0-9]{8}$');

-- Update Row Level Security (RLS) policies to include NIN-based access control
-- Example: Allow government users to access profiles by NIN
CREATE POLICY "Allow government users to access profiles by NIN"
ON profiles
FOR SELECT
USING (
  auth.role() = 'government' AND nin IS NOT NULL
);
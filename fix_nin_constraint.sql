-- ========================================================
-- SQL SCRIPT TO UPDATE NIN CONSTRAINT TO BE ALPHANUMERIC
-- ========================================================
-- Run this script in your Supabase SQL Editor on your live site

-- 1. Drop the existing 8-digit numeric-only check constraint
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS chk_nin_format;

-- 2. Add the new alphanumeric check constraint (allows 4 to 15 alphanumeric characters)
ALTER TABLE profiles 
ADD CONSTRAINT chk_nin_format 
CHECK (nin ~ '^[a-zA-Z0-9]{4,15}$');

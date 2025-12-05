-- Add Folder Support to Documents Table
-- Run this in your Supabase SQL Editor

-- Add folder column to documents table
ALTER TABLE documents
ADD COLUMN folder TEXT DEFAULT NULL;

-- Add index for better query performance
CREATE INDEX idx_documents_folder ON documents(folder);

-- Add index for user_id + folder combination
CREATE INDEX idx_documents_user_folder ON documents(user_id, folder);

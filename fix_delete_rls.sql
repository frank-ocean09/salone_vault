-- Fix RLS Policies for Document Deletion
-- Run this script in your Supabase SQL Editor

-- 1. Add DELETE policy for verification_tokens
-- This allows users to delete verification tokens for documents they own
CREATE POLICY "Users can delete their own verification tokens"
ON verification_tokens
FOR DELETE
USING (
  document_id IN (
    SELECT id FROM documents WHERE user_id = auth.uid()
  )
);

-- 2. Verify the policy was created
-- You should see this policy listed in the verification_tokens RLS policies

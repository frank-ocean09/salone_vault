-- Add foreign key relationship between folders and profiles to enable Supabase joins
ALTER TABLE folders 
DROP CONSTRAINT IF EXISTS folders_user_id_fkey_profiles;

ALTER TABLE folders
ADD CONSTRAINT folders_user_id_fkey_profiles 
FOREIGN KEY (user_id) REFERENCES profiles(id);

-- Also do the same for documents if we need owner info there later
ALTER TABLE documents
DROP CONSTRAINT IF EXISTS documents_user_id_fkey_profiles;

ALTER TABLE documents
ADD CONSTRAINT documents_user_id_fkey_profiles
FOREIGN KEY (user_id) REFERENCES profiles(id);

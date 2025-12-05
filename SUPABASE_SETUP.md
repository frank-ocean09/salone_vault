# Supabase Setup Guide

This document provides step-by-step instructions to set up the Supabase backend for the National Digital Document Vault.

## Prerequisites

- A Supabase project (create at https://supabase.com)
- Access to your project's SQL editor
- Your project URL and anon key (from Settings → API)

## Setup Steps

### 1. Create Database Tables

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** section
3. Click **New Query** and paste the contents of `supabase_schema.sql`
4. Click **Run** to execute all SQL commands
5. Verify all tables are created by checking the **Tables** section in the left sidebar

You should see:
- `profiles` table
- `documents` table
- `verification_tokens` table

### 2. Create Storage Bucket

1. In Supabase, go to **Storage** → **Buckets**
2. Click **Create a new bucket**
3. Name it: `documents`
4. Set access policy to **Public**
5. Click **Create bucket**

### 3. Set Environment Variables

1. In the repo root, create a file named `.env.local` (if not already present)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```

3. Get these values from your Supabase project:
   - Settings → API → Project URL
   - Settings → API → Project API keys (anon public key)

### 4. Enable Email Auth (Optional but Recommended)

1. Go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. Configure email templates if desired

### 5. Test the Setup

1. In the terminal, run:
```bash
npm run dev
```

2. Open the browser console (DevTools → Console)
3. Look for messages starting with `[supabase]` to confirm env vars are loaded
4. Navigate to http://localhost:5173
5. Try signing up with a test email
6. After sign-up, you should be able to navigate to "My Vault" (dashboard)
7. Try uploading a test PDF or image file

### 6. Troubleshooting

#### 401 Unauthorized on Document Queries

**Symptom:** Upload works but dashboard shows error fetching documents.

**Solution:** The RLS policies should allow authenticated users to access their own documents. If you still see 401s:

1. Check that the `documents` table RLS policies are enabled (see schema.sql)
2. Ensure the logged-in user has a session JWT (check browser DevTools → Application → Cookies for `sb-*` token)
3. For development, temporarily create a permissive policy:

```sql
-- DEVELOPMENT ONLY - REMOVE FOR PRODUCTION
CREATE POLICY "allow_public_select_documents"
  ON documents
  FOR SELECT
  USING (true);
```

#### Storage Bucket Not Found

**Symptom:** Upload fails with "bucket not found" error.

**Solution:**
1. Verify the `documents` bucket exists in Storage
2. Verify access policy is set to **Public**
3. Restart the dev server after creating the bucket

#### Auth Users Not Created

**Symptom:** Sign-up seems to work but user can't log in.

**Solution:**
1. Check your Supabase **Auth** → **Users** page to see if the user was created
2. Check email confirmations settings (some require email verification)
3. Check auth logs in Supabase for error messages

## File Locations

- **Schema**: `supabase_schema.sql` (run this in SQL Editor)
- **Environment vars**: `.env.local` (create this locally, DO NOT commit)
- **Upload API**: `src/lib/api.ts` (core upload logic)
- **Supabase client**: `src/lib/supabase.ts` (client initialization)
- **Dashboard**: `src/pages/Dashboard.tsx` (upload UI)

## Next Steps

Once your Supabase project is set up:
1. Sign up at http://localhost:5173/auth
2. Navigate to "My Vault" (dashboard)
3. Click "Upload Document" and select a PDF or image
4. Share the verification link with others to let them verify your document!

---

For more help, see:
- Supabase Docs: https://supabase.com/docs
- Project README: README.md

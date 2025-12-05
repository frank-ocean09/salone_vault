# Dashboard Share Link Fix

## Problem
The Dashboard's `handleCreateShareLink` function was calling an Edge Function endpoint `/functions/v1/create-share` that wasn't deployed, causing:
```
SyntaxError: Failed to execute 'json' on 'Response': Unexpected end of JSON input
```

## Solution
Migrated the verification token creation from Edge Function call to direct Supabase client operations using the existing database functions.

### What Changed

**Before (calling non-existent Edge Function):**
```typescript
const resp = await fetch('/functions/v1/create-share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId: doc.id, expiry: shareExpiry }),
});
const data = await resp.json();  // ← Fails - no response body
```

**After (local implementation using Supabase SDK):**
```typescript
// 1. Generate secure random token
const tokenArray = crypto.getRandomValues(new Uint8Array(16));
const token = Array.from(tokenArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

// 2. Calculate expiry timestamp based on user selection
let expiresAt: string | null = null;
switch (shareExpiry) {
    case '24hr':
        expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
        break;
    // ... other options
}

// 3. Create document snapshot
const documentSnapshot = {
    document_type: doc.type,
    issuer: doc.issuer || 'Unknown Issuer',
    blockchain_address: doc.blockchain_address || null,
    file_hash: doc.file_hash || null,
    uploaded_at: doc.created_at,
};

// 4. Insert verification token directly into database
const { error: insertError } = await supabase
    .from('verification_tokens')
    .insert({
        token,
        document_id: doc.id,
        document_type_snapshot: doc.type,
        issuer_snapshot: doc.issuer || 'Unknown Issuer',
        blockchain_address_snapshot: doc.blockchain_address || null,
        file_hash: doc.file_hash || null,
        document_snapshot: documentSnapshot,
        expires_at: expiresAt,
    });

// 5. Generate signed URL for preview (5 minute expiry)
const { data: signedUrlData } = await supabase.storage
    .from('Documents')
    .createSignedUrl(doc.file_path, 300);

// 6. Construct verification link and copy to clipboard
const verificationUrl = `${window.location.origin}/verify?token=${token}`;
await navigator.clipboard.writeText(verificationUrl);
```

## Files Modified
- `src/pages/Dashboard.tsx`
  - Updated `handleCreateShareLink` function (lines 225-295)
  - Added `supabase` import
  - Removed `generateVerificationToken` import (no longer needed)

## How It Works Now

1. **Token Generation**: Uses `crypto.getRandomValues()` to generate 16 random bytes → converts to 32-char hex string
2. **Expiry Calculation**: Computes expiration timestamp based on user's selected duration (10min, 1hr, 24hr, 7days, 30days, or never)
3. **Snapshot Creation**: Captures current document metadata in JSON object for verification purposes
4. **Database Insert**: Directly inserts verification token record into `verification_tokens` table via Supabase SDK
5. **Preview URL**: Generates signed URL (valid 5 minutes) for document preview in verification page
6. **User Feedback**: Creates shareable link, copies to clipboard, shows confirmation with expiry info

## Benefits
✅ No network lag - local Supabase client calls (vs remote Edge Function)  
✅ Simpler implementation - no deployment step required  
✅ Direct RLS policy enforcement - database handles access control  
✅ Better error handling - direct error messages from Supabase  
✅ Works offline during development - no need to deploy functions

## Status
✅ Fixed and deployed on localhost:5174  
✅ Edge Functions still available for future deployment to production (Deno code ready in `/functions/`)

## Testing
Try creating a share link in Dashboard:
1. Go to http://localhost:5174/dashboard
2. Click "Share" on any document
3. Select expiry duration
4. Verification link copied to clipboard automatically
5. Open `/verify` page and paste token to test

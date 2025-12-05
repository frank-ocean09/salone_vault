# Supabase Edge Functions Deployment & Integration Guide

This guide covers deploying Edge Functions, setting secrets, integrating with frontend, and security best practices.

## 📁 Folder Structure

```
functions/
├── create-share/
│   └── index.ts          # Generate verification token + snapshot
├── verify-token/
│   └── index.ts          # Validate token + compare hash (tamper detection)
└── anchor-hash/
    └── index.ts          # Optional: Blockchain anchoring
```

Each function is automatically deployed to: `https://<project-ref>.supabase.co/functions/v1/<function-name>`

---

## 🚀 Deployment Steps (PowerShell)

### Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- Authenticated: `supabase login`
- Project ref (find at: Supabase Dashboard → Settings → General → Project Ref)

### Step 1: Deploy Functions

```powershell
# Set your project ref
$PROJECT_REF = "your_project_ref_here"

# Deploy create-share function
supabase functions deploy create-share --project-ref $PROJECT_REF

# Deploy verify-token function
supabase functions deploy verify-token --project-ref $PROJECT_REF

# Deploy anchor-hash function (optional)
supabase functions deploy anchor-hash --project-ref $PROJECT_REF
```

**Output**: Each deploy returns function URL and status.

### Step 2: Set Secrets

```powershell
# Get your service role key from Supabase Dashboard → Settings → API
$SERVICE_ROLE_KEY = "your_service_role_key_here"
$SUPABASE_URL = "https://your-project.supabase.co"

# Set secrets for create-share and verify-token
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" --project-ref $PROJECT_REF
supabase secrets set SUPABASE_URL="$SUPABASE_URL" --project-ref $PROJECT_REF

# Optional: Set secrets for anchor-hash (if using blockchain)
$BLOCKCHAIN_RPC_URL = "https://mainnet.infura.io/v3/your_key"
$BLOCKCHAIN_SIGNER_KEY = "your_private_key"  # KEEP SECURE!
$BLOCKCHAIN_CONTRACT_ADDRESS = "0x..."

supabase secrets set BLOCKCHAIN_RPC_URL="$BLOCKCHAIN_RPC_URL" --project-ref $PROJECT_REF
supabase secrets set BLOCKCHAIN_SIGNER_KEY="$BLOCKCHAIN_SIGNER_KEY" --project-ref $PROJECT_REF
supabase secrets set BLOCKCHAIN_CONTRACT_ADDRESS="$BLOCKCHAIN_CONTRACT_ADDRESS" --project-ref $PROJECT_REF
```

### Step 3: Verify Deployment

```powershell
# List deployed functions
supabase functions list --project-ref $PROJECT_REF

# View function logs (follow live updates)
supabase functions logs create-share --project-ref $PROJECT_REF --follow
supabase functions logs verify-token --project-ref $PROJECT_REF --follow
```

---

## 🔐 Security Best Practices

### 1. Service Role Key Management
- **Never expose to client**: Service role key is privileged; only use in Edge Functions.
- **Rotate regularly**: Update key every 90 days via Supabase Dashboard.
- **Audit access**: Monitor function logs for suspicious activity.

### 2. Signed URLs
- **Expiry**: Set short expiry (60-300 seconds) to minimize window of exposure.
- **Access logs**: Storage bucket logs all signed URL downloads (enable in Settings).
- **One-time use**: Consider implementing single-use URLs for sensitive documents (custom logic).

### 3. RLS Policies (Row-Level Security)

Add these RLS policies to your `documents` and `verification_tokens` tables:

```sql
-- documents table RLS

-- Authenticated users can view their own documents
CREATE POLICY "Users can view own documents"
ON documents FOR SELECT
USING (auth.uid() = user_id);

-- Authenticated users can insert their own documents
CREATE POLICY "Users can upload documents"
ON documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Service role (via Edge Functions) can update issuer/blockchain fields
CREATE POLICY "Service role can update document metadata"
ON documents FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- verification_tokens table RLS

-- Anyone can view a token (public verification)
CREATE POLICY "Token lookup is public"
ON verification_tokens FOR SELECT
USING (true);

-- Only service role can create tokens (via Edge Function)
CREATE POLICY "Only service role can create tokens"
ON verification_tokens FOR INSERT
WITH CHECK (auth.role() = 'service_role');
```

Enable RLS on both tables:
```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
```

### 4. Storage Bucket Permissions

```sql
-- Make Documents bucket private (authenticated uploads only)
UPDATE storage.buckets
SET public = false
WHERE name = 'Documents';

-- Add storage policy: authenticated users can upload to their folder
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'Documents' AND
  auth.role() = 'authenticated'
);

-- Service role can read all files (for signed URLs)
CREATE POLICY "Service role can read all files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'Documents' AND
  auth.role() = 'service_role'
);
```

### 5. Rate Limiting (Optional)

Implement rate limiting on Edge Functions to prevent abuse:

```typescript
// Add to create-share/index.ts or verify-token/index.ts

// Simple in-memory rate limiter (restart resets counts)
const requestCounts: { [key: string]: number[] } = {};

function isRateLimited(clientIp: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  if (!requestCounts[clientIp]) requestCounts[clientIp] = [];
  
  // Remove old requests outside window
  requestCounts[clientIp] = requestCounts[clientIp].filter(t => now - t < windowMs);
  
  if (requestCounts[clientIp].length >= limit) {
    return true; // Rate limited
  }
  
  requestCounts[clientIp].push(now);
  return false;
}

// Use: if (isRateLimited(req.headers.get('x-forwarded-for') || 'unknown')) { return 429 response }
```

---

## 📱 Frontend Integration Examples

### Upload Document & Create Share Link (Dashboard.tsx)

```typescript
// src/pages/Dashboard.tsx

async function handleCreateShareLink(documentId: string, expiry: "10min" | "1hr" | "24hr" | "7days" | "30days" | "never") {
  try {
    // Call Edge Function to create verification token
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-share`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Optional: Include auth token if function requires it
          // "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          documentId,
          expiry,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error("Failed to create share link:", data.error);
      toast.error(`Error: ${data.error || "Failed to create link"}`);
      return;
    }

    // data.token: verification token (shareable)
    // data.preview_url: signed URL for document preview (valid 5 min)
    // data.expires_at: expiry timestamp

    const verificationLink = `${window.location.origin}/verify?token=${data.token}`;
    
    // Copy to clipboard
    await navigator.clipboard.writeText(verificationLink);
    toast.success(`Link copied! Expires ${data.expires_at ? new Date(data.expires_at).toLocaleString() : 'never'}`);

    // Optionally store token in DB or display in modal
    console.log("Token:", data.token);
    console.log("Verification Link:", verificationLink);
    console.log("Preview URL:", data.preview_url);
  } catch (error) {
    console.error("Share link error:", error);
    toast.error("Failed to create share link");
  }
}
```

### Verify Token & Display Results (Verify.tsx)

```typescript
// src/pages/Verify.tsx

async function handleVerify(token: string) {
  try {
    setLoading(true);

    // Call Edge Function to verify token
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      if (response.status === 404) {
        setError("Token not found");
      } else if (response.status === 410) {
        setError("Token has expired");
      } else {
        setError(data.error || "Verification failed");
      }
      return;
    }

    // data.verified: boolean (hash matches snapshot)
    // data.document: { name, type, issuer, blockchain_address, uploaded_at }
    // data.file: { preview_url, computed_hash, snapshot_hash }

    setVerificationResult({
      verified: data.verified,
      document: data.document,
      file: data.file,
    });

    setError(null);
  } catch (error) {
    console.error("Verify error:", error);
    setError("Network error during verification");
  } finally {
    setLoading(false);
  }
}

// Display verification result
{
  verificationResult && (
    <div className="mt-6 p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Verification Result</h2>
      
      <div className={`p-3 mb-4 rounded ${
        verificationResult.verified 
          ? "bg-green-100 text-green-800" 
          : "bg-red-100 text-red-800"
      }`}>
        {verificationResult.verified ? "✓ Document Verified" : "✗ Document Not Verified"}
      </div>

      <div className="space-y-2 text-sm">
        <p><strong>Name:</strong> {verificationResult.document.name}</p>
        <p><strong>Type:</strong> {verificationResult.document.type}</p>
        <p><strong>Issuer:</strong> {verificationResult.document.issuer}</p>
        <p><strong>Blockchain:</strong> {verificationResult.document.blockchain_address || "Not anchored"}</p>
        <p><strong>Uploaded:</strong> {new Date(verificationResult.document.uploaded_at).toLocaleString()}</p>
        
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-xs font-mono">
            <strong>Computed Hash:</strong> {verificationResult.file.computed_hash}
          </p>
          <p className="text-xs font-mono mt-2">
            <strong>Snapshot Hash:</strong> {verificationResult.file.snapshot_hash}
          </p>
        </div>

        {verificationResult.file.preview_url && (
          <a 
            href={verificationResult.file.preview_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block px-4 py-2 bg-blue-600 text-white rounded text-center"
          >
            View Document Preview (60 sec)
          </a>
        )}
      </div>
    </div>
  )
}
```

---

## 🧪 Testing Functions Locally

### Using curl (PowerShell)

```powershell
# Create Share Link
$token = "test_token_12345"
$response = Invoke-WebRequest `
  -Uri "http://localhost:54321/functions/v1/create-share" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body (@{
    documentId = "doc-uuid-here"
    expiry = "1hr"
  } | ConvertTo-Json)

$response.Content | ConvertFrom-Json

# Verify Token
$response = Invoke-WebRequest `
  -Uri "http://localhost:54321/functions/v1/verify-token" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body (@{
    token = "token-from-create-share"
  } | ConvertTo-Json)

$response.Content | ConvertFrom-Json
```

### Using Supabase Local Dev

```powershell
# Start local Supabase stack
supabase start

# Functions run at: http://localhost:54321/functions/v1/

# View logs
supabase functions logs create-share --local

# Stop when done
supabase stop
```

---

## 📊 Monitoring & Debugging

### View Function Logs (Production)

```powershell
# Stream logs in real-time
supabase functions logs create-share --project-ref $PROJECT_REF --follow

# View logs for specific time range
supabase functions logs verify-token --project-ref $PROJECT_REF --limit 100
```

### Check Function Status

```powershell
# List all functions with their URLs
supabase functions list --project-ref $PROJECT_REF

# Check specific function info
supabase functions describe create-share --project-ref $PROJECT_REF
```

### Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Module not found" error | JSR import incorrect | Ensure `import { createClient } from "jsr:@supabase/supabase-js@2"` |
| "Missing SUPABASE_URL" | Secret not set | Run `supabase secrets set SUPABASE_URL="..."` |
| 401 Unauthorized | Service role key invalid | Verify key in Supabase Dashboard → Settings → API |
| 404 Token not found | Token doesn't exist or expired | Check database for token record |
| CORS errors | Function not handling OPTIONS | Ensure CORS preflight handler in code |
| 413 Payload too large | Document too large | Set file size limits (e.g., 50MB max) |

---

## 🔄 Optional: Blockchain Anchoring Setup

To enable blockchain anchoring (Ethereum or Polygon):

1. **Deploy Smart Contract**:
   ```solidity
   // contracts/DocumentAnchor.sol
   pragma solidity ^0.8.0;

   contract DocumentAnchor {
     mapping(string => string) public anchors; // documentId => fileHash
     event Anchored(string indexed documentId, string fileHash);

     function anchorHash(string calldata documentId, string calldata fileHash) external {
       anchors[documentId] = fileHash;
       emit Anchored(documentId, fileHash);
     }

     function getHash(string calldata documentId) external view returns (string memory) {
       return anchors[documentId];
     }
   }
   ```

2. **Deploy to blockchain** (Ethereum Mainnet, Polygon, etc.)

3. **Set secrets**:
   ```powershell
   supabase secrets set BLOCKCHAIN_RPC_URL="https://..." --project-ref $PROJECT_REF
   supabase secrets set BLOCKCHAIN_SIGNER_KEY="0x..." --project-ref $PROJECT_REF
   supabase secrets set BLOCKCHAIN_CONTRACT_ADDRESS="0x..." --project-ref $PROJECT_REF
   ```

4. **Implement ethers.js logic** in `functions/anchor-hash/index.ts`

---

## 🎯 Next Steps

1. ✅ Deploy create-share and verify-token functions
2. ✅ Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY secrets
3. ✅ Update RLS policies in Supabase
4. ✅ Integrate frontend fetch calls
5. ✅ Test end-to-end: upload → create share → verify
6. ✅ (Optional) Set up blockchain anchoring
7. ✅ Monitor logs and optimize performance

---

## 📚 References

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)
- [Deno Manual](https://deno.land/manual)
- [Supabase JS v2 Client](https://supabase.com/docs/reference/javascript/introduction)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)

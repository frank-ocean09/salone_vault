/**
 * Frontend Integration Examples for Edge Functions
 * 
 * This file contains TypeScript code examples for integrating Edge Functions
 * into your Dashboard and Verify pages. All JSX code is shown in comments
 * so this file compiles as valid TypeScript.
 * 
 * COPY these functions into your actual React components (Dashboard.tsx, Verify.tsx)
 */

// ============================================================
// 1. TYPES USED BY BOTH FUNCTIONS
// ============================================================

interface ShareLinkResult {
  token: string;
  verificationLink: string;
  preview_url: string | null;
  expires_at: string | null;
}

interface VerificationResult {
  verified: boolean;
  document: {
    id: string;
    name: string;
    type: string;
    issuer: string;
    uploaded_by: string;
    file_size: number;
    mime_type: string;
    blockchain_address: string | null;
    anchor_tx: string | null;
  };
  file: {
    verified_at: string;
    preview_url: string | null;
    file_hash: string;
  };
}

// ============================================================
// 2. DASHBOARD.tsx - CREATE SHARE LINK FUNCTION
// ============================================================

/*
Add these imports to Dashboard.tsx:
  import { useState } from 'react';
  import { useToast } from '@/hooks/useToast';

Add this state hook in your Dashboard component:
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const { toast } = useToast();

Then add this function to your Dashboard component:
*/

export async function handleCreateShareLinkExample(
  documentId: string,
  expiry: "10min" | "1hr" | "24hr" | "7days" | "30days" | "never"
): Promise<ShareLinkResult | void> {
  // NOTE: In real implementation, wrap in try/finally with setIsCreatingLink state

  try {
    // Call Edge Function to create verification token
    const response = await fetch(
      `${(import.meta as any).env.VITE_SUPABASE_URL}/functions/v1/create-share`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization is optional for public functions.
          // If you want to require auth, uncomment:
          // "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`
        },
        body: JSON.stringify({
          documentId,
          expiry,
        }),
      }
    );

    const data = await response.json();

    // Check for HTTP errors
    if (!response.ok) {
      console.error("Edge Function error:", data);
      // In real component: toast.error(`Failed to create link: ${data.error || "Unknown error"}`);
      return;
    }

    // Check for function-level errors
    if (!data.success) {
      console.error("Function returned error:", data);
      // In real component: toast.error(`Error: ${data.error}`);
      return;
    }

    // Success! Extract token and URLs
    const { token, preview_url, expires_at } = data;

    // Construct shareable verification link
    const verificationLink = `${window.location.origin}/verify?token=${token}`;

    // Copy to clipboard
    await navigator.clipboard.writeText(verificationLink);

    // Notify user
    const expiryText = expires_at
      ? `Expires: ${new Date(expires_at).toLocaleString()}`
      : "Never expires";

    // In real component: toast.success(`Link copied! ${expiryText}`);
    console.log(`Link copied! ${expiryText}`);

    console.log("Share link created:", {
      token,
      verificationLink,
      preview_url,
      expires_at,
    });

    return {
      token,
      verificationLink,
      preview_url,
      expires_at,
    };
  } catch (error) {
    console.error("Create share error:", error);
    // In real component: toast.error("Network error while creating link");
  }
}

/*
JSX EXAMPLE - Add a button in your Dashboard component's render/return:

<button
  onClick={() => handleCreateShareLink("document-uuid-here", "24hr")}
  disabled={isCreatingLink}
  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
>
  {isCreatingLink ? "Creating link..." : "Create 24hr Share Link"}
</button>

For other expiry options, use similar buttons:
- handleCreateShareLink(docId, "10min")
- handleCreateShareLink(docId, "1hr")
- handleCreateShareLink(docId, "7days")
- handleCreateShareLink(docId, "30days")
- handleCreateShareLink(docId, "never")
*/

// ============================================================
// 3. VERIFY.tsx - TOKEN VERIFICATION FUNCTION
// ============================================================

/*
Add these imports to Verify.tsx:
  import { useState, useEffect } from 'react';
  import { useSearchParams } from 'react-router-dom';

Add these state hooks in your Verify component:
  const [searchParams] = useSearchParams();
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

Then add this function to your Verify component:
*/

export async function handleVerifyExample(token: string): Promise<void> {
  // NOTE: In real implementation, these would be state setters from useState hooks:
  // const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  // const [error, setError] = useState<string | null>(null);
  // const [loading, setLoading] = useState(false);

  try {
    // setLoading(true);
    // setError(null);
    // setVerificationResult(null);

    // Validate token format
    if (!token || token.trim().length === 0) {
      console.error("Please enter a verification token");
      // setError("Please enter a verification token");
      return;
    }

    // Call Edge Function to verify token
    const response = await fetch(
      `${(import.meta as any).env.VITE_SUPABASE_URL}/functions/v1/verify-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: token.trim() }),
      }
    );

    const data = await response.json();

    // Handle HTTP error responses
    if (!response.ok) {
      if (response.status === 404) {
        // setError("Token not found. Please check and try again.");
        console.error("Token not found");
      } else if (response.status === 410) {
        // setError("Token has expired. Request a new share link.");
        console.error("Token has expired");
      } else {
        // setError(`Error: ${data.error || "Verification failed"}`);
        console.error("Verification error:", data);
      }
      return;
    }

    // Check function success flag
    if (!data.success) {
      // setError(data.error || "Verification failed");
      console.error("Verification failed:", data.error);
      return;
    }

    // Success! Store verification result
    const result: VerificationResult = {
      verified: data.verified,
      document: data.document,
      file: data.file,
    };

    // setVerificationResult(result);
    console.log("Verification successful:", result);
  } catch (error) {
    console.error("Verify function error:", error);
    // setError("Network error. Please check your connection and try again.");
  } finally {
    // setLoading(false);
  }
}

/*
SETUP in useEffect for Verify.tsx:

useEffect(() => {
  const token = searchParams.get("token");
  if (token && !verificationResult && !loading) {
    handleVerify(token);
  }
}, [searchParams, verificationResult, loading]);

JSX EXAMPLE - Add input and display in your Verify component's render/return:

<div className="space-y-6">
  <div>
    <input
      type="text"
      placeholder="Paste verification token here..."
      onKeyPress={(e) => {
        if (e.key === "Enter") {
          handleVerify(e.currentTarget.value);
        }
      }}
      className="w-full px-4 py-2 border rounded"
    />
    <button
      onClick={(e) =>
        handleVerify(
          (e.currentTarget.previousElementSibling as HTMLInputElement).value
        )
      }
      disabled={loading}
      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      {loading ? "Verifying..." : "Verify Document"}
    </button>
  </div>

  {error && (
    <div className="p-4 bg-red-100 border border-red-400 text-red-800 rounded">
      {error}
    </div>
  )}

  {verificationResult && (
    <div className="space-y-4">
      <div
        className="p-4 rounded text-white text-center text-lg font-bold"
        style={{
          backgroundColor: verificationResult.verified ? "#10b981" : "#ef4444"
        }}
      >
        {verificationResult.verified
          ? "Document Verified"
          : "Document Not Verified"}
      </div>

      <div className="p-4 border rounded space-y-3">
        <h3 className="text-lg font-bold">Document Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Name:</span>
            <p>{verificationResult.document.name}</p>
          </div>
          <div>
            <span className="font-semibold">Type:</span>
            <p>{verificationResult.document.type}</p>
          </div>
          <div>
            <span className="font-semibold">Issuer:</span>
            <p>{verificationResult.document.issuer}</p>
          </div>
          <div>
            <span className="font-semibold">File Size:</span>
            <p>{(verificationResult.document.file_size / 1024).toFixed(2)} KB</p>
          </div>
        </div>
      </div>

      <div className="p-4 border rounded">
        <h3 className="text-lg font-bold mb-2">File Hash (SHA-256)</h3>
        <code className="block bg-gray-100 p-2 rounded text-sm break-all">
          {verificationResult.file.file_hash}
        </code>
      </div>

      {verificationResult.file.preview_url && (
        <div className="p-4 border rounded">
          <h3 className="text-lg font-bold mb-2">Document Preview</h3>
          <iframe
            src={verificationResult.file.preview_url}
            className="w-full h-96 rounded border"
            title="Document preview"
          />
        </div>
      )}

      {verificationResult.document.blockchain_address && (
        <div className="p-4 border rounded space-y-2">
          <h3 className="text-lg font-bold">Blockchain Verification</h3>
          <div>
            <span className="font-semibold">Address:</span>
            <code className="block bg-gray-100 p-2 rounded text-sm">
              {verificationResult.document.blockchain_address}
            </code>
          </div>
          {verificationResult.document.anchor_tx && (
            <div>
              <span className="font-semibold">Transaction:</span>
              <code className="block bg-gray-100 p-2 rounded text-sm break-all">
                {verificationResult.document.anchor_tx}
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  )}
</div>
*/

// ============================================================
// 4. ERROR HANDLING REFERENCE
// ============================================================

/*
Common error scenarios and their HTTP status codes:

1. Token Not Found (404):
   - Cause: Token doesn't exist in database or was never created
   - Solution: Ask user to check token or request a new share link

2. Token Expired (410):
   - Cause: Token expired_at timestamp has passed
   - Solution: Ask user to request a new share link

3. Verification Failed - Hash Mismatch (200 with success=false):
   - Cause: File contents don't match original hash (document was modified)
   - Solution: Alert user that document may have been tampered with

4. Network Error (fetch exception):
   - Cause: Network issue, CORS problem, or Supabase down
   - Solution: Retry with exponential backoff

5. Invalid Token Format:
   - Cause: User entered malformed or empty token
   - Solution: Validate token format before sending request
*/

// ============================================================
// 5. TESTING EXAMPLES (curl and PowerShell)
// ============================================================

/*
TEST CREATE-SHARE ENDPOINT (curl):

curl -X POST "https://your-project.supabase.co/functions/v1/create-share" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "550e8400-e29b-41d4-a716-446655440000",
    "expiry": "24hr"
  }'

Expected Response (success):
{
  "success": true,
  "token": "abc123def456ghi789jkl012mno345pqr",
  "document_snapshot": {...},
  "expires_at": "2024-12-20T12:00:00Z",
  "preview_url": "https://signed-url-to-document"
}

TEST VERIFY-TOKEN ENDPOINT (curl):

curl -X POST "https://your-project.supabase.co/functions/v1/verify-token" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123def456ghi789jkl012mno345pqr"
  }'

Expected Response (verified):
{
  "success": true,
  "verified": true,
  "document": {...},
  "file": {...}
}

Expected Response (token expired):
HTTP 410 Gone
{
  "success": false,
  "error": "Token has expired"
}
*/

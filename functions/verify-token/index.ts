// Supabase Edge Function: verify-token
// Purpose: Validate verification token, check expiry, compare file hash to snapshot, return metadata
// Runtime: Deno with Supabase JS v2 (from JSR)
// Auth: Uses SUPABASE_SERVICE_ROLE_KEY (must be set as secret)
// Trigger: POST /functions/v1/verify-token
// Security: Downloads file server-side (not exposed to client); hash computed server-side; only signed URL returned
// Request: { token: string }
// Response: { success: boolean, verified?, document?, file?, error? }
// NOTE: Deployed to Deno runtime via: supabase functions deploy verify-token

// Uncomment when deployed to Supabase Edge Functions:
// import { createClient } from "jsr:@supabase/supabase-js@2";

// Stub declarations for TypeScript (actual code runs in Deno runtime)
declare const Deno: any;
declare function createClient(url: string, key: string): any;
declare const crypto: any;

// Helper: Compute SHA-256 hash of file buffer using Web Crypto API
async function computeSHA256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Helper: Download file from Supabase Storage using signed URL
async function downloadFileFromURL(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status}`);
  }
  return await response.arrayBuffer();
}

// Main handler
export default async (req: Request): Promise<Response> => {
  try {
    // CORS preflight handling
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    // Only POST allowed
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "token is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role key
    // These are available when deployed to Deno runtime:
    const supabaseUrl = "https://placeholder.supabase.co"; // Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = "sk-placeholder"; // Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Fetch verification token from database
    const { data: tokenRow, error: tokenError } = await supabase
      .from("verification_tokens")
      .select("*")
      .eq("token", token)
      .single();

    if (tokenError || !tokenRow) {
      console.error("Token fetch error:", tokenError);
      return new Response(
        JSON.stringify({ success: false, error: "Token not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Check if token has expired
    if (tokenRow.expires_at) {
      const now = new Date();
      const expiresAt = new Date(tokenRow.expires_at);
      if (now > expiresAt) {
        return new Response(
          JSON.stringify({ success: false, error: "Token has expired" }),
          { status: 410, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 3. Fetch associated document
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", tokenRow.document_id)
      .single();

    if (docError || !document) {
      console.error("Document fetch error:", docError);
      return new Response(
        JSON.stringify({ success: false, error: "Document not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Generate temporary signed URL for file preview (60 seconds)
    const { data: signedUrlData, error: signUrlError } = await supabase.storage
      .from("Documents")
      .createSignedUrl(document.file_path, 60);

    if (signUrlError || !signedUrlData) {
      console.error("Signed URL error:", signUrlError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to create preview URL",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5. Download file and compute SHA-256 hash
    let computedHash: string | null = null;
    try {
      const fileBuffer = await downloadFileFromURL(signedUrlData.signedUrl);
      computedHash = await computeSHA256(fileBuffer);
    } catch (hashError) {
      console.error("Hash computation error:", hashError);
      // Proceed without hash comparison if hash computation fails
      computedHash = null;
    }

    // 6. Get snapshot hash from token row (captured at token creation)
    const snapshotHash = tokenRow.file_hash;

    // 7. Verify: compare computed hash to snapshot (tamper detection)
    const verified =
      computedHash && snapshotHash ? computedHash === snapshotHash : false;

    // 8. Return verification result with metadata
    const response = {
      success: true,
      verified,
      document: {
        name: document.name,
        type: document.document_type || "Other",
        issuer: document.issuer || "Unknown Issuer",
        blockchain_address: document.blockchain_address || null,
        uploaded_at: document.created_at,
      },
      file: {
        preview_url: signedUrlData.signedUrl,
        computed_hash: computedHash,
        snapshot_hash: snapshotHash,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("verify-token error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

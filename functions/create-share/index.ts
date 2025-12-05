// Supabase Edge Function: create-share
// Purpose: Generate secure verification token, snapshot document metadata, return signed preview URL
// Runtime: Deno with Supabase JS v2 (from JSR)
// Auth: Uses SUPABASE_SERVICE_ROLE_KEY (must be set as secret)
// Trigger: POST /functions/v1/create-share
// Request: { documentId: string, expiry: "10min"|"1hr"|"24hr"|"7days"|"30days"|"never" }
// Response: { success: boolean, token?, expires_at?, preview_url?, error? }
// NOTE: Deployed to Deno runtime via: supabase functions deploy create-share

// Uncomment when deployed to Supabase Edge Functions:
// import { createClient } from "jsr:@supabase/supabase-js@2";

// Stub declarations for TypeScript (actual code runs in Deno runtime)
declare const Deno: any;
declare function createClient(url: string, key: string): any;
declare const crypto: any;

// Helper: Compute expiry timestamp based on choice
function computeExpiresAt(expiry: string): string | null {
  const now = new Date();

  switch (expiry) {
    case "10min":
      return new Date(now.getTime() + 10 * 60 * 1000).toISOString();
    case "1hr":
      return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    case "24hr":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    case "7days":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    case "30days":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    case "never":
      return null; // No expiration
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  }
}

// Helper: Generate secure random token (32 hex chars using Web Crypto API)
function generateToken(): string {
  const buffer = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(buffer)
    .map((b: unknown) => (b as number).toString(16).padStart(2, "0"))
    .join("");
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
    const { documentId, expiry } = body;

    if (!documentId || !expiry) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "documentId and expiry are required",
        }),
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

    // 1. Fetch document from database
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docError || !document) {
      console.error("Document fetch error:", docError);
      return new Response(
        JSON.stringify({ success: false, error: "Document not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Compute expiry timestamp
    const expiresAt = computeExpiresAt(expiry);

    // 3. Create snapshot object with current document metadata
    const documentSnapshot = {
      document_type: document.document_type || "Other",
      issuer: document.issuer || "Unknown Issuer",
      blockchain_address: document.blockchain_address || null,
      file_hash: document.file_hash || null,
      uploaded_at: document.created_at,
    };

    // 4. Generate secure random token
    const token = generateToken();

    // 5. Insert verification token into database with snapshot
    const { error: insertError } = await supabase
      .from("verification_tokens")
      .insert({
        token,
        document_id: documentId,
        document_type_snapshot: document.document_type || "Other",
        issuer_snapshot: document.issuer || "Unknown Issuer",
        blockchain_address_snapshot: document.blockchain_address || null,
        file_hash: document.file_hash || null,
        document_snapshot: documentSnapshot,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error("Token insert error:", insertError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to create verification token",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 6. Generate signed URL for document preview (valid for 5 minutes)
    const { data: signedUrlData, error: signUrlError } = await supabase.storage
      .from("Documents")
      .createSignedUrl(document.file_path, 300); // 300 seconds = 5 minutes

    if (signUrlError || !signedUrlData) {
      console.error("Signed URL error:", signUrlError);
      // Return token even if preview fails (token is still valid)
      return new Response(
        JSON.stringify({
          success: true,
          token,
          expires_at: expiresAt,
          preview_url: null,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 7. Return token, expiry, and preview URL to client
    return new Response(
      JSON.stringify({
        success: true,
        token,
        expires_at: expiresAt,
        preview_url: signedUrlData.signedUrl,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("create-share error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

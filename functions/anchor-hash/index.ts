// Supabase Edge Function: anchor-hash (Optional - for blockchain integration)
// Purpose: Anchor document hash on-chain (Ethereum or other blockchain)
// Runtime: Deno with Supabase JS v2 (from JSR) + ethers.js
// Auth: Uses SUPABASE_SERVICE_ROLE_KEY + blockchain provider key
// Trigger: POST /functions/v1/anchor-hash
// Request: { documentId: string, fileHash: string }
// Response: { success: boolean, tx_hash?, anchor_tx?, error? }
//
// SETUP REQUIRED:
// 1. Set these secrets via Supabase CLI:
//    - SUPABASE_SERVICE_ROLE_KEY
//    - BLOCKCHAIN_RPC_URL (e.g., https://mainnet.infura.io/v3/YOUR_KEY)
//    - BLOCKCHAIN_SIGNER_KEY (private key - KEEP SECURE)
//    - BLOCKCHAIN_CONTRACT_ADDRESS (deployed anchor contract address)
// 2. Deploy anchor contract on blockchain (see: contracts/DocumentAnchor.sol)
// 3. Uncomment and configure ethers.js imports below
//
// NOTE: This function is optional and not required for current feature set.
// It enables full blockchain verification for tamper detection beyond hash snapshot.
// NOTE: Deployed to Deno runtime via: supabase functions deploy anchor-hash

// Uncomment when deployed to Supabase Edge Functions:
// import { createClient } from "jsr:@supabase/supabase-js@2";

// Stub declarations for TypeScript (actual code runs in Deno runtime)
declare const Deno: any;
declare function createClient(url: string, key: string): any;
declare const crypto: any;
// import { ethers } from 'npm:ethers'; // Uncomment when ready to deploy

interface AnchorHashRequest {
  documentId: string;
  fileHash: string;
}

interface AnchorHashResponse {
  success: boolean;
  tx_hash?: string;
  anchor_tx?: string;
  error?: string;
}

export default async (req: Request): Promise<Response> => {
  try {
    // CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    const body: AnchorHashRequest = await req.json();
    const { documentId, fileHash } = body;

    if (!documentId || !fileHash) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "documentId and fileHash are required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get secrets
    // These are available when deployed to Deno runtime:
    const supabaseUrl = "https://placeholder.supabase.co"; // Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = "sk-placeholder"; // Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const blockchainRpcUrl = ""; // Deno.env.get("BLOCKCHAIN_RPC_URL");
    const blockchainSignerKey = ""; // Deno.env.get("BLOCKCHAIN_SIGNER_KEY");
    const blockchainContractAddress = ""; // Deno.env.get("BLOCKCHAIN_CONTRACT_ADDRESS");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing Supabase config" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Blockchain anchoring (optional)
    const anchorTx: string | null = null;

    if (blockchainRpcUrl && blockchainSignerKey && blockchainContractAddress) {
      // TODO: Implement blockchain anchoring using ethers.js
      // 1. Create provider with blockchainRpcUrl
      // 2. Create signer with blockchainSignerKey
      // 3. Load contract ABI and instantiate contract
      // 4. Call contract.anchorHash(documentId, fileHash)
      // 5. Wait for transaction confirmation
      // 6. Store tx hash in database
      //
      // Example (pseudocode):
      // const provider = new ethers.JsonRpcProvider(blockchainRpcUrl);
      // const signer = new ethers.Wallet(blockchainSignerKey, provider);
      // const contract = new ethers.Contract(blockchainContractAddress, ABI, signer);
      // const tx = await contract.anchorHash(documentId, fileHash);
      // const receipt = await tx.wait();
      // anchorTx = receipt.transactionHash;

      console.log("Blockchain anchoring not yet implemented");
      // For now, skip blockchain anchoring
    } else {
      console.log("Blockchain config not set; skipping blockchain anchoring");
    }

    // Update document record with anchor transaction (if available)
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (anchorTx) {
      const { error: updateError } = await supabase
        .from("documents")
        .update({
          anchor_tx: anchorTx,
          anchored_at: new Date().toISOString(),
        })
        .eq("id", documentId);

      if (updateError) {
        console.error("Update error:", updateError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to update document" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        tx_hash: anchorTx,
        anchor_tx: anchorTx,
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
    console.error("anchor-hash error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};


import { createClient } from 'jsr:@supabase/supabase-js@2'
import { createWalletClient, http, defineChain, getContract } from "npm:viem";
import { privateKeyToAccount } from "npm:viem/accounts";
import { sepolia } from "npm:viem/chains";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const WALLET_PRIVATE_KEY = Deno.env.get('WALLET_PRIVATE_KEY');
const CONTRACT_ADDRESS = Deno.env.get('DOCUMENT_REGISTRY_ADDRESS') ?? Deno.env.get('BLOCKCHAIN_CONTRACT_ADDRESS');

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Minimal ABI for the register function
const ABI = [
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "hash",
                "type": "bytes32"
            }
        ],
        "name": "register",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const privateKey = Deno.env.get('WALLET_PRIVATE_KEY');
        const contractAddress = Deno.env.get('DOCUMENT_REGISTRY_ADDRESS') ?? Deno.env.get('BLOCKCHAIN_CONTRACT_ADDRESS');

        if (!privateKey) {
            console.error("Missing WALLET_PRIVATE_KEY");
            throw new Error("Configuration Error: WALLET_PRIVATE_KEY is missing");
        }
        if (!contractAddress) {
            console.error("Missing DOCUMENT_REGISTRY_ADDRESS");
            throw new Error("Configuration Error: DOCUMENT_REGISTRY_ADDRESS is missing");
        }

        const { hash, documentId } = await req.json();

        if (!hash || !hash.startsWith('0x')) {
            throw new Error("Invalid Hash format");
        }

        console.log(`Processing blockchain registration for doc: ${documentId}, hash: ${hash}`);

        // 1. Setup Account
        const account = privateKeyToAccount(WALLET_PRIVATE_KEY as `0x${string}`);

        // 2. Setup Client
        const client = createWalletClient({
            account,
            chain: sepolia,
            transport: http()
        });

        // 3. Send Transaction directly via writeContract
        // Note: viem's writeContract is simpler than manual transaction prep for this use case
        const hashResult = await client.writeContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: ABI,
            functionName: 'register',
            args: [hash as `0x${string}`],
        });

        console.log(`Transaction sent: ${hashResult}`);

        // 4. Return success immediately (we don't wait for confirmation to speed up response)
        // Client can poll for status if needed, or we can use a separate background worker.
        // For this hackathon, returning the tx hash is sufficient proof of "processing".

        return new Response(
            JSON.stringify({
                success: true,
                transactionHash: hashResult,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
        )

    } catch (error: any) {
        console.error('Blockchain registration error:', error);
        return new Response(
            JSON.stringify({ error: error.message || String(error) }),
            {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
        )
    }
})

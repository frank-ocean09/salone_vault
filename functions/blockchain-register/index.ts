
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { createThirdwebClient, getContract, prepareContractCall, sendTransaction, waitForReceipt } from "npm:thirdweb";
import { privateKeyToAccount } from "npm:thirdweb/wallets";
import { sepolia } from "npm:thirdweb/chains";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
// Secret Key is REQUIRED for server-side operations
const THIRDWEB_SECRET_KEY = Deno.env.get('THIRDWEB_SECRET_KEY') ?? Deno.env.get('BLOCKCHAIN_SIGNER_KEY');
// Prioritize WALLET_PRIVATE_KEY, but check BLOCKCHAIN_SIGNER_KEY if the user set it there (though they set the wrong value currently)
// Actually, let's look for a specific PRIVATE_KEY variable or the one they set
const WALLET_PRIVATE_KEY = Deno.env.get('WALLET_PRIVATE_KEY');
const CONTRACT_ADDRESS = Deno.env.get('DOCUMENT_REGISTRY_ADDRESS') ?? Deno.env.get('BLOCKCHAIN_CONTRACT_ADDRESS');

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Initialize Thirdweb with Secret Key (Server Side)
const client = createThirdwebClient({
    secretKey: THIRDWEB_SECRET_KEY ?? '',
});

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
        if (!THIRDWEB_SECRET_KEY || !WALLET_PRIVATE_KEY || !CONTRACT_ADDRESS) {
            throw new Error("Missing Configuration (THIRDWEB_SECRET_KEY, WALLET_PRIVATE_KEY, or DOCUMENT_REGISTRY_ADDRESS)");
        }

        const { hash, documentId } = await req.json();

        if (!hash || !hash.startsWith('0x')) {
            throw new Error("Invalid Hash format");
        }

        console.log(`Processing blockchain registration for doc: ${documentId}, hash: ${hash}`);

        // 1. Setup Account from Private Key
        const account = privateKeyToAccount({
            client,
            privateKey: WALLET_PRIVATE_KEY,
        });

        // 2. Connect to Contract on Sepolia
        const contract = getContract({
            client,
            chain: sepolia,
            address: CONTRACT_ADDRESS,
            abi: ABI,
        });

        // 3. Prepare Transaction
        const transaction = prepareContractCall({
            contract,
            method: "register",
            params: [hash as `0x${string}`],
        });

        // 4. Send Transaction
        const sendResult = await sendTransaction({
            transaction,
            account,
        });

        console.log(`Transaction sent: ${sendResult.transactionHash}`);

        // 5. Wait for Receipt (Optional, but safer to confirm)
        const receipt = await waitForReceipt(sendResult);

        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

        // 6. Return success
        return new Response(
            JSON.stringify({
                success: true,
                transactionHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber.toString()
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
        )

    } catch (error) {
        console.error('Blockchain registration error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
        )
    }
})

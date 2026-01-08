import { supabase } from "./supabase";

/**
 * Generates SH-256 hash of a file
 */
export const generateFileHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return "0x" + hashHex;
};

/**
 * Registers a document on the blockchain via Supabase Edge Function
 * This runs silently in the background.
 */
export const registerDocumentOnChain = async (file: File, documentId: string) => {
    try {
        console.log("Generating hash for blockchain registration...");
        const hash = await generateFileHash(file);

        console.log("Calling Edge Function to register hash:", hash);
        const { data, error } = await supabase.functions.invoke('blockchain-register', {
            body: { hash, documentId }
        });

        if (error) {
            console.error("Blockchain registration failed:", error);
            // We don't throw here to avoid disrupting the main upload flow
            // The document is still saved in Supabase
            return null;
        }

        console.log("Blockchain registration success:", data);
        return data;

    } catch (err) {
        console.error("Unexpected error in blockchain registration:", err);
        return null;
    }
};

/**
 * Verifies if a document hash exists on-chain
 * Uses client-side read-only call (No wallet needed)
 */
import { getContract, readContract, defineChain } from "thirdweb";
import { client } from "./client";

export const verifyDocumentOnChain = async (hash: string) => {
    try {
        // Contract Address - Should be in env, but fallback for safety
        const CONTRACT_ADDRESS = import.meta.env.VITE_DOCUMENT_REGISTRY_ADDRESS;

        if (!CONTRACT_ADDRESS) {
            console.warn("Contract address not set");
            return { verified: false };
        }

        const contract = getContract({
            client,
            chain: defineChain(11155111), // Sepolia
            address: CONTRACT_ADDRESS,
        });

        const data = await readContract({
            contract,
            method: "function verify(bytes32 hash) view returns (bool exists, uint256 timestamp)",
            params: [hash as `0x${string}`],
        });

        const [exists, timestamp] = data;

        return {
            verified: exists,
            timestamp: exists ? Number(timestamp) * 1000 : undefined
        };
    } catch (err) {
        console.error("Verification failed:", err);
        return { verified: false, error: err };
    }
};

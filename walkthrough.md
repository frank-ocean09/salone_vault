# Blockchain Integration Walkthrough

We have successfully deployed the blockchain integration for the National Digital Document Vault. This ensures that every uploaded document is cryptographically hashed and registered on the Sepolia Testnet, providing immutable proof of existence.

## 1. What We Accomplished
- **Smart Contract Deployment**: Deployed `DocumentRegistry.sol` to Sepolia Testnet interactively using Thirdweb.
- **Edge Function**: Implemented and deployed a `blockchain-register` Supabase Edge Function.
    - **Optimization**: Switched to `viem` to ensure fast, timeout-free execution on the server.
- **Frontend Integration**: Configured the application to auto-register uploads and verify them on the `/verify` page.

## 2. How to Test the Integration

### Step 1: Upload a Document
1.  Go to your **Dashboard**.
2.  **Upload** a new file (PDF, Image, etc.).
3.  The system will automatically:
    - Upload the file to Supabase Storage.
    - Calculate the SHA-256 hash.
    - Call the `blockchain-register` function.
    - Register the hash on the Ethereum Sepolia blockchain (this might take 10-30 seconds).

### Step 2: Verify the Document
1.  Wait about 30 seconds after upload for the transaction to confirm.
2.  Generate a **Share Link** for the document.
3.  Open the link (this takes you to the `/verify` page).
4.  You should see a **"Verified on Blockchain"** badge with a timestamp.

## 3. Configuration Reference
We updated your configuration with these values:
- **Contract Address**: `0x80e62b8ae02f0817306d1683ff482864BDc8586A`
- **Network**: Sepolia Testnet
- **Tools Used**: Thirdweb (Contract Management), Viem (Server-side Interactions).

## 4. Troubleshooting
- If verification fails immediately after upload, wait a minute. Blockchain transactions take time to propagate.
- Check the **Supabase Edge Function Logs** in your dashboard if uploads seem to hang or verification never appears.

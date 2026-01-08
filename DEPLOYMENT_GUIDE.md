# Thirdweb Deployment & Configuration Guide

You are almost ready! The code is implemented and potential dependencies are installed. Follow these steps to complete the blockchain integration.

## 1. Deploy the Smart Contract
We have added a deployment script for you. Run the following command in your terminal:

```bash
# Option 1: If you are already logged in
npm run deploy

# Option 2: If you have a Secret Key (Recommended)
npx thirdweb deploy -k "YOUR_SECRET_KEY_FROM_THIRDWEB_DASHBOARD"
```

**What will happen:**
1.  A browser window will open.
2.  Verify the contract settings (it's a standard `DocumentRegistry` contract).
3.  Connect your wallet and switch to **Sepolia Testnet**.
4.  Click **Deploy Now** and sign the transaction.
5.  **IMPORTANT:** after deployment, copy the **Contract Address** shown in the Thirdweb dashboard.

## 2. Configure Environment Variables
You need to add the following secrets to your Supabase project (for the Edge Function) and your local environment (for the frontend).

### For Supabase Edge Functions (Server-Side)
Go to your Supabase Dashboard -> Project Settings -> Edge Functions -> Secrets, or run locally:

```bash
npx supabase secrets set THIRDWEB_SECRET_KEY="your-secret-key-from-thirdweb-dashboard"
npx supabase secrets set WALLET_PRIVATE_KEY="your-wallet-private-key"
npx supabase secrets set DOCUMENT_REGISTRY_ADDRESS="address-from-step-1"
```

> **Note:** The `WALLET_PRIVATE_KEY` is the private key of the account that will pay gas fees for user transactions. Ensure this account has Sepolia ETH.

### For Frontend (Client-Side)
Update your `.env` or `.env.local` file:

```bash
VITE_DOCUMENT_REGISTRY_ADDRESS="address-from-step-1"
VITE_TEMPLATE_CLIENT_ID="your-client-id-from-thirdweb"
```

## 3. Deploy the Edge Function
Finally, deploy the updated edge function to Supabase:

```bash
npx supabase functions deploy blockchain-register --no-verify-jwt
```

## 4. Verification
After these steps, try uploading a document. The system should:
1.  Upload to Supabase Storage.
2.  Call the `blockchain-register` function.
3.  The function will hash the file and register it on Sepolia.
4.  You can verify it on the `/verify` page using the document hash.

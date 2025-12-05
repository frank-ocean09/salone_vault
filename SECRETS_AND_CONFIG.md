# Supabase Edge Functions - Secrets & Configuration Reference

This document explains all secrets and environment variables required for Edge Functions deployment.

## 📋 Required Secrets

### 1. SUPABASE_URL
- **Purpose**: Supabase project URL for API calls
- **Value**: `https://<project-ref>.supabase.co`
- **How to get**: 
  - Supabase Dashboard → Settings → General → Project URL
  - Copy the HTTPS URL (starts with `https://`)
- **Used by**: `create-share`, `verify-token`, `anchor-hash`
- **Security**: Public; safe to expose

```powershell
# Set the secret
supabase secrets set SUPABASE_URL="https://your-project.supabase.co" --project-ref $PROJECT_REF

# Verify it was set
supabase secrets list --project-ref $PROJECT_REF
```

### 2. SUPABASE_SERVICE_ROLE_KEY
- **Purpose**: Privileged API key for service-level operations (bypass RLS)
- **Value**: Service role key (starts with `eyJh...`)
- **How to get**:
  - Supabase Dashboard → Settings → API → Service Role Key
  - Click "copy" button next to the key
  - **⚠️ KEEP THIS SECRET - NEVER expose to client**
- **Used by**: All Edge Functions (create-share, verify-token, anchor-hash)
- **Security**: Highly privileged; rotate every 90 days

```powershell
# Set the secret (wrap in quotes if it contains special characters)
$SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SERVICE_KEY" --project-ref $PROJECT_REF

# Verify it was set (shows masked value for security)
supabase secrets list --project-ref $PROJECT_REF
# Output: SUPABASE_SERVICE_ROLE_KEY | ••••••••••••••••
```

### 3. BLOCKCHAIN_RPC_URL (Optional - for anchor-hash)
- **Purpose**: Blockchain RPC endpoint URL for contract interaction
- **Value**: Depends on blockchain:
  - **Ethereum Mainnet**: `https://eth-mainnet.g.alchemy.com/v2/<API_KEY>`
  - **Polygon**: `https://polygon-mainnet.g.alchemy.com/v2/<API_KEY>`
  - **Ethereum Sepolia (Testnet)**: `https://eth-sepolia.g.alchemy.com/v2/<API_KEY>`
  - **Local**: `http://localhost:8545` (for Hardhat/Ganache)
- **How to get**:
  - Use Alchemy (free tier available): https://www.alchemy.com
  - Use Infura (free tier available): https://infura.io
  - Use public RPC endpoints (less reliable): https://publicnode.com
- **Used by**: `anchor-hash` function only
- **Security**: Can be public; some providers have rate limits

```powershell
# Set Alchemy RPC URL
supabase secrets set BLOCKCHAIN_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY" --project-ref $PROJECT_REF

# Or use Infura
supabase secrets set BLOCKCHAIN_RPC_URL="https://mainnet.infura.io/v3/YOUR_PROJECT_ID" --project-ref $PROJECT_REF
```

### 4. BLOCKCHAIN_SIGNER_KEY (Optional - for anchor-hash)
- **Purpose**: Private key for signing blockchain transactions
- **Value**: Ethereum private key (64 hex characters, starts with `0x`)
- **How to get**:
  - Create a new Ethereum account using ethers.js, web3.py, or wallet
  - Example (ethers.js):
    ```javascript
    const ethers = require('ethers');
    const wallet = ethers.Wallet.createRandom();
    console.log('Private Key:', wallet.privateKey); // e.g., 0x123abc...
    console.log('Address:', wallet.address);
    ```
  - **⚠️ This is a PRIVATE KEY - NEVER share it**
- **Pre-requirements**:
  - Fund account with ETH/MATIC for gas fees (~$5-50 worth)
  - Use testnet first (Sepolia) before mainnet
- **Used by**: `anchor-hash` function only (if implementing blockchain anchoring)
- **Security**: Highly sensitive; rotate after major operations; use testnet first

```powershell
# Set the private key (keep it secret!)
$PRIVATE_KEY = "0x1234567890abcdef..."
supabase secrets set BLOCKCHAIN_SIGNER_KEY="$PRIVATE_KEY" --project-ref $PROJECT_REF

# ⚠️ IMPORTANT: This key will be stored encrypted in Supabase
# Never hardcode it in source code or commit to git
```

### 5. BLOCKCHAIN_CONTRACT_ADDRESS (Optional - for anchor-hash)
- **Purpose**: Address of deployed DocumentAnchor smart contract
- **Value**: Ethereum contract address (starts with `0x`)
- **How to get**:
  - Deploy DocumentAnchor contract (see EDGE_FUNCTIONS_DEPLOYMENT.md)
  - Copy contract address from deployment output
  - Verify at block explorer: https://etherscan.io
- **Example**: `0x742d35Cc6634C0532925a3b844Bc9e7595f...`
- **Used by**: `anchor-hash` function only
- **Security**: Can be public; it's on blockchain anyway

```powershell
# Set the contract address
supabase secrets set BLOCKCHAIN_CONTRACT_ADDRESS="0x742d35Cc6634C0532925a3b844Bc9e7595f..." --project-ref $PROJECT_REF
```

---

## 🔍 Viewing & Managing Secrets

### List All Secrets
```powershell
$PROJECT_REF = "your_project_ref_here"
supabase secrets list --project-ref $PROJECT_REF

# Output example:
# SUPABASE_URL | https://your-project.supabase.co
# SUPABASE_SERVICE_ROLE_KEY | ••••••••••••••••
# BLOCKCHAIN_RPC_URL | https://eth-mainnet.g.alchemy.com/v2/••••••••
```

### Update a Secret
```powershell
# Secrets are updated by setting them again (same key)
supabase secrets set BLOCKCHAIN_RPC_URL="https://new-url" --project-ref $PROJECT_REF
```

### Delete a Secret
```powershell
# Currently not supported via CLI, but you can set empty value
# Best practice: delete via Supabase Dashboard → Functions → Secrets
```

### Access Secrets in Edge Functions

```typescript
// In Deno (Edge Functions runtime)
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const blockchainRpcUrl = Deno.env.get("BLOCKCHAIN_RPC_URL");
const blockchainSignerKey = Deno.env.get("BLOCKCHAIN_SIGNER_KEY");
const contractAddress = Deno.env.get("BLOCKCHAIN_CONTRACT_ADDRESS");

// Check if secret exists
if (!supabaseUrl) {
  console.error("Missing SUPABASE_URL secret");
  throw new Error("Configuration error");
}
```

---

## 📝 Setup Checklist

### Phase 1: Basic Deployment (Required)
- [ ] Get SUPABASE_URL from Supabase Dashboard
- [ ] Get SUPABASE_SERVICE_ROLE_KEY from Settings → API
- [ ] Set both secrets via CLI:
  ```powershell
  supabase secrets set SUPABASE_URL="..." --project-ref $PROJECT_REF
  supabase secrets set SUPABASE_SERVICE_ROLE_KEY="..." --project-ref $PROJECT_REF
  ```
- [ ] Deploy create-share and verify-token functions
- [ ] Test end-to-end (upload → share → verify)

### Phase 2: Blockchain Integration (Optional)
- [ ] Create Ethereum account (for signing transactions)
- [ ] Get RPC URL (Alchemy or Infura)
- [ ] Deploy DocumentAnchor smart contract
- [ ] Set blockchain secrets:
  ```powershell
  supabase secrets set BLOCKCHAIN_RPC_URL="..." --project-ref $PROJECT_REF
  supabase secrets set BLOCKCHAIN_SIGNER_KEY="..." --project-ref $PROJECT_REF
  supabase secrets set BLOCKCHAIN_CONTRACT_ADDRESS="..." --project-ref $PROJECT_REF
  ```
- [ ] Deploy anchor-hash function
- [ ] Test blockchain anchoring

### Phase 3: Security Hardening
- [ ] Enable RLS on documents and verification_tokens tables
- [ ] Set storage bucket policies
- [ ] Rotate service role key (every 90 days)
- [ ] Monitor function logs for errors
- [ ] Set up alerts for failed verifications

---

## 🛡️ Security Best Practices

### 1. Never Commit Secrets to Git
```bash
# .gitignore
.env.local
.env.*.local
secrets/
```

### 2. Use Environment Variables Locally
```powershell
# Create .env.local (not in git)
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=eyJh...

# Load from file when testing locally
Get-Content .env.local | ForEach-Object {
  if ($_ -match '^([^=]+)=(.*)$') {
    [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
  }
}
```

### 3. Rotate Secrets Regularly
- **Service Role Key**: Every 90 days
  - Generate new key in Supabase Dashboard
  - Update secret via CLI
  - Verify functions still work
- **Blockchain Signer Key**: After major transactions
  - Create new account and transfer funds
  - Update secret and redeploy
  - Monitor old account for any lingering activity

### 4. Monitor Access Logs
```powershell
# View function logs for any suspicious activity
supabase functions logs create-share --project-ref $PROJECT_REF --limit 1000 --follow

# Look for: 401, 403, 429, 500 errors
# Investigate: Unusual expiry patterns, repeated token reuse, rate limit hits
```

### 5. Use Testnet First
- Deploy to **Ethereum Sepolia** before mainnet
- Test with small amounts first
- Use dedicated accounts for anchoring (separate from hot wallet)

---

## 🔧 Troubleshooting

### "Missing SUPABASE_URL" Error
**Symptom**: Function logs show `Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY`

**Fix**:
```powershell
# Check if secret is set
supabase secrets list --project-ref $PROJECT_REF

# If not listed, set it
supabase secrets set SUPABASE_URL="https://your-project.supabase.co" --project-ref $PROJECT_REF

# Redeploy function
supabase functions deploy create-share --project-ref $PROJECT_REF
```

### "Invalid Service Role Key" Error
**Symptom**: `401 Unauthorized` or `Invalid API Key`

**Fix**:
1. Get new service role key from Supabase Dashboard → Settings → API
2. Verify key starts with `eyJh`
3. Update secret:
   ```powershell
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<new_key>" --project-ref $PROJECT_REF
   ```
4. Redeploy all functions

### "RPC Provider Unreachable" Error (Blockchain)
**Symptom**: `Error: failed to fetch` or `timeout`

**Fix**:
1. Check RPC URL is accessible:
   ```powershell
   Invoke-WebRequest -Uri "https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY"
   ```
2. Verify API key is valid on provider dashboard
3. Check rate limits (most free tiers have 300 req/sec)
4. Switch to different provider if needed

---

## 📊 Secrets Storage Location

- **Supabase Dashboard**: Settings → Functions → Secrets
- **Encryption**: All secrets encrypted at rest using Supabase master key
- **Access**: Only available to deployed functions; not accessible via API
- **Audit**: All secret reads logged (check in Supabase logs)

---

## 🚀 Production Deployment Checklist

- [ ] All secrets set in production project
- [ ] Functions deployed and tested
- [ ] RLS policies enabled
- [ ] Storage bucket policies set
- [ ] Rate limiting configured (optional)
- [ ] Error alerting set up
- [ ] Function logs monitored
- [ ] Secrets rotation schedule defined
- [ ] Disaster recovery plan documented
- [ ] Security audit completed

---

## 📚 Related Files

- **Deployment Guide**: `EDGE_FUNCTIONS_DEPLOYMENT.md`
- **Frontend Examples**: `EDGE_FUNCTIONS_FRONTEND_EXAMPLES.ts`
- **Function Source**: `functions/create-share/index.ts`, `functions/verify-token/index.ts`
- **Database Schema**: `supabase_schema_additions.sql`

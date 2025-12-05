# Supabase Edge Functions - Quick Start Deployment Script

Use this script to quickly deploy all Edge Functions and set secrets in one go.

## 📋 Prerequisites

1. **Supabase CLI installed**: `npm install -g supabase`
2. **Authenticated**: `supabase login` (run once)
3. **Project Reference**: From Supabase Dashboard → Settings → General
4. **Secrets prepared**: SUPABASE_URL and SERVICE_ROLE_KEY (see SECRETS_AND_CONFIG.md)

---

## 🚀 Quick Deploy Script (PowerShell)

### Option 1: Interactive Setup (Recommended for first time)

```powershell
# ============================================================
# INTERACTIVE SUPABASE EDGE FUNCTIONS DEPLOYMENT
# ============================================================

Write-Host "=== Supabase Edge Functions Deployment ===" -ForegroundColor Cyan

# 1. Get project reference
$PROJECT_REF = Read-Host "Enter your Supabase Project Reference"

if (-not $PROJECT_REF) {
    Write-Host "Project reference is required!" -ForegroundColor Red
    exit 1
}

Write-Host "Using project: $PROJECT_REF" -ForegroundColor Green

# 2. Get Supabase URL
$SUPABASE_URL = Read-Host "Enter your Supabase URL (e.g., https://your-project.supabase.co)"

if (-not $SUPABASE_URL) {
    Write-Host "Supabase URL is required!" -ForegroundColor Red
    exit 1
}

# 3. Get Service Role Key
Write-Host "Enter your Service Role Key (from Settings → API)" -ForegroundColor Yellow
$SERVICE_ROLE_KEY = Read-Host "Paste your service role key"

if (-not $SERVICE_ROLE_KEY) {
    Write-Host "Service Role Key is required!" -ForegroundColor Red
    exit 1
}

Write-Host "`nStarting deployment..." -ForegroundColor Cyan

# 4. Set secrets
Write-Host "`n[1/4] Setting SUPABASE_URL secret..." -ForegroundColor Yellow
supabase secrets set SUPABASE_URL="$SUPABASE_URL" --project-ref $PROJECT_REF
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ SUPABASE_URL set" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to set SUPABASE_URL" -ForegroundColor Red
    exit 1
}

Write-Host "`n[2/4] Setting SUPABASE_SERVICE_ROLE_KEY secret..." -ForegroundColor Yellow
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" --project-ref $PROJECT_REF
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ SUPABASE_SERVICE_ROLE_KEY set" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to set SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Red
    exit 1
}

# 5. Deploy functions
Write-Host "`n[3/4] Deploying create-share function..." -ForegroundColor Yellow
supabase functions deploy create-share --project-ref $PROJECT_REF
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ create-share deployed" -ForegroundColor Green
    Write-Host "  URL: $SUPABASE_URL/functions/v1/create-share" -ForegroundColor Cyan
} else {
    Write-Host "✗ Failed to deploy create-share" -ForegroundColor Red
    exit 1
}

Write-Host "`n[4/4] Deploying verify-token function..." -ForegroundColor Yellow
supabase functions deploy verify-token --project-ref $PROJECT_REF
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ verify-token deployed" -ForegroundColor Green
    Write-Host "  URL: $SUPABASE_URL/functions/v1/verify-token" -ForegroundColor Cyan
} else {
    Write-Host "✗ Failed to deploy verify-token" -ForegroundColor Red
    exit 1
}

# 6. Optional: Deploy anchor-hash
$deployAnchor = Read-Host "`nDeploy anchor-hash function (optional, for blockchain)? (y/n)"
if ($deployAnchor -eq "y" -or $deployAnchor -eq "Y") {
    Write-Host "Deploying anchor-hash function..." -ForegroundColor Yellow
    supabase functions deploy anchor-hash --project-ref $PROJECT_REF
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ anchor-hash deployed" -ForegroundColor Green
    } else {
        Write-Host "⚠ anchor-hash deployment failed" -ForegroundColor Yellow
    }
}

# 7. Verify deployment
Write-Host "`n[Verification] Checking deployed functions..." -ForegroundColor Cyan
supabase functions list --project-ref $PROJECT_REF

Write-Host "`n✓ Deployment complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Update your frontend environment variables in .env.local"
Write-Host "2. Test the end-to-end flow: upload → create share → verify"
Write-Host "3. Check function logs for any errors"
Write-Host "`nView logs:" -ForegroundColor Cyan
Write-Host "  supabase functions logs create-share --project-ref $PROJECT_REF --follow" -ForegroundColor Gray
Write-Host "  supabase functions logs verify-token --project-ref $PROJECT_REF --follow" -ForegroundColor Gray
```

---

### Option 2: Non-Interactive Script (For CI/CD or repeatable setup)

```powershell
# ============================================================
# NON-INTERACTIVE DEPLOYMENT SCRIPT
# Set variables before running
# ============================================================

# Configuration
$PROJECT_REF = "your_project_ref_here"
$SUPABASE_URL = "https://your-project.supabase.co"
$SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Optional: Blockchain settings
$BLOCKCHAIN_RPC_URL = "https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY"
$BLOCKCHAIN_SIGNER_KEY = "0x..."
$BLOCKCHAIN_CONTRACT_ADDRESS = "0x..."

# Validation
if (-not $PROJECT_REF -or -not $SUPABASE_URL -or -not $SERVICE_ROLE_KEY) {
    Write-Host "Error: Missing required configuration" -ForegroundColor Red
    Write-Host "Set PROJECT_REF, SUPABASE_URL, and SERVICE_ROLE_KEY" -ForegroundColor Yellow
    exit 1
}

Write-Host "Deploying to project: $PROJECT_REF" -ForegroundColor Cyan

# Set secrets
Write-Host "Setting secrets..." -ForegroundColor Yellow
supabase secrets set SUPABASE_URL="$SUPABASE_URL" --project-ref $PROJECT_REF
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" --project-ref $PROJECT_REF

if ($BLOCKCHAIN_RPC_URL) {
    supabase secrets set BLOCKCHAIN_RPC_URL="$BLOCKCHAIN_RPC_URL" --project-ref $PROJECT_REF
    supabase secrets set BLOCKCHAIN_SIGNER_KEY="$BLOCKCHAIN_SIGNER_KEY" --project-ref $PROJECT_REF
    supabase secrets set BLOCKCHAIN_CONTRACT_ADDRESS="$BLOCKCHAIN_CONTRACT_ADDRESS" --project-ref $PROJECT_REF
}

# Deploy functions
Write-Host "Deploying functions..." -ForegroundColor Yellow
supabase functions deploy create-share --project-ref $PROJECT_REF
supabase functions deploy verify-token --project-ref $PROJECT_REF
supabase functions deploy anchor-hash --project-ref $PROJECT_REF

# Verify
Write-Host "Verifying deployment..." -ForegroundColor Yellow
supabase functions list --project-ref $PROJECT_REF

Write-Host "Deployment complete!" -ForegroundColor Green
```

---

### Option 3: Batch Deploy (With Error Handling)

```powershell
# ============================================================
# BATCH DEPLOYMENT WITH ERROR HANDLING
# ============================================================

param(
    [string]$ProjectRef,
    [string]$SupabaseUrl,
    [string]$ServiceRoleKey,
    [string]$DeployAnchor = "false"
)

function ExitWithError {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
    exit 1
}

function LogSuccess {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function LogInfo {
    param([string]$Message)
    Write-Host "• $Message" -ForegroundColor Cyan
}

# Validate inputs
if (-not $ProjectRef -or -not $SupabaseUrl -or -not $ServiceRoleKey) {
    ExitWithError "Missing required parameters. Usage: .\deploy.ps1 -ProjectRef <ref> -SupabaseUrl <url> -ServiceRoleKey <key>"
}

LogInfo "Starting deployment to project: $ProjectRef"

# Set secrets
LogInfo "Setting secrets..."
try {
    supabase secrets set SUPABASE_URL="$SupabaseUrl" --project-ref $ProjectRef | Out-Null
    LogSuccess "SUPABASE_URL configured"
    
    supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$ServiceRoleKey" --project-ref $ProjectRef | Out-Null
    LogSuccess "SUPABASE_SERVICE_ROLE_KEY configured"
} catch {
    ExitWithError "Failed to set secrets: $_"
}

# Deploy functions
LogInfo "Deploying functions..."

$functions = @("create-share", "verify-token")
if ($DeployAnchor -eq "true") {
    $functions += "anchor-hash"
}

foreach ($func in $functions) {
    try {
        LogInfo "Deploying $func..."
        supabase functions deploy $func --project-ref $ProjectRef
        LogSuccess "$func deployed"
    } catch {
        ExitWithError "Failed to deploy $func: $_"
    }
}

# Verify
LogInfo "Verifying deployment..."
supabase functions list --project-ref $ProjectRef

LogSuccess "All deployments complete!"
Write-Host "`nFunction URLs:" -ForegroundColor Cyan
Write-Host "  Create Share: $SupabaseUrl/functions/v1/create-share" -ForegroundColor Gray
Write-Host "  Verify Token: $SupabaseUrl/functions/v1/verify-token" -ForegroundColor Gray
```

---

## 📝 Usage Examples

### Example 1: Simple Deploy
```powershell
.\deploy.ps1 -ProjectRef "abc123def456" `
  -SupabaseUrl "https://abc123def456.supabase.co" `
  -ServiceRoleKey "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Example 2: Deploy with Blockchain
```powershell
.\deploy.ps1 -ProjectRef "abc123def456" `
  -SupabaseUrl "https://abc123def456.supabase.co" `
  -ServiceRoleKey "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." `
  -DeployAnchor "true"
```

---

## 🔍 Testing After Deployment

### Test create-share Function
```powershell
$SUPABASE_URL = "https://your-project.supabase.co"
$DOC_ID = "your-document-id"

$response = Invoke-WebRequest `
  -Uri "$SUPABASE_URL/functions/v1/create-share" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body (@{
    documentId = $DOC_ID
    expiry = "24hr"
  } | ConvertTo-Json)

$result = $response.Content | ConvertFrom-Json
Write-Host "Token: $($result.token)"
Write-Host "Expires: $($result.expires_at)"
Write-Host "Preview URL: $($result.preview_url)"
```

### Test verify-token Function
```powershell
$SUPABASE_URL = "https://your-project.supabase.co"
$TOKEN = "token-from-create-share"

$response = Invoke-WebRequest `
  -Uri "$SUPABASE_URL/functions/v1/verify-token" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body (@{
    token = $TOKEN
  } | ConvertTo-Json)

$result = $response.Content | ConvertFrom-Json
Write-Host "Verified: $($result.verified)"
Write-Host "Document Type: $($result.document.type)"
Write-Host "Issuer: $($result.document.issuer)"
Write-Host "Hash Match: $(if($result.verified) { 'Yes' } else { 'No' })"
```

---

## 🛠️ Troubleshooting

### Check Function Status
```powershell
$PROJECT_REF = "your_project_ref"
supabase functions list --project-ref $PROJECT_REF
```

### View Function Logs
```powershell
supabase functions logs create-share --project-ref $PROJECT_REF --limit 50
supabase functions logs verify-token --project-ref $PROJECT_REF --limit 50
```

### Redeploy a Function
```powershell
$PROJECT_REF = "your_project_ref"
supabase functions deploy create-share --project-ref $PROJECT_REF
```

### Update Secrets
```powershell
$PROJECT_REF = "your_project_ref"
supabase secrets set SUPABASE_URL="new-value" --project-ref $PROJECT_REF
# Secrets take effect immediately; no redeploy needed
```

---

## 📚 Related Documentation

- **Full Deployment Guide**: `EDGE_FUNCTIONS_DEPLOYMENT.md`
- **Secrets Configuration**: `SECRETS_AND_CONFIG.md`
- **Frontend Examples**: `EDGE_FUNCTIONS_FRONTEND_EXAMPLES.ts`
- **Function Source Code**: `functions/create-share/index.ts`, `functions/verify-token/index.ts`

---

## ✅ Success Checklist

After running deployment script:

- [ ] No errors in deployment output
- [ ] Both functions listed in `supabase functions list`
- [ ] Test create-share returns token and preview_url
- [ ] Test verify-token returns verified status
- [ ] Frontend fetch calls working (check browser console)
- [ ] Verification link shareable and functional
- [ ] Document preview accessible (60-second window)
- [ ] Hash validation working correctly

If all checks pass, you're ready to use the verification system in production!

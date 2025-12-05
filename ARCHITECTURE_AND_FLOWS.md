# Supabase Edge Functions - Architecture & System Overview

Complete reference for the blockchain-verified digital vault system architecture.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SECURE DIGITAL VAULT                            │
└─────────────────────────────────────────────────────────────────────────┘

                              USER LAYER
┌────────────────────┬──────────────────────┬─────────────────────────┐
│  Dashboard Page    │  Upload Modal        │  Verify Page            │
│  - Document List   │  - Type Selection    │  - Token Input          │
│  - Share Button    │  - Preview Option    │  - Verification Result  │
│  - Download Link   │  - Expiry Choice     │  - Hash Validation      │
│  - Delete Option   │  - Create Link Btn   │  - Preview Link         │
└────────────────────┴──────────────────────┴─────────────────────────┘
         │                    │                         │
         └────────────────────┼─────────────────────────┘
                              │
                    FRONTEND (React + TypeScript)
                    - Document API calls
                    - Edge Function fetches
                    - State management
                    - Route handling
                              │
         ┌────────────────────┼─────────────────────────┐
         │                    │                         │
         ▼                    ▼                         ▼

    ┌─────────────┐   ┌──────────────────┐    ┌─────────────────┐
    │ Supabase    │   │ Supabase Edge    │    │ Supabase        │
    │ Storage     │   │ Functions        │    │ Database        │
    │ (Documents) │   │ (Verification)   │    │ (Metadata)      │
    │             │   │                  │    │                 │
    │ Bucket:     │   │ ┌──────────────┐ │    │ Tables:         │
    │ Documents   │   │ │create-share  │ │    │ - documents     │
    │ (Private)   │   │ │              │ │    │ - verification_ │
    │             │   │ │POST upload   │ │    │   tokens        │
    │ Stores:     │   │ │Generates     │ │    │                 │
    │ - Original  │   │ │- token       │ │    │ Columns:        │
    │   files     │   │ │- snapshot    │ │    │ - id            │
    │ - File hash │   │ │- preview URL │ │    │ - file_hash     │
    │ - Metadata  │   │ │              │ │    │ - issuer        │
    │             │   │ ├──────────────┤ │    │ - blockchain_   │
    │             │   │ │verify-token  │ │    │   address       │
    │             │   │ │              │ │    │ - created_at    │
    │ Signed      │   │ │POST verify   │ │    │ - updated_at    │
    │ URLs:       │   │ │Validates:    │ │    │                 │
    │ - 60-300    │   │ │- expiry      │ │    │ Verification    │
    │   sec exp   │   │ │- hash match  │ │    │ Tokens:         │
    │ - Download  │   │ │- return meta │ │    │ - token         │
    │   only      │   │ │              │ │    │ - document_id   │
    │ - One-time  │   │ ├──────────────┤ │    │ - file_hash     │
    │   use       │   │ │anchor-hash   │ │    │ - snapshot      │
    │             │   │ │(Optional)    │ │    │ - expires_at    │
    │             │   │ │              │ │    │ - created_at    │
    │             │   │ │POST anchor   │ │    │                 │
    │             │   │ │Blockchain:   │ │    │ RLS Policies:   │
    │             │   │ │- sign tx     │ │    │ - Users view    │
    │             │   │ │- send to     │ │    │   own docs      │
    │             │   │ │  blockchain  │ │    │ - Public token  │
    │             │   │ │- update DB   │ │    │   lookup        │
    │             │   │ └──────────────┘ │    │ - Service role  │
    │             │   │                  │    │   writes only    │
    │             │   │ Secrets:         │    │                 │
    │             │   │ - SUPABASE_URL   │    │ Triggers:       │
    │             │   │ - SERVICE_ROLE   │    │ - Auto-assign   │
    │             │   │ - (Optional)     │    │   issuer on     │
    │             │   │   BLOCKCHAIN_*   │    │   insert        │
    │             │   └──────────────────┘    │ - Index lookup  │
    └─────────────┘                           │   by token      │
         │                                    └─────────────────┘
         │                                           │
         ▼                                           ▼
    (Authenticated)                       (Service Role Access)
    - Users upload                        - Privileged ops
    - Store files/hash                    - No RLS bypass
    - Create records                      - Query any data
                                         - Update metadata

         ┌────────────────────┬──────────────────────┐
         │                    │                      │
         ▼                    ▼                      ▼

    ┌──────────────┐   ┌──────────────┐    ┌────────────────────┐
    │ Supabase     │   │ Supabase     │    │ Blockchain Network │
    │ Auth         │   │ Logs &       │    │ (Optional)         │
    │              │   │ Analytics    │    │                    │
    │ JWT tokens   │   │              │    │ - Ethereum Mainnet │
    │ Session      │   │ Monitor:     │    │ - Polygon          │
    │ management   │   │ - Function   │    │ - Sepolia Testnet  │
    │              │   │   calls      │    │                    │
    │              │   │ - Errors     │    │ Smart Contract:    │
    │              │   │ - Performance│    │ DocumentAnchor     │
    │              │   │              │    │ - anchorHash()     │
    │              │   │              │    │ - getHash()        │
    │              │   │              │    │ - Stores file hash │
    │              │   │              │    │   on-chain         │
    └──────────────┘   └──────────────┘    └────────────────────┘
         │                                           │
         └───────────────────┬───────────────────────┘
                             │
                    All traffic HTTPS/TLS
                    Secrets encrypted at rest
                    Signed URLs for file access
```

---

## 📊 Data Flow: Create Share Link

```
User clicks "Share" on document in Dashboard
                │
                ▼
┌─────────────────────────────────┐
│ Share Modal Opens               │
│ - Select expiry option          │
│ - Display blockchain address    │
│ - Show "Create Link" button     │
└─────────────────────────────────┘
                │
                ▼
User clicks "Create Verification Link"
                │
                ▼
┌─────────────────────────────────┐      ┌──────────────────────┐
│ Dashboard.tsx:                  │      │ POST Request:        │
│ handleCreateShareLink()          │───▶ │ /functions/v1/       │
│                                 │      │ create-share         │
│ body: {                         │      │                      │
│   documentId: "uuid",           │      │ Payload:             │
│   expiry: "24hr"                │      │ {documentId, expiry} │
│ }                               │      └──────────────────────┘
└─────────────────────────────────┘                │
                ▲                                  ▼
                │                 ┌─────────────────────────────────┐
                │                 │ Edge Function: create-share     │
                │                 │ (Deno Runtime)                  │
                │                 │                                 │
                │                 │ 1. Parse request (token, expiry)│
                │                 │ 2. Verify SUPABASE_URL secret   │
                │                 │ 3. Fetch document from DB       │
                │                 │ 4. Compute expires_at timestamp │
                │                 │ 5. Create snapshot object:      │
                │                 │    - document_type              │
                │                 │    - issuer (auto-assigned)     │
                │                 │    - blockchain_address         │
                │                 │    - file_hash                  │
                │                 │    - uploaded_at                │
                │                 │ 6. Generate token (32 hex)      │
                │                 │ 7. Insert into verification_    │
                │                 │    tokens table                 │
                │                 │ 8. Create signed URL (300 sec)  │
                │                 │ 9. Return response              │
                │                 └─────────────────────────────────┘
                │                                  │
                │                                  ▼
                │                 ┌─────────────────────────────────┐
                │                 │ Supabase Database               │
                │                 │                                 │
                │                 │ verification_tokens INSERT:     │
                │                 │ - token: "abc123..."  (unique)  │
                │                 │ - document_id: "xyz"  (FK)      │
                │                 │ - document_snapshot: JSONB      │
                │                 │ - file_hash: "0x1234..."        │
                │                 │ - expires_at: "2024-01-15..."   │
                │                 │ - created_at: NOW()             │
                │                 └─────────────────────────────────┘
                │                                  │
                │                                  ▼
                │                 ┌─────────────────────────────────┐
                │                 │ Supabase Storage                │
                │                 │                                 │
                │                 │ Generate Signed URL:            │
                │                 │ - File: Documents/doc-uuid      │
                │                 │ - Expiry: 300 seconds (5 min)   │
                │                 │ - Returns: presigned download   │
                │                 │   URL with credentials embedded │
                │                 └─────────────────────────────────┘
                │                                  │
                └──────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────┐
    │ Response returned to Frontend    │
    │ {                               │
    │   success: true,                │
    │   token: "abc123...",           │
    │   expires_at: "2024-01-15...",  │
    │   preview_url: "https://..."    │
    │ }                               │
    └─────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────┐
    │ Dashboard shows result:          │
    │ 1. Copy verification link       │
    │    to clipboard                 │
    │ 2. Show expiry timestamp        │
    │ 3. Success toast notification   │
    │                                 │
    │ Share Link:                     │
    │ /verify?token=abc123...         │
    └─────────────────────────────────┘

Time to completion: ~500-1000ms
```

---

## 📊 Data Flow: Verify Document

```
User visits /verify page with token
                │
                ▼
┌─────────────────────────────────┐
│ Verify.tsx:                     │
│ - Extract token from URL        │
│ - Call handleVerify(token)      │
│ - Show loading spinner          │
└─────────────────────────────────┘
                │
                ▼
        POST /functions/v1/verify-token
        with { token: "abc123..." }
                │
                ▼
┌─────────────────────────────────┐
│ Edge Function: verify-token     │
│ (Deno Runtime)                  │
│                                 │
│ 1. Parse request (token)        │
│ 2. Verify secrets exist         │
│ 3. Fetch token from verification
│    _tokens table (by token=...)  │
│ 4. Check if expired:            │
│    if expires_at && now > exp   │
│      return 410 (gone)          │
│ 5. Fetch associated document    │
│    from documents table         │
│ 6. Create signed URL (60 sec)   │
│    for file download            │
│ 7. Download file via signed URL │
│ 8. Compute SHA-256 hash of file │
│    using Web Crypto API         │
│ 9. Get snapshot_hash from token │
│    row (captured at token       │
│    creation time)               │
│ 10. Compare hashes:             │
│     if (computed === snapshot)  │
│       verified = true           │
│     else                        │
│       verified = false          │
│       (document modified!)      │
│ 11. Return response             │
└─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│ Response:                       │
│ {                               │
│   success: true,                │
│   verified: true/false,         │
│   document: {                   │
│     name: "passport.pdf",       │
│     type: "Passport",           │
│     issuer: "Immigration Dept", │
│     blockchain_address: "0x...",│
│     uploaded_at: "2024-01-10..."│
│   },                            │
│   file: {                       │
│     preview_url: "https://...", │
│     computed_hash: "0xabc...",  │
│     snapshot_hash: "0xabc..."   │
│   }                             │
│ }                               │
└─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│ Verify.tsx: Display Result      │
│ 1. Hide loading spinner         │
│ 2. Show verification status:    │
│    ✓ Document Verified (green)  │
│    ✗ Document Not Verified (red)│
│ 3. Display document info:       │
│    - Name, Type, Issuer         │
│    - Upload date, Blockchain    │
│ 4. Show hash comparison:        │
│    - Computed hash (latest)     │
│    - Snapshot hash (original)   │
│    - Match? Yes/No              │
│ 5. Provide preview link:        │
│    "View Document Preview"      │
│    (expires in 60 seconds)      │
└─────────────────────────────────┘

Time to completion: ~1-2 seconds (depends on file size)
Hash computation: SHA-256 (Web Crypto API in Deno)
```

---

## 🔒 Security Model

### Defense Layers

```
Layer 1: Authentication (Client)
├─ Supabase JWT tokens
├─ User session validation
└─ Protected routes in React Router

Layer 2: API Security (Functions)
├─ CORS policy enforcement
├─ HTTPS/TLS for all traffic
├─ Rate limiting (optional)
└─ Input validation/sanitization

Layer 3: Authorization (Database)
├─ RLS (Row-Level Security) policies
├─ Service role key restricted to functions
├─ Users can only access own documents
└─ Token lookup is public (by design)

Layer 4: Data Protection (Storage)
├─ Private bucket (authenticated uploads only)
├─ Signed URLs (short expiry: 60-300 sec)
├─ Server-side file download (not exposed to client)
└─ One-time-use URLs (optional enhancement)

Layer 5: Integrity Verification (Hashing)
├─ SHA-256 hash computed on upload
├─ Snapshot captured at token creation
├─ Hash recomputed on verification
├─ Mismatch = document tampered
└─ Tamper detection on public verification
```

### Attack Scenarios & Mitigations

| Attack | Scenario | Mitigation |
|--------|----------|-----------|
| **Leaked Service Role Key** | Attacker gets SUPABASE_SERVICE_ROLE_KEY | Rotate key every 90 days; audit logs; RLS policies limit impact |
| **Unsigned Token Forgery** | Attacker creates fake token | Tokens are random 32-hex; would need to guess (2^128 combinations) |
| **Document Modification** | Attacker modifies file in storage | Hash mismatch detected; verified flag shows false |
| **Replaying Old Token** | Attacker reuses valid token | Tokens have expiry; old tokens automatically rejected |
| **Bypassing Expiry** | Attacker modifies expires_at in DB | Service role functions compare current time server-side |
| **Unsigned URL Abuse** | Attacker uses preview URL after expiry | Signed URLs are time-bound; 60-300 sec window |
| **Direct Storage Access** | Attacker tries to download file directly | Bucket is private; only signed URLs allow access |
| **SQL Injection** | Attacker injects malicious SQL | Supabase client uses parameterized queries |
| **CORS Bypass** | Attacker POSTs from wrong origin | CORS headers restrict requests to allowed origins |
| **Man-in-the-Middle** | Attacker intercepts traffic | All connections HTTPS/TLS; encrypted at rest |

---

## 📈 Performance Metrics

### Function Response Times

| Operation | Time | Bottleneck |
|-----------|------|-----------|
| Create Share Link | 200-400ms | DB insert + signed URL generation |
| Verify Token (small file <1MB) | 500-800ms | File download + SHA-256 computation |
| Verify Token (large file 10MB+) | 2-5 sec | Network + hash computation |
| Token Lookup (direct query) | 50-100ms | DB index on token column |

### Database Query Optimization

```sql
-- Indexes created for performance
CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX idx_documents_blockchain_address ON documents(blockchain_address);
CREATE INDEX idx_documents_issuer ON documents(issuer);

-- Typical query execution:
SELECT * FROM verification_tokens WHERE token = 'abc123...'  -- 10-50ms (indexed)
SELECT * FROM documents WHERE id = 'uuid'                    -- 5-20ms (PK index)
```

### Storage Performance

- **Signed URL generation**: 50-100ms
- **File download (1MB)**: 100-500ms (depends on network)
- **SHA-256 computation (1MB)**: 10-50ms

---

## 🛠️ Monitoring & Observability

### Key Metrics to Monitor

```typescript
// Capture in function logs
1. Function invocation count (per function)
2. Error rate (4xx, 5xx responses)
3. Response time (histogram)
4. Token generation rate (create-share)
5. Verification success rate (verified true/false ratio)
6. Expired token rejections (410 responses)
7. File hash mismatches (tamper detection)
8. Database query times (slow query analysis)
9. Storage access patterns (bucket logs)
```

### Supabase Observability Stack

```
┌─────────────────────────────────┐
│ Supabase Dashboard              │
├─────────────────────────────────┤
│ - Function Metrics              │
│ - Database Query Logs           │
│ - Storage Access Logs           │
│ - Real-time Events              │
│ - Performance Insights          │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Supabase Functions Logs         │
│ (via CLI or Dashboard)          │
├─────────────────────────────────┤
│ supabase functions logs         │
│   create-share                  │
│   --follow                      │
│   --limit 100                   │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Cloud Logging (Optional)        │
│ - Datadog                       │
│ - New Relic                     │
│ - CloudWatch (AWS)              │
│ - Cloud Logging (GCP)           │
│ - Loggly                        │
└─────────────────────────────────┘
```

---

## 🚀 Deployment & Scaling

### Single-Region Deployment (Current)

```
┌──────────────────────────────────┐
│ Supabase Project (Single Region) │
│                                  │
│ - Database (PostgreSQL)          │
│ - Storage (S3-compatible)        │
│ - Edge Functions (Deno)          │
│ - Auth (JWT)                     │
└──────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Geo-distributed via CDN          │
│ - CloudFlare                     │
│ - Fastly                         │
└──────────────────────────────────┘
```

### Multi-Region Deployment (Future)

```
┌─────────────────────┐
│ US Supabase Project │
│ Edge Functions:     │
│ create-share        │
│ verify-token        │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ EU Supabase Project │
│ Edge Functions:     │
│ create-share        │
│ verify-token        │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ APAC Supabase Project
│ Edge Functions:     │
│ create-share        │
│ verify-token        │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Global Load Balancer│
│ (Route to nearest)  │
└─────────────────────┘
```

---

## 📚 Related Documentation

| Document | Purpose |
|----------|---------|
| `EDGE_FUNCTIONS_DEPLOYMENT.md` | Deployment steps & RLS setup |
| `SECRETS_AND_CONFIG.md` | Secret management & configuration |
| `EDGE_FUNCTIONS_FRONTEND_EXAMPLES.ts` | Frontend integration code |
| `DEPLOY_SCRIPT.md` | Automated deployment scripts |
| `supabase_schema_additions.sql` | Database schema |
| `functions/create-share/index.ts` | Create share function source |
| `functions/verify-token/index.ts` | Verify token function source |
| `functions/anchor-hash/index.ts` | Blockchain anchoring scaffold |

---

## ✅ Deployment Checklist

- [ ] SQL migration executed (schema + trigger)
- [ ] SUPABASE_URL secret set
- [ ] SUPABASE_SERVICE_ROLE_KEY secret set
- [ ] create-share function deployed
- [ ] verify-token function deployed
- [ ] RLS policies enabled and verified
- [ ] Storage bucket policies set
- [ ] Frontend fetch calls wired up
- [ ] E2E test: upload → share → verify
- [ ] Function logs monitored
- [ ] Error alerting configured
- [ ] Security audit completed


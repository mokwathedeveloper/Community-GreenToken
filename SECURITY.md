# Security Policy — Community GreenToken

## Supported Versions

| Component | Version | Supported |
|---|---|---|
| Frontend (Next.js) | 16.x | ✅ |
| Smart Contracts (Soroban/Rust) | soroban-sdk 26.0.1 | ✅ |
| Stellar JS SDK | 13.1.0 | ✅ |
| Supabase Auth Helpers | Latest | ✅ |
| Stripe | 17.x | ✅ |

---

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report security issues directly to the maintainer:

| Channel | Contact |
|---|---|
| **Email (preferred)** | [mokwaohuru@gmail.com](mailto:mokwaohuru@gmail.com) |
| **Subject line** | `[SECURITY] Community GreenToken — <brief description>` |

**Response SLA:**
- Acknowledgement within **24 hours**
- Initial triage within **72 hours**
- Fix or mitigation plan within **7 days** for critical issues

We follow coordinated disclosure. Please allow 90 days before public disclosure to give us time to patch and notify affected parties.

---

## Scope

### In Scope

| Target | Description |
|---|---|
| Soroban smart contracts | GreenToken, ActionRegistry, RewardManager on Stellar Testnet |
| Next.js API routes | All 38 routes under `/app/api/` |
| Auth middleware | JWT validation, session management, org scoping |
| Database RLS | Supabase Row-Level Security policies |
| Stripe webhook | Signature validation, billing event processing |
| Admin keypair handling | Secret key isolation, server-side-only usage |

### Out of Scope

- Stellar Network infrastructure itself (report to Stellar Development Foundation)
- Supabase platform (report to Supabase)
- Vercel/hosting platform (report to Vercel)
- Social engineering attacks
- Vulnerabilities requiring physical access to infrastructure
- Rate-limit bypass via distributed IPs (accepted limitation on free tier)

---

## Smart Contract Security

### Audit Status

| Contract | Internal Review | External Audit | Status |
|---|---|---|---|
| GreenToken (GTK SEP-41) | ✅ Complete | ⏳ Planned (pre-mainnet) | Internal review passed |
| ActionRegistry | ✅ Complete | ⏳ Planned (pre-mainnet) | Internal review passed |
| RewardManager | ✅ Complete | ⏳ Planned (pre-mainnet) | Internal review passed |

External audit is scheduled before Stellar Mainnet deployment. No production funds are at risk on Testnet.

### Security Design Decisions

| Decision | Rationale |
|---|---|
| Admin-only minting | GTK cannot be self-minted; only platform admin can call `mint()` |
| Cross-contract atomicity | `verify_action()` and `mint()` succeed or fail together — no partial state |
| Evidence hash uniqueness | SHA-256 stored on-chain; duplicate submission rejected at contract level |
| User-signed redemptions | `redeem()` requires Freighter signature — platform cannot burn user GTK |
| No owner renounce without sweep | Platform admin key can be rotated; no accidental lock |

---

## API Security

### Authentication & Authorization

Every authenticated API route validates the Supabase JWT before executing:

```typescript
// lib/middleware/auth.ts
const { data: { user }, error } = await supabase.auth.getUser(token);
if (error || !user) return res.status(401).json({ error: "Unauthorized" });
```

Supabase Row-Level Security ensures users can only read/write their own org's data, even if application code contained a bug.

### Rate Limiting

Write-heavy and sensitive endpoints are rate-limited in `lib/middleware/rateLimiter.ts`:

| Endpoint | Limit |
|---|---|
| `POST /api/actions/submit` | 10 requests / hour / user |
| `POST /api/actions/verify` | 50 requests / hour / admin |
| `POST /api/auth/signin` | 5 requests / minute / IP |
| `POST /api/billing/webhook` | 100 requests / minute (Stripe IPs only) |
| `GET /api/leaderboard` | 30 requests / minute / user |
| All other write routes | 20 requests / minute / user |

### Input Validation

All API inputs are validated with Zod schemas before processing:

```typescript
// lib/validation/schemas.ts
export const submitActionSchema = z.object({
  action_type: z.number().int().min(0).max(9),
  description: z.string().min(10).max(500),
  evidence_hash: z.string().length(64).regex(/^[a-f0-9]+$/),
});
```

No raw SQL. All database operations use Supabase's parameterized query builder.

### Secret Management

The following secrets are **server-side only** and never exposed to the browser:

```
STELLAR_ADMIN_SECRET_KEY      — Soroban transaction signing
SUPABASE_SERVICE_ROLE_KEY     — Supabase admin operations
STRIPE_SECRET_KEY             — Stripe API
STRIPE_WEBHOOK_SECRET         — Stripe webhook signature
```

Verify no secrets are committed to git history:

```bash
git log --all --full-history -- "**/.env*"
git grep -r "sk_test\|sk_live\|S[A-Z0-9]\{55\}" -- "*.ts" "*.tsx"
```

### Stripe Webhook Security

All Stripe webhook events are verified using the signing secret before processing:

```typescript
const event = stripe.webhooks.constructEvent(
  rawBody,
  req.headers["stripe-signature"],
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

Unverified webhook calls are rejected with 400.

---

## Frontend Security

### Dependency Scanning

```bash
npm audit --audit-level=high
npm outdated
```

Run before every deployment. Critical and high vulnerabilities block release.

### XSS Prevention

- All user-generated content rendered via React (auto-escaped)
- No `dangerouslySetInnerHTML` usage anywhere in the codebase
- User-submitted action descriptions are sanitized before storage

### OWASP Top 10 Coverage

| Risk | Status | Implementation |
|---|---|---|
| **A01 Broken Access Control** | ✅ Mitigated | Supabase RLS on all 13 tables; org_id enforced on every query |
| **A02 Cryptographic Failures** | ✅ Mitigated | TLS everywhere; no plaintext secrets; SHA-256 evidence hashing |
| **A03 Injection** | ✅ Mitigated | Supabase parameterized queries; Zod validation; no raw SQL |
| **A04 Insecure Design** | ✅ Mitigated | Atomic contract calls; admin-only minting; user-signed redemptions |
| **A05 Security Misconfiguration** | ✅ Mitigated | `.env.example` documents all vars; no default credentials |
| **A06 Vulnerable Components** | ✅ Monitored | `npm audit` on every deployment |
| **A07 Auth Failures** | ✅ Mitigated | Supabase JWT; RLS per user; session validation in middleware |
| **A08 Data Integrity Failures** | ✅ Mitigated | Evidence SHA-256 committed on-chain; Stripe webhook signatures |
| **A09 Logging Failures** | ✅ Mitigated | Admin secret key never logged; no sensitive data in error responses |
| **A10 SSRF** | ✅ Mitigated | No user-controlled URL fetching; all external calls server-to-known-endpoint |

---

## Incident Response

### Severity Levels

| Level | Definition | Response Time |
|---|---|---|
| **Critical** | Funds at risk; active exploitation; key exposure | Immediate (< 1 hour) |
| **High** | Significant data breach; smart contract bug | < 4 hours |
| **Medium** | Degraded service; limited data exposure | < 24 hours |
| **Low** | Minor bug; cosmetic/information disclosure | < 7 days |

### Response Playbook

**Critical incident (smart contract / key exposure):**
1. Rotate `STELLAR_ADMIN_SECRET_KEY` immediately
2. Assess if any unauthorized minting occurred (check Stellar Expert)
3. Notify affected organizations via email
4. Engage external reviewer for emergency contract assessment
5. Post-mortem published within 7 days

**High incident (data breach):**
1. Assess scope using Supabase audit logs
2. Disable affected API routes if necessary
3. Patch and redeploy within 4 hours
4. Notify affected users
5. Post-mortem within 48 hours

---

## Bug Bounty

A formal bug bounty program will be launched at Mainnet deployment. Interim recognition:

| Severity | Recognition |
|---|---|
| Critical (smart contract fund loss) | Hall of Fame + public acknowledgement |
| High (significant data breach) | Public acknowledgement in SECURITY.md |
| Medium | Public acknowledgement |
| Low | Thank-you email |

---

## Security Contacts

| Role | Contact |
|---|---|
| Security Lead | Mokwa Moffat · [mokwaohuru@gmail.com](mailto:mokwaohuru@gmail.com) |

*Last updated: June 2026*

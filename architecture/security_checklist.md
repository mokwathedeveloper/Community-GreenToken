# Community GreenToken Security Checklist

This document provides a **professional security checklist** for the Community GreenToken web application, covering authentication, data validation, smart contract security, and data protection.

---

## 1. Authentication & Authorization
- Implement user authentication using **Supabase Auth** or wallet integration.
- Use **JWT or secure session tokens** for API authentication.
- Enforce role-based access control (RBAC) for admin vs. regular users.
- Restrict smart contract verification functions to authorized admins.
- Ensure session expiration and refresh tokens are handled securely.

## 2. Data Validation and Sanitization
- Validate all user inputs on both frontend and backend.
- Sanitize input to prevent **SQL injection, XSS, and code injection** attacks.
- Enforce required field checks and type validation.
- Use schema validation libraries (e.g., Zod, Yup) for consistent rules.
- Log and monitor invalid or suspicious input attempts.

## 3. Smart Contract Security Best Practices
- Verify and audit all smart contracts before deployment.
- Use **reputable frameworks** (e.g., Soroban SDK) for contract development.
- Implement proper access control on minting, burning, and verification functions.
- Test contracts with **unit and integration tests** before mainnet deployment.
- Handle reentrancy and overflow attacks carefully.
- Maintain a clear and transparent token supply logic.

## 4. Encryption and Data Protection Guidelines
- Encrypt sensitive data at rest and in transit (SSL/TLS for API calls).
- Protect Supabase credentials and anonymous keys; do not expose in frontend code.
- Enable Row Level Security (RLS) for user-specific data.
- Use secure hashing for any sensitive user data (passwords, if applicable).
- Maintain regular backups of critical data.
- Monitor for suspicious access and implement rate limiting.

This checklist ensures that the Community GreenToken application adheres to **industry-standard security practices**, maintaining the integrity, confidentiality, and availability of user data and token transactions.

---

## SaaS Extension — Multi-Tenant Security Checklist

### Tenant Isolation
- [ ] Every database query includes `WHERE org_id = :orgId` (never query without it)
- [ ] Supabase RLS policies enabled and tested on all 9 tenant-scoped tables
- [ ] JWT must contain `org_id` — reject requests missing this claim
- [ ] API routes validate `JWT.org_id === requested resource's org_id` on every mutation
- [ ] Super admin routes additionally check `JWT.role === 'superadmin'` server-side
- [ ] File uploads stored in org-specific Supabase Storage paths: `/{org_id}/...`
- [ ] Leaderboard and analytics APIs never aggregate across org boundaries

### Billing Security
- [ ] Stripe webhook signature verified with `stripe.webhooks.constructEvent()` before processing
- [ ] Billing events stored in `billing_events` table for audit trail
- [ ] Plan downgrade immediately enforces new member limit (no grace period for data access)
- [ ] `stripe_customer_id` is unique per org — prevent customer collision
- [ ] Stripe secret key never exposed to frontend (server-only env var)

### Invite Security
- [ ] Invite tokens are cryptographically random (24 bytes hex = 48-char string)
- [ ] Invite tokens expire after 7 days by default
- [ ] Optional `uses_left` counter prevents mass account creation
- [ ] Accepting an expired or revoked invite returns 410 Gone (not 404)

### Smart Contract Security (SaaS)
- [ ] Per-org contract: only platform wallet (owner) can call `mint` and `burn`
- [ ] Shared contract: `orgId` parameter is bytes32 — validate format before storing
- [ ] Factory contract: `deployForOrg` is `onlyOwner` — platform wallet only
- [ ] Store `contract_address` in DB at deploy time; never derive from org metadata
- [ ] Monitor for unusual minting spikes per org (fraud detection)

### Rate Limiting Per Org
- [ ] Rate limits are enforced per `org_id`, not just per IP (prevents one org DoS-ing another)
- [ ] Free plan: 30 req/min, Starter: 120, Pro: 600
- [ ] Return `429 Too Many Requests` with `Retry-After` header

### Admin Security
- [ ] Org admin cannot access or modify other orgs' data (RLS enforced)
- [ ] Super admin actions are logged in `superadmin_audit_log` table
- [ ] Super admin session timeout: 1 hour of inactivity
- [ ] Consider requiring TOTP/2FA for super admin login

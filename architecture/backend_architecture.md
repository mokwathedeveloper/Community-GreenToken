# Community GreenToken Backend Architecture

This document outlines the **backend architecture** for the Community GreenToken web application, including backend flow, serverless/API routes, state management, smart contract interactions, and business logic modules.

---

## 1. Backend Flow
1. Frontend submits requests for action verification, token minting, dashboard data, or redemption.
2. Next.js API routes handle request validation, authentication, and authorization.
3. Valid requests trigger business logic modules that interact with:
   - Supabase database for user data, actions, token balances, leaderboard, and donation records.
   - Smart contracts for token minting (GreenToken), action verification (ActionRegistry), and redemption (RewardManager).
4. Responses are returned to the frontend with updated data and status messages.

## 2. Serverless/API Routes
- **Action Submission API:** `/api/actions/submit` (POST)
- **Action Verification API:** `/api/actions/verify` (POST, admin)
- **Token Balance API:** `/api/tokens/balance` (GET)
- **Token Redemption API:** `/api/tokens/redeem` (POST)
- **Leaderboard API:** `/api/leaderboard` (GET)
- **Analytics API:** `/api/analytics/metrics` (GET, admin)
- **Donation Tracking API:** `/api/donations` (GET/POST)

## 3. State Management
- Backend maintains ephemeral state for request handling and persistent state in Supabase.
- Real-time updates for dashboards and leaderboard are handled via serverless functions.
- Error and success states propagated back to frontend with standardized response objects.

## 4. Smart Contract Interactions
- **GreenToken Contract:** Minting, transferring, and burning tokens.
- **ActionRegistry Contract:** Logging and verification of sustainable actions.
- **RewardManager Contract:** Redeeming tokens for rewards and donations.
- Backend API routes handle calls to smart contracts using secure wallet integration and signed transactions.

## 5. Business Logic Modules
- **Action Validation:** Check action type, timestamp, and user authenticity.
- **Token Management:** Calculate tokens earned, update balances, and handle minting/burning.
- **Leaderboard Updates:** Compute rankings and generate metrics.
- **Donation Processing:** Track and record token contributions to community projects.
- **Analytics Integration:** Send data to AI/analytics APIs for insights.
- **Error Handling:** Standardized error messages, retries, and logging.

This backend architecture ensures **secure, scalable, and hackathon-ready functionality**, supporting the Community GreenToken MVP with mandatory Leaderboard, Analytics/Impact Metrics, and Donation Tracking.

---

## SaaS Extension — Multi-Tenant Backend

> **See also:** `saas/multi_tenancy_architecture.md` and `saas/saas_api_endpoints.md`

### New Middleware Layer

```
Request → Auth Middleware → Tenant Middleware → Plan Gate → Route Handler
```

**`tenantMiddleware.ts`** — runs on every API request:
1. Extracts `org_id` from JWT claims.
2. Attaches org config (plan, contract address, member limit) to `req.org`.
3. Returns 401 if no valid `org_id` on protected routes.

**`planGate.ts`** — enforces plan feature limits:
```typescript
// Blocks Starter/Free from accessing analytics
if (!org.plan.analytics) return 403('Upgrade to Starter for Analytics');
```

**`adminGuard.ts`** — protects super admin routes:
```typescript
if (jwt.role !== 'superadmin') return 403('Super admin access required');
```

### New Services

| Service | Responsibility |
|---|---|
| `orgService.ts` | Org creation, config updates, slug management |
| `billingService.ts` | Stripe checkout, plan sync, webhook processing |
| `contractService.ts` | Factory deploy, shared contract calls, tx monitoring |
| `inviteService.ts` | Invite token generation, validation, acceptance |

### Updated Business Logic

All existing business logic modules are extended to:
1. Accept `orgId` as a required parameter on every operation.
2. Scope all Supabase queries with `WHERE org_id = orgId`.
3. Use the org's `contract_address` for all blockchain calls instead of a hardcoded address.

### New API Route Groups

```
/api/orgs/         Organization management
/api/invites/      Invite create + accept
/api/rewards/      Per-org reward catalog
/api/billing/      Stripe integration
/api/contracts/    Smart contract deploy + query
/api/admin/        Super admin platform management
```



# Community GreenToken — SaaS API Endpoints

All org-scoped endpoints require `Authorization: Bearer <jwt>` where the JWT contains `org_id` and `role` claims. Super-admin endpoints additionally require `role = 'superadmin'`.

---

## Authentication & Org Context

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signin` | Public | Sign in → returns JWT with org_id + role |
| `POST` | `/api/auth/signup` | Public | Register new user (requires invite token) |
| `GET` | `/api/auth/me` | Bearer | Current user + org context |
| `POST` | `/api/auth/signout` | Bearer | Invalidate session |

---

## Organization Management

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/orgs/create` | Public | Create new organization (onboarding step 1) |
| `GET` | `/api/orgs/check-slug?slug=xxx` | Public | Check slug availability |
| `GET` | `/api/orgs/:id` | Bearer (owner) | Get org details |
| `PUT` | `/api/orgs/:id` | Bearer (admin) | Update org settings |
| `PUT` | `/api/orgs/:id/config` | Bearer (admin) | Update token config + action types |
| `DELETE` | `/api/orgs/:id` | Bearer (owner) | Delete org + export data |
| `GET` | `/api/orgs/:id/usage` | Bearer (admin) | Current plan usage (members, tokens) |

---

## Member Management

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/orgs/:id/members` | Bearer (admin) | List all members (paginated) |
| `PUT` | `/api/orgs/:id/members/:userId/role` | Bearer (admin) | Change member role |
| `DELETE` | `/api/orgs/:id/members/:userId` | Bearer (admin) | Remove member |
| `POST` | `/api/invites/create` | Bearer (admin) | Generate invite link |
| `GET` | `/api/invites/:token` | Public | Validate invite token |
| `POST` | `/api/invites/:token/accept` | Bearer | Accept invite → create membership |
| `GET` | `/api/invites` | Bearer (admin) | List active invites |
| `DELETE` | `/api/invites/:id` | Bearer (admin) | Revoke invite |

---

## Actions (Org-Scoped)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/actions` | Bearer | List actions for current org (filterable) |
| `POST` | `/api/actions` | Bearer | Submit new sustainable action |
| `GET` | `/api/actions/:id` | Bearer | Get single action detail |
| `PUT` | `/api/actions/:id/verify` | Bearer (admin) | Verify action → mint tokens |
| `PUT` | `/api/actions/:id/reject` | Bearer (admin) | Reject action |
| `GET` | `/api/actions/pending` | Bearer (admin) | Verification queue |

---

## Token Balances (Org-Scoped)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/tokens/balance` | Bearer | Current user's token balance in org |
| `GET` | `/api/tokens/history` | Bearer | Token earn/spend history |
| `GET` | `/api/tokens/supply` | Bearer | Total org token supply stats |

---

## Token Redemption (Org-Scoped)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/rewards` | Bearer | List active rewards for org |
| `POST` | `/api/rewards` | Bearer (admin) | Create new reward |
| `PUT` | `/api/rewards/:id` | Bearer (admin) | Update reward |
| `DELETE` | `/api/rewards/:id` | Bearer (admin) | Deactivate reward |
| `POST` | `/api/redeem` | Bearer | Redeem tokens for a reward |
| `GET` | `/api/redeem/history` | Bearer | User's redemption log |

---

## Leaderboard (Org-Scoped)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/leaderboard?period=all_time` | Bearer | Org leaderboard (weekly/monthly/all_time) |
| `GET` | `/api/leaderboard/me` | Bearer | Current user's rank |

---

## Analytics (Org-Scoped, Starter+ plan)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/analytics/overview` | Bearer (admin) | Key org metrics |
| `GET` | `/api/analytics/actions?from=&to=` | Bearer (admin) | Action trends over time |
| `GET` | `/api/analytics/tokens` | Bearer (admin) | Token distribution + velocity |
| `GET` | `/api/analytics/members` | Bearer (admin) | Member growth + activity |
| `GET` | `/api/analytics/donations` | Bearer (admin) | Donation summary |

---

## Donations (Org-Scoped)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/donations/projects` | Bearer | List donation projects for org |
| `POST` | `/api/donations/projects` | Bearer (admin) | Create donation project |
| `POST` | `/api/donations` | Bearer | Allocate tokens to a project |
| `GET` | `/api/donations/history` | Bearer | User donation log |

---

## Billing (Stripe)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/billing/plans` | Public | List available plans |
| `POST` | `/api/billing/create-checkout` | Bearer (owner) | Start Stripe checkout |
| `POST` | `/api/billing/portal` | Bearer (owner) | Open Stripe customer portal |
| `POST` | `/api/billing/webhook` | Stripe sig | Receive Stripe events |
| `GET` | `/api/billing/status` | Bearer (owner) | Current subscription status |

---

## Smart Contracts

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/contracts/deploy` | Bearer (owner) | Deploy/assign contract for org |
| `GET` | `/api/contracts/info` | Bearer | Get org's contract address + stats |

---

## Super Admin (Platform Owner Only)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/orgs` | `superadmin` | All organizations |
| `GET` | `/api/admin/orgs/:id` | `superadmin` | Org detail + usage |
| `PUT` | `/api/admin/orgs/:id/plan` | `superadmin` | Override org plan |
| `PUT` | `/api/admin/orgs/:id/suspend` | `superadmin` | Suspend org |
| `GET` | `/api/admin/metrics` | `superadmin` | Platform-wide stats (MRR, members, churn) |
| `GET` | `/api/admin/billing-events` | `superadmin` | Stripe event log |
| `POST` | `/api/admin/billing-events/:id/reprocess` | `superadmin` | Re-run a failed webhook |

---

## API Response Format (All Endpoints)

```typescript
// Success
{ "data": { ... }, "meta": { "org_id": "...", "plan": "pro" } }

// Error
{ "error": { "code": "PLAN_LIMIT_EXCEEDED", "message": "Upgrade to Pro to add more members." } }

// Paginated list
{ "data": [...], "pagination": { "page": 1, "per_page": 20, "total": 143 } }
```

---

## Rate Limits

| Plan | Requests/minute |
|---|---|
| Free | 30 |
| Starter | 120 |
| Pro | 600 |
| Enterprise | Custom |

Rate limit headers returned on every response:
```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1700000000
```

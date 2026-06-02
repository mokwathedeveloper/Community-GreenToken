# Community GreenToken — SaaS Transformation Overview

## What Changes: Single-Community → Multi-Tenant Platform

Community GreenToken started as a single-community hackathon MVP. The SaaS version sells the **entire platform** to organizations (schools, municipalities, NGOs, businesses) who each run their own independent GreenToken program.

---

## The SaaS Value Proposition

| Customer Type | Use Case | Willingness to Pay |
|---|---|---|
| Schools / Universities | Student sustainability challenges | $49–$199/month |
| Municipal Governments | Citizen eco-reward programs | $199–$999/month |
| NGOs / Charities | Donor engagement + impact tracking | $49–$199/month |
| Corporates (ESG) | Employee sustainability incentives | $499–$2,000/month |
| Events / Festivals | Short-term eco-action campaigns | $99/event |

---

## SaaS Architecture Model: Multi-Tenant

```
Platform Owner (you)
       │
       ├── Organization A  (e.g., Cape Town City Council)
       │      ├── Members: 5,000 citizens
       │      ├── Token: "CapeTownGreen"
       │      └── Smart Contract: 0xABC...
       │
       ├── Organization B  (e.g., Wits University)
       │      ├── Members: 800 students
       │      ├── Token: "WitsEco"
       │      └── Smart Contract: 0xDEF...
       │
       └── Organization C  (e.g., Pick n Pay)
              ├── Members: 2,000 employees
              ├── Token: "PnPGreen"
              └── Smart Contract: 0x123...
```

Every organization is **fully isolated** — their members, tokens, leaderboard, and donations are separate.

---

## What Stays the Same

All existing pages and features remain — they just become **org-scoped**:

| Feature | Single MVP | SaaS Version |
|---|---|---|
| Landing Page | One platform | Public marketing site + `/pricing` |
| Sign In | One user pool | Auth scoped to org (`org_id` in JWT) |
| Dashboard | Global | Per-org dashboard |
| Token Redemption | Global pool | Per-org reward catalog |
| Leaderboard | Global | Per-org leaderboard |
| Analytics | Global | Per-org + platform-wide (super admin) |
| Donations | Global | Per-org projects |
| Smart Contract | One contract | Factory deploys per-org contract |

---

## What Is New in SaaS

| Feature | Description |
|---|---|
| **Pricing Page** | Public plan comparison + sign-up CTA |
| **Org Onboarding Wizard** | 5-step setup: org profile → token config → contract deploy → invite members → go live |
| **Org Admin Dashboard** | Per-org admin: manage members, configure actions, view usage, billing |
| **Super Admin Dashboard** | Platform owner: all orgs, MRR, churn, contract health |
| **Billing Page** | Stripe-powered subscription management per org |
| **Member Management** | Invite links, role assignment (admin / member), bulk import |
| **Org Settings** | Token name, symbol, action types, reward catalog, branding |
| **Tenant Middleware** | Resolves `org_id` from subdomain or JWT on every request |

---

## Technology Stack — No Changes Required

| Layer | Tool | SaaS Addition |
|---|---|---|
| Frontend | Next.js + TypeScript + Tailwind | Tenant middleware + org context |
| Backend | Next.js API routes | Org-scoped routes, billing webhooks |
| Database | Supabase | `organizations` table + RLS per `org_id` |
| Auth | Supabase Auth | JWT includes `org_id` + role |
| Blockchain | Smart contracts (Soroban/EVM) | `GreenTokenFactory` deploys per-org |
| Billing | **NEW: Stripe** | Subscriptions, webhooks, customer portal |
| Deployment | Vercel | Wildcard subdomain: `*.greentoken.app` |

---

## Revenue Model

```
Free Tier:     $0/month    — 1 org, 50 members, basic features (acquire users)
Starter:       $49/month   — up to 500 members, analytics, custom token name
Pro:           $199/month  — up to 5,000 members, white-label, priority support
Enterprise:    Custom      — unlimited, dedicated contract, SLA, custom integrations
```

**MRR target (hackathon pitch):** 10 Pro orgs = $1,990/month → $23,880 ARR within 6 months.

---

## Key Documents in This Folder

| File | Description |
|---|---|
| `multi_tenancy_architecture.md` | Tenant model, org_id isolation, RLS |
| `saas_database_schema.md` | Full Supabase schema with organizations |
| `billing_and_subscriptions.md` | Stripe plans, webhooks, billing flow |
| `onboarding_flow.md` | 5-step org setup wizard |
| `admin_portal.md` | Super admin + org admin specs |
| `smart_contract_strategy.md` | Factory vs shared contract |
| `saas_api_endpoints.md` | All new + updated API routes |
| `saas_folder_structure.md` | Full SaaS project directory layout |
| `saas_deployment_plan.md` | Vercel + Supabase multi-tenant deploy |

---

*This SaaS transformation preserves all existing MVP work. Every page, component, and contract already built continues to function — extended with multi-tenancy, billing, and admin tooling.*

# Community GreenToken — SaaS Transformation Report

**Date:** 2026-06-02  
**Scope:** Full transformation from single-community hackathon MVP → multi-tenant SaaS platform

---

## What Was Built

### New Folder: `saas/` — 9 Architecture Documents

| File | Description |
|---|---|
| [saas/saas_overview.md](saas/saas_overview.md) | Business model, tenant diagram, revenue model, tech stack delta |
| [saas/multi_tenancy_architecture.md](saas/multi_tenancy_architecture.md) | org_id isolation, RLS policies, JWT claims, subdomain middleware |
| [saas/saas_database_schema.md](saas/saas_database_schema.md) | Complete SQL schema: 6 new tables, org_id on all existing tables |
| [saas/billing_and_subscriptions.md](saas/billing_and_subscriptions.md) | Stripe plans, checkout, webhooks, plan enforcement, trial logic |
| [saas/onboarding_flow.md](saas/onboarding_flow.md) | 5-step org setup wizard with wireframes and API flow |
| [saas/admin_portal.md](saas/admin_portal.md) | Super admin + org admin dashboards, components, routes |
| [saas/smart_contract_strategy.md](saas/smart_contract_strategy.md) | Shared contract vs factory deploy, full Solidity code |
| [saas/saas_api_endpoints.md](saas/saas_api_endpoints.md) | All 50+ API routes (new + updated), rate limits, response format |
| [saas/saas_folder_structure.md](saas/saas_folder_structure.md) | Full directory tree for SaaS project |
| [saas/saas_deployment_plan.md](saas/saas_deployment_plan.md) | Vercel wildcard subdomains, Supabase auth config, Stripe setup |

---

### New UX Page Specs: 7 files in `ux_ui/feature_specv2/`

| File | Route | Access |
|---|---|---|
| [pricing_page_md.md](ux_ui/feature_specv2/pricing_page_md.md) | `/pricing` | Public |
| [org_onboarding_page_md.md](ux_ui/feature_specv2/org_onboarding_page_md.md) | `/org/setup` | Auth |
| [org_admin_dashboard_md.md](ux_ui/feature_specv2/org_admin_dashboard_md.md) | `/org/admin` | owner/admin |
| [super_admin_dashboard_md.md](ux_ui/feature_specv2/super_admin_dashboard_md.md) | `/admin` | superadmin |
| [billing_page_md.md](ux_ui/feature_specv2/billing_page_md.md) | `/org/admin/billing` | owner |
| [org_members_page_md.md](ux_ui/feature_specv2/org_members_page_md.md) | `/org/admin/members` | owner/admin |
| [org_settings_page_md.md](ux_ui/feature_specv2/org_settings_page_md.md) | `/org/admin/settings` | owner |

---

### Updated Existing Docs — 8 files

| File | What Changed |
|---|---|
| [architecture/database_design_plan.md](architecture/database_design_plan.md) | Added 6 new SaaS tables, org_id on all tables, updated RLS patterns |
| [architecture/backend_architecture.md](architecture/backend_architecture.md) | Added tenant/plan/admin middleware, 4 new services, new API route groups |
| [architecture/api_endpoints.md](architecture/api_endpoints.md) | Added org_id scoping to all endpoints, new SaaS route groups, updated response format |
| [architecture/security_checklist.md](architecture/security_checklist.md) | Added tenant isolation, billing security, invite security, per-org rate limiting |
| [architecture/frontend_architecture.md](architecture/frontend_architecture.md) | Added tenant middleware, OrgContext, dynamic branding, plan gate hook, new pages |
| [architecture/deployment_plan.md](architecture/deployment_plan.md) | Added Stripe webhook, wildcard DNS, new env vars, SaaS deployment steps |
| [implementation/full_project_folder_structure.md](implementation/full_project_folder_structure.md) | Full directory tree updated with all SaaS folders and files |
| [ux_ui/feature_specv2/ux_ui_pages_features_blueprint.md](ux_ui/feature_specv2/ux_ui_pages_features_blueprint.md) | Added 7 SaaS pages (8–14) and 10 new SaaS feature entries |
| [ux_ui/features_specs/documentation_index.md](ux_ui/features_specs/documentation_index.md) | Full folder tree updated with SaaS page section |

---

## Complete Page Inventory (MVP → SaaS)

| # | Page | Route | Status |
|---|---|---|---|
| 1 | Landing | `/` | ✅ Existing |
| 2 | Action Submission | `/feature` | ✅ Existing |
| 3 | Dashboard | `/dashboard` | ✅ Existing (org-scoped) |
| 4 | Token Redemption | `/redeem` | ✅ Existing (org-scoped) |
| 5 | Donation Tracking | `/donations` | ✅ Existing (org-scoped) |
| 6 | Leaderboard | `/leaderboard` | ✅ Existing (org-scoped) |
| 7 | Analytics / Impact | `/analytics` | ✅ Existing (org-scoped, Starter+) |
| 8 | Sign In | `/signin` | ✅ Added in review |
| 9 | About Us | `/about` | ✅ Added in review |
| 10 | How It Works | `/how-it-works` | ✅ Added in review |
| 11 | Impact (public) | `/impact` | ✅ Added in review |
| 12 | **Pricing** | `/pricing` | ✅ **NEW (SaaS)** |
| 13 | **Org Onboarding** | `/org/setup` | ✅ **NEW (SaaS)** |
| 14 | **Org Admin** | `/org/admin` | ✅ **NEW (SaaS)** |
| 15 | **Super Admin** | `/admin` | ✅ **NEW (SaaS)** |
| 16 | **Billing** | `/org/admin/billing` | ✅ **NEW (SaaS)** |
| 17 | **Members** | `/org/admin/members` | ✅ **NEW (SaaS)** |
| 18 | **Org Settings** | `/org/admin/settings` | ✅ **NEW (SaaS)** |

---

## Architecture Changes Summary

### Database
- +6 new tables: `organizations`, `org_members`, `invites`, `rewards`, `billing_events`, `plan_limits`
- All 7 existing tables get `org_id UUID NOT NULL` column
- 14 migration files to run in order
- RLS policies scoped per org_id on all tables

### Backend
- 3 new middleware layers: `tenantMiddleware`, `planGate`, `adminGuard`
- 4 new services: `orgService`, `billingService`, `contractService`, `inviteService`
- 6 new API route groups covering ~50 additional endpoints
- Stripe webhook handler for real-time subscription management

### Frontend
- `middleware.ts` for subdomain → org slug resolution
- `OrgContext` + `OrgProvider` wrapping entire app
- `usePlan` hook for feature gating
- Dynamic CSS variable injection for per-org branding
- New component folders: `/org/`, `/admin/`, `/billing/`

### Smart Contracts
- `GreenTokenShared.sol` — multi-org shared contract (Free/Starter)
- `GreenTokenFactory.sol` — deploys per-org ERC-20 (Pro/Enterprise)
- `OrgGreenToken.sol` — per-org full ERC-20 token
- `ActionRegistry.sol` updated to be org-aware

### Deployment
- Wildcard subdomain: `*.greentoken.app`
- Stripe products, price IDs, webhook endpoint required
- 8 additional environment variables

---

## Revenue Model

| Plan | Price | Members | Key Features |
|---|---|---|---|
| Free | $0/month | 50 | Basic features, 14-day Pro trial |
| Starter | $49/month | 500 | Analytics, custom token name |
| Pro | $199/month | 5,000 | White-label, API access, per-org contract |
| Enterprise | Custom | Unlimited | SLA, dedicated contract, onboarding |

**Break-even estimate:** 10 Pro orgs = $1,990 MRR — covers hosting + tooling costs.

---

## What Has NOT Changed

All original MVP work is preserved and fully compatible:
- All 7 core page designs and starter code files
- Design system, color palette, typography
- Smart contract logic (GreenToken, ActionRegistry, RewardManager)
- Supabase schema (extended, not replaced)
- Deployment to Vercel
- All existing image assets

The SaaS transformation adds **on top of** the MVP — nothing was removed.

---

*No files deleted. All original content preserved. SaaS transformation complete: 2026-06-02.*

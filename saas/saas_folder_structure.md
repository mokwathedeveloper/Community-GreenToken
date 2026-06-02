# Community GreenToken — SaaS Project Folder Structure

Full directory layout for the SaaS version. Everything under `[existing]` was part of the MVP and continues unchanged; `[NEW]` marks additions for SaaS.

---

## 1. How to Read This Document

- `[existing]` — files/folders from the original MVP (unchanged)
- `[NEW]` — new files added for SaaS multi-tenancy, billing, or admin
- `[Updated]` — existing files extended with SaaS functionality

## 2. Full Directory Tree

```
community-greentoken/
│
├── README.md
├── package.json
├── tsconfig.json
├── next.config.js
├── middleware.ts              [NEW] Tenant resolution via subdomain
├── .env.local
│
├── /frontend/
│   │
│   ├── /components/
│   │   ├── /ui/               [existing] Shared UI primitives
│   │   ├── Navbar.jsx         [existing] Updated: shows org branding
│   │   ├── HeroCard.jsx       [existing]
│   │   ├── FeatureHighlights.jsx [existing]
│   │   ├── CTAButton.jsx      [existing]
│   │   ├── TokenBalanceCard.jsx [existing]
│   │   ├── LeaderboardCard.jsx  [existing]
│   │   ├── AnalyticsChart.jsx   [existing]
│   │   ├── DonationProgress.jsx [existing]
│   │   ├── RewardCard.jsx       [existing]
│   │   ├── RedeemButton.jsx     [existing]
│   │   ├── ConfirmationModal.jsx[existing]
│   │   ├── LeaderboardTable.jsx [existing]
│   │   ├── UserRankCard.jsx     [existing]
│   │   ├── MetricCard.jsx       [existing]
│   │   ├── TrendChart.jsx       [existing]
│   │   │
│   │   ├── /org/              [NEW] Org-scoped components
│   │   │   ├── OrgProvider.tsx    Context: org_id, token name, branding
│   │   │   ├── OrgBrand.tsx       Dynamic logo + color theming
│   │   │   ├── PlanUsageBar.tsx   Member count vs plan limit
│   │   │   ├── TrialBanner.tsx    Trial countdown + upgrade CTA
│   │   │   ├── UpgradeModal.tsx   Plan gate modal
│   │   │   └── MemberTable.tsx    Paginated member roster
│   │   │
│   │   ├── /admin/            [NEW] Admin-only components
│   │   │   ├── AdminStatCard.tsx
│   │   │   ├── OrgTable.tsx       Super admin org list
│   │   │   ├── ActionVerificationQueue.tsx
│   │   │   ├── RewardEditor.tsx
│   │   │   ├── BillingEventLog.tsx
│   │   │   └── OrgStatusBadge.tsx
│   │   │
│   │   └── /billing/          [NEW] Billing components
│   │       ├── PricingTable.tsx
│   │       ├── BillingCard.tsx
│   │       └── InvoiceList.tsx
│   │
│   ├── /pages/
│   │   ├── index.jsx          [existing] Landing/marketing page
│   │   ├── pricing.jsx        [NEW] Public pricing page
│   │   ├── about.jsx          [NEW] About Us
│   │   ├── how-it-works.jsx   [NEW] How It Works
│   │   ├── signin.jsx         [NEW] Sign In
│   │   ├── feature.jsx        [existing] Action submission
│   │   ├── dashboard.jsx      [existing] Updated: org-scoped
│   │   ├── redeem.jsx         [existing] Updated: org rewards
│   │   ├── leaderboard.jsx    [existing] Updated: org leaderboard
│   │   ├── donations.jsx      [existing] Updated: org donations
│   │   ├── analytics.jsx      [existing] Updated: org analytics (Starter+)
│   │   ├── impact.jsx         [NEW] Public impact stats
│   │   │
│   │   ├── /org/              [NEW] Org-scoped admin pages
│   │   │   ├── setup.jsx       5-step onboarding wizard
│   │   │   ├── admin.jsx       Org admin dashboard
│   │   │   ├── members.jsx     Member management
│   │   │   ├── settings.jsx    Org configuration
│   │   │   └── billing.jsx     Subscription management
│   │   │
│   │   └── /admin/            [NEW] Super admin pages
│   │       ├── index.jsx       Platform overview
│   │       ├── orgs.jsx        All organizations
│   │       └── billing.jsx     Stripe event log + MRR
│   │
│   ├── /styles/               [existing] Tailwind config + globals
│   ├── /hooks/                [existing] Custom React hooks
│   │   ├── useTokenBalance.js [existing]
│   │   ├── useOrg.ts          [NEW] Org context hook
│   │   ├── usePlan.ts         [NEW] Plan check + gate hook
│   │   └── useAdmin.ts        [NEW] Admin role check
│   │
│   └── /utils/
│       ├── [existing utils]
│       ├── tenant.ts          [NEW] Tenant resolution helpers
│       ├── planGate.ts        [NEW] Plan enforcement utils
│       └── stripe.ts          [NEW] Stripe client helpers
│
├── /backend/
│   │
│   ├── /api/
│   │   ├── actions.js         [existing] Updated: org_id scoped
│   │   ├── tokens.js          [existing] Updated: org_id scoped
│   │   ├── leaderboard.js     [existing] Updated: org_id scoped
│   │   ├── analytics.js       [existing] Updated: plan gate + org_id
│   │   ├── donations.js       [existing] Updated: org_id scoped
│   │   ├── organizations.js   [NEW] Org CRUD + config
│   │   ├── members.js         [NEW] Member management
│   │   ├── invites.js         [NEW] Invite create/accept
│   │   ├── rewards.js         [NEW] Reward catalog CRUD
│   │   ├── billing.js         [NEW] Stripe checkout + webhook
│   │   ├── contracts.js       [NEW] Contract deploy/query
│   │   └── admin.js           [NEW] Super admin routes
│   │
│   ├── /services/
│   │   ├── tokenService.js    [existing]
│   │   ├── orgService.ts      [NEW] Org creation + config
│   │   ├── billingService.ts  [NEW] Stripe abstractions
│   │   ├── contractService.ts [NEW] Factory + shared contract calls
│   │   └── inviteService.ts   [NEW] Invite generation + validation
│   │
│   └── /middleware/
│       ├── auth.js            [existing] JWT validation
│       ├── tenantMiddleware.ts [NEW] org_id extraction + injection
│       ├── planGate.ts        [NEW] Plan limit enforcement
│       └── adminGuard.ts      [NEW] Super admin route protection
│
├── /contracts/
│   ├── GreenToken.sol         [existing] Single-community version
│   ├── GreenTokenShared.sol   [NEW] Multi-org shared contract
│   ├── GreenTokenFactory.sol  [NEW] Deploys per-org ERC-20
│   ├── OrgGreenToken.sol      [NEW] Per-org ERC-20 token
│   ├── ActionRegistry.sol     [existing] Updated: org-aware
│   ├── RewardManager.sol      [existing] Updated: org-aware
│   └── /tests/
│       ├── [existing tests]
│       ├── GreenTokenFactory.test.js [NEW]
│       └── MultiTenancy.test.js      [NEW]
│
├── /database/
│   ├── schema.sql             [existing] Updated with org_id + new tables
│   ├── seed_data.sql          [existing] Updated with demo orgs
│   └── /migrations/
│       ├── [existing migrations]
│       ├── 001_create_organizations.sql    [NEW]
│       ├── 002_create_org_members.sql      [NEW]
│       ├── 003_create_invites.sql          [NEW]
│       ├── 004_add_org_id_all_tables.sql   [NEW]
│       ├── 005_create_rewards.sql          [NEW]
│       ├── 006_create_billing_events.sql   [NEW]
│       ├── 007_create_plan_limits.sql      [NEW]
│       └── 008_enable_rls_policies.sql     [NEW]
│
├── /assets/
│   ├── /image/
│   │   ├── /architecture/     [existing]
│   │   ├── /dashboard/        [existing]
│   │   ├── /donationsidebar/  [existing]
│   │   ├── /herosection/      [existing]
│   │   ├── /leaderboard-dashboard/ [existing]
│   │   ├── /roi-business/     [existing]
│   │   ├── /sidebar/          [existing]
│   │   └── /saas/             [NEW] Pricing, admin, onboarding screenshots
│
├── /tests/
│   ├── /frontend/             [existing]
│   ├── /backend/              [existing] + new org/billing tests
│   └── /contracts/            [existing] + factory tests
│
├── /documentation/
│   ├── /architecture/         [existing]
│   ├── /implementation/       [existing]
│   ├── /branding/             [existing]
│   └── /saas/                 [NEW] This folder
│
└── /saas/                     [NEW] SaaS architecture docs (this folder)
    ├── saas_overview.md
    ├── multi_tenancy_architecture.md
    ├── saas_database_schema.md
    ├── billing_and_subscriptions.md
    ├── onboarding_flow.md
    ├── admin_portal.md
    ├── smart_contract_strategy.md
    ├── saas_api_endpoints.md
    ├── saas_folder_structure.md  ← this file
    └── saas_deployment_plan.md
```

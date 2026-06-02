# Community GreenToken Full Project Folder Structure

This document provides a **professional directory layout** for the Community GreenToken web application, including frontend, backend, database, smart contracts, and assets. It also includes recommended naming conventions and organization of reusable components, API routes, and pages.

---

## 1. Root Directory Layout
```
community-greentoken/
│
├─ README.md
├─ package.json
├─ tsconfig.json
├─ next.config.js
├─ middleware.ts       # [SaaS] Tenant subdomain resolution
├─ .env.local
├─ /frontend/
├─ /backend/
├─ /contracts/
├─ /database/
├─ /assets/
├─ /tests/
├─ /saas/             # [SaaS] Architecture docs (see saas/ folder)
└─ /documentation/
```

## 2. Frontend Directory
```
/frontend/
│
├─ /components/
│   ├─ /ui/               # Shared UI primitives
│   ├─ Navbar.jsx          # Updated: shows org branding dynamically
│   ├─ HeroCard.jsx
│   ├─ FeatureHighlights.jsx
│   ├─ CTAButton.jsx
│   ├─ TokenBalanceCard.jsx
│   ├─ LeaderboardCard.jsx
│   ├─ AnalyticsChart.jsx
│   ├─ DonationProgress.jsx
│   ├─ RewardCard.jsx
│   ├─ RedeemButton.jsx
│   ├─ ConfirmationModal.jsx
│   ├─ LeaderboardTable.jsx
│   ├─ UserRankCard.jsx
│   ├─ MetricCard.jsx
│   ├─ TrendChart.jsx
│   │
│   ├─ /org/             # [SaaS] Org-scoped components
│   │   ├─ OrgProvider.tsx    # Context: org_id, tokenName, branding
│   │   ├─ OrgBrand.tsx       # Dynamic logo + color theming
│   │   ├─ PlanUsageBar.tsx   # Members used vs plan limit
│   │   ├─ TrialBanner.tsx    # Trial countdown + upgrade CTA
│   │   ├─ UpgradeModal.tsx   # Plan gate modal
│   │   └─ MemberTable.tsx    # Paginated member roster
│   │
│   ├─ /admin/           # [SaaS] Admin components
│   │   ├─ AdminStatCard.tsx
│   │   ├─ OrgTable.tsx
│   │   ├─ ActionVerificationQueue.tsx
│   │   ├─ RewardEditor.tsx
│   │   ├─ BillingEventLog.tsx
│   │   └─ OrgStatusBadge.tsx
│   │
│   └─ /billing/         # [SaaS] Billing components
│       ├─ PricingTable.tsx
│       ├─ BillingCard.tsx
│       └─ InvoiceList.tsx
│
├─ /pages/
│   ├─ index.jsx           # Landing page (marketing)
│   ├─ pricing.jsx         # [SaaS] Public pricing page
│   ├─ about.jsx           # About Us
│   ├─ how-it-works.jsx    # How It Works
│   ├─ signin.jsx          # Sign In / Auth
│   ├─ impact.jsx          # Public impact stats
│   ├─ feature.jsx         # Action submission
│   ├─ dashboard.jsx       # Dashboard (org-scoped)
│   ├─ redeem.jsx          # Token redemption (org-scoped)
│   ├─ leaderboard.jsx     # Leaderboard (org-scoped)
│   ├─ donations.jsx       # Donation tracking (org-scoped)
│   ├─ analytics.jsx       # Analytics (Starter+ org-scoped)
│   │
│   ├─ /org/              # [SaaS] Org admin pages
│   │   ├─ setup.jsx       # 5-step onboarding wizard
│   │   ├─ admin.jsx       # Org admin dashboard
│   │   ├─ members.jsx     # Member management
│   │   ├─ settings.jsx    # Org token + profile config
│   │   └─ billing.jsx     # Subscription management
│   │
│   └─ /admin/            # [SaaS] Super admin pages
│       ├─ index.jsx       # Platform overview
│       ├─ orgs.jsx        # All orgs table
│       └─ billing.jsx     # Stripe event log
│
├─ /styles/              # Tailwind config and global styles
├─ /hooks/
│   ├─ useTokenBalance.js
│   ├─ useOrg.ts          # [SaaS] Org context hook
│   ├─ usePlan.ts         # [SaaS] Plan gate hook
│   └─ useAdmin.ts        # [SaaS] Admin role check
│
└─ /utils/
    ├─ [existing utils]
    ├─ tenant.ts          # [SaaS] Tenant resolution helpers
    ├─ planGate.ts        # [SaaS] Plan limit enforcement
    └─ stripe.ts          # [SaaS] Stripe client helpers
```

## 3. Backend Directory
```
/backend/
│
├─ /api/              # Next.js API routes
│   ├─ actions.js      # Submit and verify actions
│   ├─ tokens.js       # Token balance and redemption
│   ├─ leaderboard.js  # Leaderboard API
│   ├─ analytics.js    # Analytics/AI metrics
│   └─ donations.js    # Donation tracking API
├─ /services/         # Business logic modules
├─ /middleware/       # Authentication, error handling, validation
└─ /utils/            # Backend utilities
```

## 4. Smart Contracts Directory
```
/contracts/
│
├─ GreenToken.sol     # Token smart contract
├─ ActionRegistry.sol # Action verification contract
├─ RewardManager.sol  # Token redemption and donation contract
└─ /tests/            # Contract unit and integration tests
```

## 5. Database Directory
```
/database/
│
├─ schema.sql         # SQL schema definition
├─ seed_data.sql      # Initial seed data
└─ migrations/        # Versioned database migrations
```

## 6. Assets Directory
```
/assets/
│
├─ /images/           # Logos, icons, illustrations
├─ /videos/           # Demo or promotional videos
└─ /fonts/            # Custom fonts
```

## 7. Tests Directory
```
/tests/
│
├─ frontend/          # React component and page tests
├─ backend/           # API route tests
└─ contracts/         # Smart contract tests
```

## 8. Documentation Directory
```
/documentation/
│
├─ architecture/      # Architecture MD files
├─ implementation/    # Implementation MD files
└─ branding/          # Branding and problem statement MD files
```

## 9. Naming Conventions
- **Folders:** lowercase, hyphen-separated (e.g., `/backend/`, `/frontend/`)
- **Files:** lowercase, hyphen-separated, descriptive (e.g., `token-balance.js`)
- **Components:** PascalCase (e.g., `ActionCard.jsx`)
- **Hooks:** camelCase (e.g., `useTokenBalance.js`)
- **API Routes:** camelCase for filenames (e.g., `actions.js`) or grouped by feature.

## 10. Reusable Component Organization
- Buttons, cards, modals, forms, tables placed in `/components/`
- Separate folders per feature if large (e.g., `/components/dashboard/`)
- Shared utilities in `/utils/` for frontend/backend consistency.

This structure ensures a **scalable, maintainable, and hackathon-ready project organization**, making onboarding and collaborative development efficient.


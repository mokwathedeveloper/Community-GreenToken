# Community GreenToken Frontend Architecture

This document outlines the **frontend architecture** for the Community GreenToken web application, detailing component hierarchy, reusable components, page layouts, routing, state management, and data fetching.

---

## 1. Component Hierarchy
- **App Layout**
  - Header (Navigation, Branding, User Info)
  - Main Content Area
    - Pages rendered based on routing
  - Footer (Links, Contact, Social Media)
- **Pages**
  - Landing Page
  - Main Feature Page (Action Submission)
  - Dashboard (Token Balances, Leaderboard, Analytics)
  - Token Redemption Page
  - Donation Tracking Page
- **Global Components**
  - Navbar
  - Sidebar
  - Modal / Dialogs
  - Notifications / Toasts
  - Loader / Skeletons
  - Buttons, Cards, Forms, Inputs

## 2. Reusable Components
- **ActionCard:** Displays individual action details, status, and token reward.
- **TokenBalance:** Shows current token count and progress.
- **LeaderboardEntry:** Represents a single leaderboard participant.
- **DonationCard:** Tracks user donations and projects supported.
- **AnalyticsChart:** Displays participation and impact metrics using charts.
- **Modal/Popup:** Reusable modal for confirmations, errors, or informational messages.
- **Button & Form Controls:** Standardized for consistent UI/UX across the app.

## 3. Page Layouts and Routing
- **Routing:** Next.js pages directory structure
  - `/` → Landing Page
  - `/feature` → Main Feature Page
  - `/dashboard` → Dashboard (tokens, leaderboard, analytics)
  - `/redeem` → Token Redemption Page
  - `/donations` → Donation Tracking Page
- **Layouts:**
  - Common layout wrapper for all pages
  - Responsive design with mobile-first approach
  - Sidebar navigation for logged-in users
  - Hero sections for landing pages with clear CTA

## 4. State Management and Data Fetching
- **State Management:**
  - React Context for global state (user session, token balances)
  - Local component state for forms, modals, and temporary UI states
  - Optional: Zustand or Redux for complex state handling if needed
- **Data Fetching:**
  - Next.js API routes for CRUD operations (Supabase, Smart Contracts, AI/Analytics)
  - SWR or React Query for data caching and real-time updates
  - Axios / Fetch for serverless API calls
  - Optimistic UI updates for token minting, action verification, and redemptions

This frontend architecture ensures a **modular, scalable, and reusable system** that supports the Community GreenToken MVP, mandatory features, and provides a polished user experience for hackathon demonstrations.

---

## SaaS Extension — Multi-Tenant Frontend

> **See also:** `saas/saas_folder_structure.md`

### New Routing Groups

```
/pricing              Public plan comparison page
/org/setup            5-step onboarding wizard (new org owners)
/org/admin            Org admin dashboard
/org/admin/members    Member management
/org/admin/settings   Org token + profile configuration
/org/admin/billing    Subscription management
/admin                Super admin platform overview (superadmin only)
/admin/orgs           All organizations table
```

### Tenant Middleware (`middleware.ts`)

Runs at the Edge before every page request. Extracts the org slug from the subdomain and passes it as a header (`x-org-slug`) to the page:

```typescript
// slug.greentoken.app → x-org-slug: slug
const slug = host.split('.')[0];
response.headers.set('x-org-slug', slug);
```

### OrgContext — Global Tenant State

Wraps the entire app. Provides org-specific values to all components:

```typescript
const { orgId, tokenName, tokenSymbol, primaryColor, plan } = useOrg();
```

### Dynamic Branding

Every org can customize their token name, symbol, and primary color. The `OrgProvider` applies the org's `primary_color` as a CSS variable:

```typescript
// Applied at root: --color-primary: #2ECC71 (default) or org's custom color
document.documentElement.style.setProperty('--color-primary', org.primaryColor);
```

### Plan Gate Hook

Components that are plan-restricted use the `usePlan` hook to render upgrade prompts:

```typescript
const { canAccess } = usePlan('analytics');
if (!canAccess) return <UpgradeModal feature="Analytics" requiredPlan="starter" />;
```

### Updated Component Hierarchy

```
App
├── OrgProvider       (tenant context)
├── AuthProvider      (Supabase session)
│   ├── Navbar        (now shows org logo + token name)
│   ├── TrialBanner   (shown during trial period)
│   └── Pages
│       ├── [existing pages — all org-scoped via OrgContext]
│       ├── /org/setup    (onboarding wizard)
│       ├── /org/admin/*  (org admin pages)
│       └── /admin/*      (super admin — role guarded)
```

### New Pages Added

| Page | Route | Access |
|---|---|---|
| Pricing | `/pricing` | Public |
| Org Onboarding | `/org/setup` | Auth |
| Org Admin | `/org/admin` | owner/admin |
| Member Management | `/org/admin/members` | owner/admin |
| Billing | `/org/admin/billing` | owner |
| Org Settings | `/org/admin/settings` | owner |
| Super Admin | `/admin` | superadmin |



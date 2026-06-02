# Community GreenToken UX/UI Implementation Blueprint — Pages & Features

This document provides **detailed implementation blueprints** for the Community GreenToken MVP pages and key features. Each blueprint includes starter components, props, states, layout, AI/analytics integration, and interaction guidelines, aligned with UX/UI design and accessibility rules.

---

## Pages Implementation

### 1. Landing Page
**Components:** `Navbar`, `HeroCard`, `FeatureHighlights`, `CTAButton`  
**States:** Default, hover, focus, active  
**Data:** Static text, optional analytics counters  
**Primary Route:** `/`  
**Key Interactions:** CTA navigation, scroll-triggered animations

### 2. Main Feature Page (Action Submission)
**Components:** `ActionForm`, `SubmitButton`, `ConfirmationModal`, `LoadingSkeleton`  
**States:** Loading, success, error  
**Props:** Action type, description, timestamp  
**Primary Route:** `/feature`  
**Key Interactions:** Action submission, modal feedback, validation messages

### 3. Dashboard
**Components:** `TokenBalanceCard`, `LeaderboardCard`, `AnalyticsChart`, `DonationProgress`  
**States:** Real-time updates, hover, focus  
**Data:** User tokens, leaderboard rankings, AI metrics  
**Primary Route:** `/dashboard`  
**Key Interactions:** Real-time metrics, drill-down, filters

### 4. Token Redemption Page
**Components:** `RewardCard`, `RedeemButton`, `ConfirmationModal`  
**States:** Loading, success, error  
**Props:** Reward ID, token cost, availability  
**Primary Route:** `/redeem`  
**Key Interactions:** Reward selection, confirmation feedback

### 5. Donation Tracking Page
**Components:** `DonationCard`, `ProjectProgressBar`  
**States:** Hover, click, update  
**Data:** User contributions, project totals  
**Primary Route:** `/donations`  
**Key Interactions:** Allocation updates, visual progress feedback

### 6. Leaderboard Page
**Components:** `LeaderboardTable`, `UserRankCard`  
**States:** Pagination, sorting, hover  
**Props:** User tokens, rank, achievements  
**Primary Route:** `/leaderboard`  
**Key Interactions:** Filtering, hover details, dynamic ranking

### 7. Analytics/Impact Metrics Page
**Components:** `MetricCard`, `TrendChart`, `PieChart`, `FilterDropdown`  
**States:** Loading, hover, drill-down  
**Data:** Community-wide tokens, donations, action counts  
**Primary Route:** `/analytics`  
**Key Interactions:** Interactive charts, tooltips, real-time updates

---

## Features Implementation

1. **Action Submission & Verification** → `ActionForm`, `ConfirmationModal`  
2. **Token Reward & Management** → `TokenBalanceCard`, `SmartContractService`  
3. **Token Redemption & Donations** → `RewardCard`, `RedeemButton`, `DonationCard`  
4. **Dashboard Overview** → `TokenBalanceCard`, `LeaderboardCard`, `AnalyticsChart`  
5. **Leaderboard** → `LeaderboardTable`, `UserRankCard`  
6. **Analytics/AI Metrics** → `MetricCard`, `TrendChart`, `PieChart`  
7. **Micro-Interactions & Animations** → Applied across all components  
8. **Prototyping & Iteration Notes** → Refer `prototyping_notes.md`  
9. **Accessibility Compliance** → Applied across all interactive components  
10. **UI/UX Design System Integration** → Applied globally across pages and components

---

## Implementation Notes for Developers
- Follow **props and state management patterns** as defined for each component.
- Ensure **UI matches mockups** in `features_to_mockup_map.md` and design tokens in `design_system.md`.
- Include **all interaction states**: default, hover, focus, active, disabled, loading, empty, error, success.
- AI/Analytics API calls should follow blueprint data flow and handle errors gracefully.
- Keep **business logic separate** from presentation components.
- Maintain **accessibility compliance**, responsive layouts, and keyboard navigation.
- Include **starter TypeScript types** for each component and feature.
- All mock data should reside in `frontend/data/`.

This blueprint serves as a **developer-ready reference** to implement Community GreenToken frontend and feature interactions exactly as per UX/UI design, avoiding hallucinations, inconsistencies, or deviations from the approved visual and functional specifications.

---

## SaaS Extension — Additional Pages

### 8. Pricing Page *(Public)*
**Components:** `PricingTable`, `FeatureRow`, `PricingCTAButton`, `FAQAccordion`  
**States:** Default, hover (card lift), annual/monthly toggle, loading (Stripe redirect)  
**Data:** Static plan data from `pricingData.js`  
**Primary Route:** `/pricing`  
**Key Interactions:** Monthly/annual toggle, plan selection → Stripe checkout  
**Full Spec:** `pricing_page_md.md`

### 9. Org Onboarding Wizard *(Auth required)*
**Components:** `OnboardingProgressBar`, `StepOrgProfile`, `StepTokenConfig`, `StepPlanSelection`, `StepContractDeploy`, `StepInviteMembers`  
**States:** Per-step validation, auto-save, loading (contract deploy), complete (confetti)  
**Data:** POSTs to `/api/orgs/create`, `/api/orgs/:id/config`, `/api/contracts/deploy`, `/api/invites/create`  
**Primary Route:** `/org/setup?step=1`  
**Key Interactions:** Slug availability check, live brand preview, contract deploy animation  
**Full Spec:** `org_onboarding_page_md.md`

### 10. Org Admin Dashboard *(owner/admin)*
**Components:** `AdminStatCard`, `PlanUsageBar`, `TrialBanner`, `ActionVerificationQueue`, `MemberTable`  
**States:** Loading (skeleton), empty (first-time), trial (banner), past due (warning)  
**Data:** Org metrics, pending actions, recent members  
**Primary Route:** `/org/admin`  
**Key Interactions:** Verify/reject actions, invite members, upgrade plan  
**Full Spec:** `org_admin_dashboard_md.md`

### 11. Super Admin Dashboard *(superadmin only)*
**Components:** `PlatformMetricCard`, `OrgTable`, `RevenueChart`, `PlanDistributionChart`, `BillingEventLog`  
**States:** Loading, drill-down (click org → detail), alert (past-due orgs highlighted)  
**Data:** Platform MRR, all orgs, Stripe event log  
**Primary Route:** `/admin`  
**Key Interactions:** Org drill-down, plan override, org suspension, event reprocess  
**Full Spec:** `super_admin_dashboard_md.md`

### 12. Billing Page *(owner only)*
**Components:** `CurrentPlanCard`, `PlanUsageSummary`, `TrialCountdown`, `InvoiceList`, `BillingAlertBanner`  
**States:** Active, trialing, past_due, canceled  
**Data:** Stripe subscription status, org usage  
**Primary Route:** `/org/admin/billing`  
**Key Interactions:** Upgrade/downgrade, manage payment (Stripe portal), download invoices  
**Full Spec:** `billing_page_md.md`

### 13. Member Management Page *(owner/admin)*
**Components:** `MemberTable`, `MemberRoleBadge`, `InviteModal`, `BulkActionBar`, `MemberLimitBar`  
**States:** Default, search active, row selected (bulk), limit reached  
**Data:** Org members with token balances and roles  
**Primary Route:** `/org/admin/members`  
**Key Interactions:** Search, change role, bulk actions, invite modal  
**Full Spec:** `org_members_page_md.md`

### 14. Org Settings Page *(owner only)*
**Components:** `OrgProfileForm`, `TokenConfigForm`, `ActionTypesEditor`, `ContractInfoCard`, `DangerZone`  
**States:** Default (read), editing, saving, error  
**Data:** Current org config from `/api/orgs/:id`  
**Primary Route:** `/org/admin/settings`  
**Key Interactions:** Live brand preview, action type drag-to-reorder, delete org (confirmation required)  
**Full Spec:** `org_settings_page_md.md`

---

## SaaS Features Implementation

11. **Multi-Tenant Org Management** → `OrgProvider`, `tenantMiddleware`, `OrgContext`  
12. **Subscription Billing** → `PricingTable`, `BillingCard`, Stripe Checkout/Portal  
13. **Org Onboarding Wizard** → `OnboardingProgressBar`, 5 step components  
14. **Action Verification Queue** → `ActionVerificationQueue`, approve/reject flow  
15. **Org Admin Panel** → `AdminStatCard`, `MemberTable`, `RewardEditor`  
16. **Super Admin Platform View** → `OrgTable`, `PlatformMetricCard`, `RevenueChart`  
17. **Plan Gating** → `usePlan`, `planGate.ts`, `UpgradeModal`  
18. **Dynamic Branding** → `OrgBrand`, CSS variable injection per org  
19. **Member Invites** → `InviteModal`, invite token API  
20. **Trial Management** → `TrialBanner`, trial expiry cron, Stripe trial period



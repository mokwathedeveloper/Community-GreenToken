# Community GreenToken — Team Task Assignment

**Project:** Community GreenToken — Stellar Blockchain SaaS Platform  
**Stack:** Next.js 14 + TypeScript + Tailwind CSS + Supabase + Stellar Soroban + Stripe  
**Repo:** https://github.com/mokwathedeveloper/Community-GreenToken

---

## Team Overview

| Person | GitHub | Role | Focus Area |
|---|---|---|---|
| **Mokwa Moffat Ohuru** | `mokwathedeveloper` | Project Lead + Blockchain | Project setup, Soroban contracts, Stellar SDK, Database |
| **Kamwanga Raheem** | `RockieRaheem` | Frontend — Public & Auth Pages | Landing, About, Pricing, Sign In/Up, Design System |
| **Collins Nyamwaya** | `TekguruCybersec` | Backend + API + Security | All API routes, Stripe billing, SaaS middleware, Auth |
| **Tumusando** | `Tumusando` | Frontend — App & Dashboard Pages | Dashboard, Leaderboard, Redemption, Admin pages, Wallet |

---

## Before Anyone Starts Coding

**All four read these first:**
1. `DEVELOPMENT_RULES.md` — mandatory rules for every line of code
2. `architecture/stellar_implementation_rules.md` — Stellar/Soroban strict rules
3. `ux_ui/features_specs/DESIGN_SPEC.md` — colors, fonts, components
4. Their assigned page specs in `ux_ui/feature_specv2/`

---

## TASK 1 — Mokwa Moffat Ohuru (`mokwathedeveloper`)
### Role: Project Lead + Stellar Blockchain Developer + Database

**Reads first:**
- `architecture/stellar_blockchain_architecture.md`
- `architecture/stellar_sdk_api_spec.md`
- `saas/saas_database_schema.md`
- `architecture/database_design_plan.md`

---

### Phase 1 — Project Initialization (Do this FIRST, everyone depends on it)

| # | Task | File/Folder to create | Notes |
|---|---|---|---|
| 1.1 | Initialize Next.js project | Run `npx create-next-app@latest` | TypeScript, Tailwind, ESLint, App Router |
| 1.2 | Install all dependencies | `package.json` | See dependency list below |
| 1.3 | Configure Tailwind | `tailwind.config.js` | Copy exact config from `DESIGN_SPEC.md` Section 8 |
| 1.4 | Set up global CSS | `globals.css` | Add Poppins font + Tailwind directives |
| 1.5 | Set up environment | `.env.local` | Copy from `.env.example`, fill in values |
| 1.6 | Initialize Supabase | Supabase Dashboard | Create project, get URL + keys |
| 1.7 | Connect Supabase | `lib/supabase/client.ts` + `lib/supabase/server.ts` | Client-side + server-side clients |

**Dependencies to install:**
```bash
npm install @stellar/stellar-sdk @stellar/freighter-api
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install stripe @stripe/stripe-js
npm install clsx tailwind-merge
npm install lucide-react @heroicons/react
npm install recharts
npm install zod
npm install date-fns
```

---

### Phase 2 — Supabase Database (Do before anyone builds backend)

| # | Task | File/Folder | Reference |
|---|---|---|---|
| 2.1 | Create organizations table | `database/migrations/001_create_organizations.sql` | `saas/saas_database_schema.md` |
| 2.2 | Create org_members table | `database/migrations/002_create_org_members.sql` | `saas/saas_database_schema.md` |
| 2.3 | Create invites table | `database/migrations/003_create_invites.sql` | `saas/saas_database_schema.md` |
| 2.4 | Create users table | `database/migrations/004_add_org_id_to_users.sql` | `saas/saas_database_schema.md` |
| 2.5 | Create actions table | `database/migrations/005_create_actions.sql` | `saas/saas_database_schema.md` |
| 2.6 | Create token_balances table | `database/migrations/006_create_token_balances.sql` | `saas/saas_database_schema.md` |
| 2.7 | Create redemption_logs table | `database/migrations/007_create_redemption_logs.sql` | `saas/saas_database_schema.md` |
| 2.8 | Create rewards table | `database/migrations/008_create_rewards.sql` | `saas/saas_database_schema.md` |
| 2.9 | Create leaderboard table | `database/migrations/009_create_leaderboard.sql` | `saas/saas_database_schema.md` |
| 2.10 | Create analytics_metrics table | `database/migrations/010_create_analytics.sql` | `saas/saas_database_schema.md` |
| 2.11 | Create donation_records table | `database/migrations/011_create_donations.sql` | `saas/saas_database_schema.md` |
| 2.12 | Create billing_events table | `database/migrations/012_create_billing_events.sql` | `saas/saas_database_schema.md` |
| 2.13 | Enable RLS + policies | `database/migrations/013_enable_rls_policies.sql` | `saas/multi_tenancy_architecture.md` |
| 2.14 | Create plan_limits table | `database/migrations/014_create_plan_limits.sql` | `saas/saas_database_schema.md` |
| 2.15 | JWT custom claims hook | Supabase Dashboard → Auth Hooks | `saas/multi_tenancy_architecture.md` Section 5 |
| 2.16 | Configure Supabase Auth | Supabase Dashboard → Auth | Add redirect URLs, email templates |

---

### Phase 3 — Soroban Smart Contracts

| # | Task | File/Folder | Reference |
|---|---|---|---|
| 3.1 | Set up Cargo workspace | `contracts/Cargo.toml` | `architecture/stellar_implementation_rules.md` R-SC-11 |
| 3.2 | Build GreenToken contract | `contracts/green_token/src/lib.rs` | `architecture/stellar_blockchain_architecture.md` Contract 1 |
| 3.3 | GreenToken storage types | `contracts/green_token/src/storage_types.rs` | All DataKey enums |
| 3.4 | GreenToken tests | `contracts/green_token/src/test.rs` | R-SC-10: test every function |
| 3.5 | Build ActionRegistry contract | `contracts/action_registry/src/lib.rs` | `architecture/stellar_blockchain_architecture.md` Contract 2 |
| 3.6 | ActionRegistry types | `contracts/action_registry/src/types.rs` | Action, ActionType, ActionStatus structs |
| 3.7 | ActionRegistry tests | `contracts/action_registry/src/test.rs` | Test submit + verify + reject |
| 3.8 | Build RewardManager contract | `contracts/reward_manager/src/lib.rs` | `architecture/stellar_blockchain_architecture.md` Contract 3 |
| 3.9 | RewardManager types | `contracts/reward_manager/src/types.rs` | Reward + Redemption structs |
| 3.10 | RewardManager tests | `contracts/reward_manager/src/test.rs` | Test add_reward + redeem |
| 3.11 | Deploy to Stellar Testnet | `scripts/deploy.sh` | stellar-cli deploy commands |
| 3.12 | Initialize contracts | `scripts/initialize.ts` | Set token rewards, add initial rewards |
| 3.13 | Save contract IDs | `.env.local` | Add `NEXT_PUBLIC_*_CONTRACT_ID=C...` |

---

### Phase 4 — Stellar JS SDK Layer

| # | Task | File/Folder | Reference |
|---|---|---|---|
| 4.1 | Network config | `lib/stellar/config.ts` | `stellar_sdk_api_spec.md` Section 1 |
| 4.2 | Soroban + Horizon clients | `lib/stellar/client.ts` | `stellar_sdk_api_spec.md` Section 2 |
| 4.3 | Transaction utilities | `lib/stellar/transactions.ts` | `stellar_sdk_api_spec.md` Section 4 |
| 4.4 | TypeScript types | `lib/stellar/types.ts` | `stellar_sdk_api_spec.md` Section 14 |
| 4.5 | GreenToken contract client | `lib/stellar/contracts/green-token.ts` | `stellar_sdk_api_spec.md` Section 5 |
| 4.6 | ActionRegistry client | `lib/stellar/contracts/action-registry.ts` | `stellar_sdk_api_spec.md` Section 6 |
| 4.7 | RewardManager client | `lib/stellar/contracts/reward-manager.ts` | `stellar_sdk_api_spec.md` Section 7 |

---

## TASK 2 — Kamwanga Raheem (`RockieRaheem`)
### Role: Frontend Developer — Design System + Public Pages + Auth Pages

**Reads first:**
- `ux_ui/features_specs/DESIGN_SPEC.md` (the whole thing)
- `DEVELOPMENT_RULES.md` Sections 1 and 2 (design tokens + component rules)
- Each page's MD spec file before building it

---

### Phase 1 — Design System Implementation (Do AFTER mokwathedeveloper finishes Phase 1.1–1.4)

| # | Task | File/Folder | Reference |
|---|---|---|---|
| 1.1 | Install Google Font | `app/layout.tsx` | Add Poppins import |
| 1.2 | Create cn() utility | `lib/utils.ts` | `clsx` + `tailwind-merge` helper |
| 1.3 | Build Button component | `components/ui/Button.tsx` | `DESIGN_SPEC.md` Section 6.10 |
| 1.4 | Build Badge component | `components/ui/Badge.tsx` | `DESIGN_SPEC.md` Section 6.11 |
| 1.5 | Build Input component | `components/ui/Input.tsx` | `DESIGN_SPEC.md` Section 6.12 |
| 1.6 | Build Modal component | `components/ui/Modal.tsx` | `DESIGN_SPEC.md` Section 6.13 |
| 1.7 | Build ProgressBar component | `components/ui/ProgressBar.tsx` | `DESIGN_SPEC.md` Section 6.9 |
| 1.8 | Build Navbar component | `components/Navbar.tsx` | `DESIGN_SPEC.md` Section 6.1 |
| 1.9 | Build Footer component | `components/Footer.tsx` | Link to `/privacy`, `/terms`, `/about` |
| 1.10 | Build SharedBanner component | `components/SharedBanner.tsx` | `banner/banner_guide.md` |
| 1.11 | Build PublicLayout wrapper | `components/layouts/PublicLayout.tsx` | Wraps Navbar + children + Footer |
| 1.12 | Build AuthLayout wrapper | `components/layouts/AuthLayout.tsx` | Split: hero left + form right |

---

### Phase 2 — Public Pages

| # | Page | Route | File | Spec | Mockup |
|---|---|---|---|---|---|
| 2.1 | Landing Page | `/` | `app/page.tsx` | `ux_ui/feature_specv2/landing_page_md.md` | `mockup/landing_page_mockup.png` |
| 2.2 | About Us | `/about` | `app/about/page.tsx` | `ux_ui/feature_specv2/about_us_page_md.md` | `mockup/about_us_page_mockup.png` |
| 2.3 | How It Works | `/how-it-works` | `app/how-it-works/page.tsx` | `ux_ui/feature_specv2/how_it_works_page_md.md` | `mockup/how_it_works_page_mockup.png` |
| 2.4 | Impact | `/impact` | `app/impact/page.tsx` | `ux_ui/feature_specv2/impact_page_md.md` | `mockup/impact_page_mockup.png` |
| 2.5 | Pricing | `/pricing` | `app/pricing/page.tsx` | `ux_ui/feature_specv2/pricing_page_md.md` | `mockup/pricing_page_mockup.png` |
| 2.6 | Privacy Policy | `/privacy` | `app/privacy/page.tsx` | `ux_ui/feature_specv2/privacy_policy_md.md` | — |
| 2.7 | Terms of Service | `/terms` | `app/terms/page.tsx` | `ux_ui/feature_specv2/terms_of_service_md.md` | — |

**Key components to build for public pages:**
- `HeroCard.tsx` — Landing hero with eco illustration background
- `FeatureCard.tsx` — `DESIGN_SPEC.md` Section 6.5
- `PricingCard.tsx` — `DESIGN_SPEC.md` Section 6.15
- `StepCard.tsx` — How It Works numbered step
- `FAQAccordion.tsx` — Expandable FAQ (use `<details>/<summary>`)
- `TeamCard.tsx` — About Us team member
- `ImpactStatCard.tsx` — Public impact count-up stat
- `ValuePillar.tsx` — About Us values grid

---

### Phase 3 — Auth Pages

| # | Page | Route | File | Spec | Mockup |
|---|---|---|---|---|---|
| 3.1 | Sign In | `/signin` | `app/signin/page.tsx` | `ux_ui/feature_specv2/signin_page_md.md` | `mockup/signin_page_mockup.png` |
| 3.2 | Sign Up | `/signup` | `app/signup/page.tsx` | `ux_ui/feature_specv2/signup_page_md.md` | `mockup/signup_page_mockup.png` |

**Key components:**
- `SignInForm.tsx` — email + password + Freighter connect
- `SignUpForm.tsx` — name + email + password strength meter + terms
- `WalletConnectButton.tsx` — Freighter wallet button (see Tumusando's `FreighterConnect.tsx`)

**Important:** The Freighter wallet component is built by Tumusando. Coordinate so you import it from `components/stellar/FreighterConnect.tsx`.

---

## TASK 3 — Collins Nyamwaya (`TekguruCybersec`)
### Role: Backend Developer — All API Routes + Stripe + Auth + Middleware

**Reads first:**
- `architecture/api_endpoints.md`
- `saas/saas_api_endpoints.md`
- `saas/billing_and_subscriptions.md`
- `architecture/stellar_sdk_api_spec.md` (Sections 8–13 for API routes)
- `DEVELOPMENT_RULES.md` Sections 6, 7, 8 (API, SaaS, DB rules)

---

### Phase 1 — Middleware (Do FIRST — all other backend depends on this)

| # | Task | File/Folder | Reference |
|---|---|---|---|
| 1.1 | Tenant middleware | `middleware.ts` (root) | `saas/multi_tenancy_architecture.md` Section 6 |
| 1.2 | Auth middleware helper | `lib/middleware/auth.ts` | Extract org_id + role from JWT |
| 1.3 | Plan gate helper | `lib/middleware/planGate.ts` | Check org plan against feature |
| 1.4 | Admin guard | `lib/middleware/adminGuard.ts` | Check `role === 'superadmin'` |
| 1.5 | Org context helper | `lib/middleware/orgContext.ts` | Attach org config to every request |
| 1.6 | Input validation | `lib/validation/schemas.ts` | Zod schemas for every API body |

---

### Phase 2 — Auth API Routes

| # | Route | File | Notes |
|---|---|---|---|
| 2.1 | `POST /api/auth/signup` | `app/api/auth/signup/route.ts` | Create user via Supabase Auth + create org |
| 2.2 | `POST /api/auth/signin` | Handled by Supabase Auth | Configure redirect URLs |
| 2.3 | `GET /api/auth/me` | `app/api/auth/me/route.ts` | Return user + org + role from JWT |

---

### Phase 3 — Organization & SaaS API Routes

| # | Route | File | Reference |
|---|---|---|---|
| 3.1 | `POST /api/orgs/create` | `app/api/orgs/create/route.ts` | `saas/onboarding_flow.md` |
| 3.2 | `GET /api/orgs/check-slug` | `app/api/orgs/check-slug/route.ts` | Validate slug uniqueness |
| 3.3 | `GET /api/orgs/[id]` | `app/api/orgs/[id]/route.ts` | Fetch org config |
| 3.4 | `PUT /api/orgs/[id]` | `app/api/orgs/[id]/route.ts` | Update org settings |
| 3.5 | `GET /api/orgs/[id]/members` | `app/api/orgs/[id]/members/route.ts` | Paginated member list |
| 3.6 | `PUT /api/orgs/[id]/members/[userId]/role` | `app/api/orgs/[id]/members/[userId]/role/route.ts` | Change member role |
| 3.7 | `DELETE /api/orgs/[id]/members/[userId]` | `app/api/orgs/[id]/members/[userId]/route.ts` | Remove member |
| 3.8 | `GET /api/orgs/[id]/usage` | `app/api/orgs/[id]/usage/route.ts` | Plan usage stats |
| 3.9 | `POST /api/invites/create` | `app/api/invites/create/route.ts` | Generate invite token |
| 3.10 | `GET /api/invites/[token]` | `app/api/invites/[token]/route.ts` | Validate invite |
| 3.11 | `POST /api/invites/[token]/accept` | `app/api/invites/[token]/accept/route.ts` | Accept invite → create membership |

---

### Phase 4 — Actions + Tokens API Routes

| # | Route | File | Reference |
|---|---|---|---|
| 4.1 | `POST /api/actions/submit` | `app/api/actions/submit/route.ts` | `stellar_sdk_api_spec.md` Section 9 |
| 4.2 | `POST /api/actions/verify` | `app/api/actions/verify/route.ts` | `stellar_sdk_api_spec.md` Section 10 |
| 4.3 | `GET /api/actions` | `app/api/actions/route.ts` | Filtered by org_id + status |
| 4.4 | `GET /api/actions/pending` | `app/api/actions/pending/route.ts` | Admin verification queue |
| 4.5 | `GET /api/tokens/balance` | `app/api/tokens/balance/route.ts` | `stellar_sdk_api_spec.md` Section 8 |
| 4.6 | `GET /api/tokens/history` | `app/api/tokens/history/route.ts` | Earn + spend history |

---

### Phase 5 — Rewards, Donations, Leaderboard, Analytics

| # | Route | File | Reference |
|---|---|---|---|
| 5.1 | `GET /api/rewards` | `app/api/rewards/route.ts` | Org reward catalog |
| 5.2 | `POST /api/rewards` | `app/api/rewards/route.ts` | Admin: add reward |
| 5.3 | `POST /api/redeem` | `app/api/redeem/route.ts` | `stellar_sdk_api_spec.md` Section 11 |
| 5.4 | `GET /api/leaderboard` | `app/api/leaderboard/route.ts` | Org leaderboard |
| 5.5 | `GET /api/analytics/overview` | `app/api/analytics/overview/route.ts` | Starter+ plan only |
| 5.6 | `GET /api/donations/projects` | `app/api/donations/projects/route.ts` | Donation project list |
| 5.7 | `POST /api/donations` | `app/api/donations/route.ts` | Allocate tokens |

---

### Phase 6 — Stellar API Routes

| # | Route | File | Reference |
|---|---|---|---|
| 6.1 | `POST /api/stellar/wallet/fund` | `app/api/stellar/wallet/fund/route.ts` | Friendbot testnet only |
| 6.2 | `GET /api/stellar/network/status` | `app/api/stellar/network/status/route.ts` | Health check |
| 6.3 | `POST /api/stellar/contracts/deploy` | `app/api/stellar/contracts/deploy/route.ts` | Deploy per-org contract |

---

### Phase 7 — Stripe Billing API Routes

| # | Route | File | Reference |
|---|---|---|---|
| 7.1 | `POST /api/billing/create-checkout` | `app/api/billing/create-checkout/route.ts` | `saas/billing_and_subscriptions.md` Section 3 |
| 7.2 | `POST /api/billing/webhook` | `app/api/billing/webhook/route.ts` | `saas/billing_and_subscriptions.md` Section 3 |
| 7.3 | `POST /api/billing/portal` | `app/api/billing/portal/route.ts` | Stripe customer portal |
| 7.4 | `GET /api/billing/status` | `app/api/billing/status/route.ts` | Current subscription status |

---

### Phase 8 — Super Admin API Routes

| # | Route | File | Reference |
|---|---|---|---|
| 8.1 | `GET /api/admin/orgs` | `app/api/admin/orgs/route.ts` | All organizations |
| 8.2 | `PUT /api/admin/orgs/[id]/plan` | `app/api/admin/orgs/[id]/plan/route.ts` | Override org plan |
| 8.3 | `GET /api/admin/metrics` | `app/api/admin/metrics/route.ts` | Platform MRR + stats |
| 8.4 | `GET /api/admin/billing-events` | `app/api/admin/billing-events/route.ts` | Stripe event log |

---

## TASK 4 — Tumusando (`Tumusando`)
### Role: Frontend Developer — App Pages + Dashboard + Wallet

**Reads first:**
- `ux_ui/feature_specv2/dashboard_page_md.md`
- `ux_ui/feature_specv2/org_admin_dashboard_md.md`
- `architecture/stellar_implementation_rules.md` Sections R-FRQ-01 to R-FRQ-06
- `DESIGN_SPEC.md` Sections 6.2, 6.3, 6.4, 6.7, 6.8 (Sidebar, TopBar, StatCard, Donation, Leaderboard)

---

### Phase 1 — App Layout Components (Do FIRST — all app pages depend on this)

| # | Task | File/Folder | Reference |
|---|---|---|---|
| 1.1 | App Layout wrapper | `components/layouts/AppLayout.tsx` | `DESIGN_SPEC.md` Section 7.1 |
| 1.2 | Sidebar component | `components/Sidebar.tsx` | `DESIGN_SPEC.md` Section 6.2 |
| 1.3 | Top App Bar | `components/AppTopBar.tsx` | `DESIGN_SPEC.md` Section 6.3 |
| 1.4 | OrgProvider context | `components/org/OrgProvider.tsx` | `architecture/frontend_architecture.md` SaaS section |
| 1.5 | useOrg hook | `hooks/useOrg.ts` | Returns org config from context |
| 1.6 | usePlan hook | `hooks/usePlan.ts` | Plan gate: `canAccess(feature)` |
| 1.7 | UpgradeModal | `components/org/UpgradeModal.tsx` | Shown when plan gate blocks |
| 1.8 | TrialBanner | `components/org/TrialBanner.tsx` | Shown during 14-day trial |

---

### Phase 2 — Stellar Wallet Components

| # | Task | File/Folder | Reference |
|---|---|---|---|
| 2.1 | Freighter connect button | `components/stellar/FreighterConnect.tsx` | `stellar_implementation_rules.md` R-FRQ-01 to R-FRQ-06 |
| 2.2 | Freighter helpers | `lib/stellar/freighter.ts` | `stellar_sdk_api_spec.md` Section 3 |
| 2.3 | Token balance display | `components/stellar/TokenBalance.tsx` | Shows GTK balance from on-chain |
| 2.4 | Transaction status modal | `components/stellar/TransactionStatus.tsx` | Pending → Confirming → Success/Failed |
| 2.5 | Network badge | `components/stellar/NetworkBadge.tsx` | TESTNET / MAINNET indicator |
| 2.6 | useWallet hook | `hooks/useStellarWallet.ts` | `stellar_sdk_api_spec.md` Section 15 |
| 2.7 | useGreenToken hook | `hooks/useGreenToken.ts` | `stellar_sdk_api_spec.md` Section 16 |
| 2.8 | useActions hook | `hooks/useActions.ts` | `stellar_sdk_api_spec.md` Section 17 |

---

### Phase 3 — Shared App Components

| # | Task | File/Folder | Reference |
|---|---|---|---|
| 3.1 | Stat Card | `components/StatCard.tsx` | `DESIGN_SPEC.md` Section 6.4 |
| 3.2 | Reward Card | `components/RewardCard.tsx` | `DESIGN_SPEC.md` Section 6.6 |
| 3.3 | Donation Card | `components/DonationCard.tsx` | `DESIGN_SPEC.md` Section 6.7 |
| 3.4 | Leaderboard Row | `components/LeaderboardRow.tsx` | `DESIGN_SPEC.md` Section 6.8 |
| 3.5 | Plan Usage Bar | `components/PlanUsageBar.tsx` | `DESIGN_SPEC.md` Section 6.16 |
| 3.6 | Toast notification | `components/Toast.tsx` | `DESIGN_SPEC.md` Section 6.17 |
| 3.7 | Data Table | `components/DataTable.tsx` | `DESIGN_SPEC.md` Section 6.14 |
| 3.8 | Sidebar Bottom Image | `components/SidebarBottomImage.tsx` | `assets/image/sidebar/sidebar_all_pages_guide.md` |

---

### Phase 4 — Core App Pages (Authenticated Users)

| # | Page | Route | File | Spec | Mockup |
|---|---|---|---|---|---|
| 4.1 | Dashboard | `/dashboard` | `app/dashboard/page.tsx` | `dashboard_page_md.md` | `mockup/dashboard_page_mockup.png` |
| 4.2 | Action Submission | `/feature` | `app/feature/page.tsx` | `action_submission_page_md.md` | `mockup/action_submission_page_mockup.png` |
| 4.3 | Token Redemption | `/redeem` | `app/redeem/page.tsx` | `token_redemption_page_md.md` | `mockup/token_redemption_page_mockup.png` |
| 4.4 | Donation Tracking | `/donations` | `app/donations/page.tsx` | `donation_tracking_page_md.md` | `mockup/donation_tracking_page_mockup.png` |
| 4.5 | Leaderboard | `/leaderboard` | `app/leaderboard/page.tsx` | `leaderboard_page_md.md` | `mockup/leaderboard_page_mockup.png` |
| 4.6 | Analytics | `/analytics` | `app/analytics/page.tsx` | `analytics_metrics_page_md.md` | `mockup/analytics_metrics_page_mockup.png` |

**Key components for app pages:**
- `ActionForm.tsx` — with evidence photo upload + SHA-256 hash
- `ActionVerificationStep.tsx` — shows verification status flow
- `ConfirmationModal.tsx` — success/error after submission
- `EvidenceUpload.tsx` — photo upload with hash display
- `AnalyticsChart.tsx` — recharts line + pie charts
- `ProjectProgressBar.tsx` — donation project progress

---

### Phase 5 — SaaS Admin Pages

| # | Page | Route | File | Spec | Mockup |
|---|---|---|---|---|---|
| 5.1 | Org Onboarding | `/org/setup` | `app/org/setup/page.tsx` | `org_onboarding_page_md.md` | (saas/org_onboarding_wizard.png) |
| 5.2 | Org Admin Home | `/org/admin` | `app/org/admin/page.tsx` | `org_admin_dashboard_md.md` | (saas/org_admin_dashboard.png) |
| 5.3 | Member Management | `/org/admin/members` | `app/org/admin/members/page.tsx` | `org_members_page_md.md` | (saas/member_management_page.png) |
| 5.4 | Org Settings | `/org/admin/settings` | `app/org/admin/settings/page.tsx` | `org_settings_page_md.md` | (saas/org_settings_page.png) |
| 5.5 | Billing | `/org/admin/billing` | `app/org/admin/billing/page.tsx` | `billing_page_md.md` | (saas/billing_page_mockup.png) |
| 5.6 | Super Admin | `/admin` | `app/admin/page.tsx` | `super_admin_dashboard_md.md` | (saas/super_admin_dashboard.png) |

**Key components for admin pages:**
- `ActionVerificationQueue.tsx` — pending actions table with approve/reject
- `MemberTable.tsx` — paginated member list with role editor
- `InviteModal.tsx` — generate link + email invite
- `OrgTable.tsx` — super admin all-orgs table
- `RevenueChart.tsx` — recharts MRR line chart (super admin)
- `OnboardingProgressBar.tsx` — 5-step wizard progress

---

## Coordination Rules

### Who Builds What — No Overlapping

| Component | Owner |
|---|---|
| All shared UI primitives (Button, Badge, Input, Modal) | `RockieRaheem` |
| Navbar (public) | `RockieRaheem` |
| Sidebar (app) | `Tumusando` |
| PublicLayout | `RockieRaheem` |
| AppLayout | `Tumusando` |
| FreighterConnect | `Tumusando` |
| All API routes (`/api/`) | `TekguruCybersec` |
| Supabase DB setup | `mokwathedeveloper` |
| Soroban contracts | `mokwathedeveloper` |
| Stellar SDK layer (`lib/stellar/`) | `mokwathedeveloper` |
| Freighter helpers (`lib/stellar/freighter.ts`) | `Tumusando` |

### What to Do When Your Task Depends on Someone Else

1. **Tumusando waiting for AppTopBar** → build page layout as a shell, add TopBar when `RockieRaheem` finishes it
2. **TekguruCybersec waiting for Supabase tables** → write API routes with TODO comments for DB calls
3. **RockieRaheem waiting for Freighter button** → use a plain `<button>Connect Wallet</button>` placeholder
4. Work in parallel — all pages can be built with hardcoded mock data first, then connected to real APIs

### Git Workflow

```bash
# Always pull before starting work
git pull origin master

# Create a branch for your feature
git checkout -b feature/landing-page       # RockieRaheem example
git checkout -b feature/api-actions        # TekguruCybersec example
git checkout -b feature/dashboard          # Tumusando example
git checkout -b feature/soroban-contracts  # mokwathedeveloper example

# Commit each file individually with a meaningful message
git add components/Navbar.tsx
git commit -m "feat(ui): add Navbar with logo and public navigation links"

# Push your branch
git push origin feature/landing-page

# Create PR when done
gh pr create --title "feat: add landing page with hero and features section" --base master
```

---

## Build Order (Critical Path)

```
Week 1 — Foundation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
mokwathedeveloper:  Project init → DB migrations → Soroban contracts
TekguruCybersec:    Middleware → Auth routes → Org routes
RockieRaheem:       Design system → Shared UI → Navbar/Footer
Tumusando:          AppLayout → Sidebar → Wallet components

Week 2 — Core Features
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
mokwathedeveloper:  Stellar SDK layer → Actions API → Tokens API
TekguruCybersec:    Actions/tokens/leaderboard/analytics APIs
RockieRaheem:       Landing page → About → Pricing → Sign In/Up
Tumusando:          Dashboard → Action submission → Leaderboard

Week 3 — SaaS + Polish
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
mokwathedeveloper:  Deploy contracts → Integration testing
TekguruCybersec:    Stripe billing → Admin APIs → QR verification
RockieRaheem:       How It Works → Impact → fix responsiveness
Tumusando:          Org admin → Redemption → Donations → Billing page

Week 4 — Integration + Deploy
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALL:                Connect frontend to backend APIs
ALL:                End-to-end testing (action → verify → tokens → redeem)
mokwathedeveloper:  Deploy to Vercel + update README with contract IDs
ALL:                Bug fixes + responsive design polish
```

---

## Quick Reference — Where Each Person's Specs Are

| Person | Read these specs | Build these files |
|---|---|---|
| `mokwathedeveloper` | `stellar_blockchain_architecture.md`, `saas_database_schema.md`, `stellar_sdk_api_spec.md` | `contracts/`, `lib/stellar/`, `database/migrations/` |
| `RockieRaheem` | `DESIGN_SPEC.md`, `landing_page_md.md`, `pricing_page_md.md`, `signin_page_md.md` | `components/ui/`, `app/(public)/` |
| `TekguruCybersec` | `api_endpoints.md`, `saas_api_endpoints.md`, `billing_and_subscriptions.md` | `app/api/`, `lib/middleware/` |
| `Tumusando` | `dashboard_page_md.md`, `org_admin_dashboard_md.md`, `stellar_implementation_rules.md` | `components/stellar/`, `hooks/`, `app/(app)/` |

# Community GreenToken — Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## v2.5.0 — 2026-06-09 · Mobile Navigation · Docs Accuracy Pass

### Added
- **Mobile hamburger drawer** (`components/Sidebar.tsx`, `components/AppTopBar.tsx`, `components/layouts/AppLayout.tsx`)
  - `Bars3Icon` hamburger button in the top bar, visible only on screens below the `lg` breakpoint
  - Slide-in panel (`w-72`) with blurred backdrop; closes on Escape key, backdrop click, or any nav-link click
  - Full ARIA: `role="dialog"`, `aria-modal="true"`, `aria-expanded` on trigger button, `aria-controls="mobile-nav-drawer"`
  - Desktop sidebar (`hidden lg:flex`) is unchanged

### Fixed
- **Vercel build failure** (`.vercelignore`): Unanchored pattern `contracts/` was stripping `lib/stellar/contracts/` from the build bundle, causing 8 "module not found" errors. Changed to `/contracts/` to scope the rule to the repo root (Rust contracts only).

### Documentation
- **README.md**, **WHITEPAPER.md**: Updated roadmap table — 4 features that shipped were still marked `🔄 Planned`:
  - QR code action verification → `✅ Complete`
  - M-Pesa withdrawal (KES/USD off-ramp) → `✅ Complete`
  - Multi-currency reward redemption (KES / USD) → `✅ Complete`
  - Carbon credit NFT certificates (Stellar-anchored) → `✅ Complete`
- **README.md**: Added QR Event Check-in and Carbon Credit Certificates to Platform Features tables; updated Withdrawal description to reflect multi-currency support
- **INVESTOR.md**: "Use of funds" updated — M-Pesa off-ramp and carbon credit certificates listed as shipped; remaining capital directed to mobile app, Mainnet deployment, audit

---

## v2.3.0 — 2026-06-08 · Blockchain Redeployment · #[contractevent] Migration · Upgrade Path

### Changed
- **All 3 Soroban contracts:** Migrated all `env.events().publish()` calls to type-safe `#[contractevent]` macro structs (Soroban SDK 26 — zero deprecation warnings)
  - GreenToken: `Mint`, `Burn`, `Transfer`, `Approve`, `BurnFrom` event structs
  - ActionRegistry: `ActionSubmitted`, `ActionVerified`, `ActionRejected` event structs
  - RewardManager: `RewardAdded`, `RewardRedeemed` event structs
- **Build target:** Upgraded from `wasm32-unknown-unknown` to `wasm32v1-none` (required by Soroban SDK 26 + Rust 1.84+)
- **All 3 contracts:** Added `upgrade(admin, new_wasm_hash: BytesN<32>)` function — enables in-place WASM upgrade without re-deploy, preserving all on-chain storage

### Added
- `app/api/stats/public/route.ts` — unauthenticated aggregate stats endpoint (5-min ISR cache) used by landing page StatsRow and Impact page
- `app/api/impact/me/route.ts` — personal CO₂ offset + action streak (consecutive UTC calendar days) for authenticated dashboard users
- `components/dashboard/ImpactSummary.tsx` — CO₂ offset widget with real-world equivalencies (car km, tree months) and streak flame indicator
- Dashboard `app/dashboard/page.tsx`: ImpactSummary widget added to left column

### Fixed
- **Landing StatsRow:** All 4 stats now from live `/api/stats/public` — was hardcoded fake numbers
- **Impact page:** All 5 stat blocks and the weekly chart now use real API data — was all hardcoded
- **`approve()` in GreenToken:** Added `extend_ttl()` to align Soroban temporary storage TTL with `expiration_ledger` — prevents allowance entries expiring before their deadline
- **GreenToken:** Added `burn_from(spender, from, amount)` — SEP-41 required function was missing

### Deployed (fresh testnet deployment — 2026-06-08)

| Contract | New Contract ID | WASM Hash |
|---|---|---|
| GreenToken (GTK) | `CCSSWPHW3KJHEI4FIBTMBNQ7DPMN73JVCQB7JHEWXFAVFRCYTTS5UJDK` | `49f1aef4...` |
| ActionRegistry | `CBIHBB35RI2LWHECDJ4G2ZZSGXYVOCCTVFPUNGOI7DOWQOWA3OPDVRDS` | `52fbc8da...` |
| RewardManager | `CAZJ4I42D4CATJMF2WOIUUYXJ5GOP5N3ICUFAS6SOQKU4DD6TSQAFSQE` | `9bfc2ed3...` |

All 3 initialized and smoke-tested on Stellar Testnet.

### Documentation
- `architecture/stellar_blockchain_architecture.md` — deployed IDs, WASM hashes, `upgrade()` in function tables, `#[contractevent]` event tables, `extend_ttl` note, exact Stellar CLI commands
- `architecture/blockchain_implementation_md.md` — full rewrite; removed all Solidity/Ethereum references; corrected to App Router `app/api/` paths
- `architecture/deployment_plan.md` — Stellar CLI section with `wasm32v1-none` build target and upgrade path
- `architecture/stellar_sdk_api_spec.md` — `burn_from`, `approve`, `buildBurnFromTx`, `upgrade`, `/api/stats/public`, `/api/impact/me` all documented
- `README.md`, `TECH_STACK.md`, `TOKENOMICS.md`, `DEMO_GUIDE.md`, `WHITEPAPER.md`, `SECURITY.md` — contract IDs and SDK version updated to reflect v2.3 deployment

---

## v2.2.0 — 2026-06-08 · Dashboard Real Data + Analytics Fixes

### Fixed
- **Dashboard:** Replaced fake chart data with real API data (action counts, member stats)
- **Audit page:** Admin user names, pagination, modal icon, donation data — 4 bugs fixed
- **Analytics period selector:** Fixed period filter, removed hardcoded fake chart data
- **Leaderboard page:** Real API data for podium and full table
- **Admin settings/billing pages:** Type and display corrections

---

## v2.0.0 — 2026-06-07 · Full Documentation Suite + Auth & Nav Fixes

### Added
- `WHITEPAPER.md` — 11-section technical whitepaper: problem statement, architecture, smart contracts, token design, SaaS model, security, Why Stellar, data model, roadmap
- `TOKENOMICS.md` — complete GTK token economics: distribution, mint-on-verify flow, deflationary mechanics, reward rates table, fee comparison, supply projections, governance roadmap
- `TECH_STACK.md` — full technical reference: all layers (blockchain → persistence → application → presentation), every package with version and rationale, build commands, language breakdown
- `SECURITY.md` — security policy: OWASP Top 10 coverage, rate limits table, API auth patterns, smart contract audit status, incident response playbook, bug bounty program
- `INVESTOR.md` — investor brief: one-sentence pitch, problem/solution, traction metrics, market opportunity, business model, competitive moat, team, use of funds
- `CONTRIBUTORS.md` — team background, project timeline, architecture contributions, contributing guide (setup, branch naming, commit convention, PR process)
- `RESPONSIBLE_DEVELOPMENT.md` — responsible dev policy: security by design, data privacy, honest metrics, environmental alignment, accessibility, anti-greenwashing design, AI policy
- `CHANGELOG.md` (this file) — full version history from initial commits to present

### Fixed
- **proxy.ts:** `/tokenomics`, `/leaderboard`, `/redeem` added to `PUBLIC_ROUTES` — unauthenticated visitors (investors, judges) were being redirected to signin
- **Navbar:** `Sign In` link now has `whitespace-nowrap` + `inline-flex` + `flex-shrink-0` — text was wrapping to two lines on 1440px viewport

### Changed
- **README.md:** Rebuilt from 262-line basic overview to 856-line professional document with Mermaid architecture diagram, economic flywheel ASCII art, competitive comparison table, full API reference, database schema, contract interface signatures, SaaS pricing, data flow sequence, roadmap, troubleshooting guide, and architecture docs index

---

## v1.9.0 — 2026-06-06 · Signup Material Icons Migration

### Changed
- **signup/page.tsx:** Removed entire `lucide-react` import; replaced 12 Lucide icons with Material Design equivalents
  - `User` → `MPerson`, `Mail` → `MEmail`, `Lock` → `MLock`, `Tag` → `MLocalOffer`
  - `Eye` → `MVisibility`, `EyeOff` → `MVisibilityOff`
  - `Wallet` → `MAccountBalance`, `Globe` → `MPublic`
  - `Users` → `MPeople`, `ShieldCheck` → `MShield`
  - `Github` → custom inline SVG (GitHub brand icon not in Material Design)
- Role selector: emoji `🏢` / `⚡` replaced with `MBusiness` / `MBolt` icons
- Info badge: emoji `ℹ️` replaced with `MInfo`
- Sign-in link at bottom: plain text link → pill button with `MLogin` icon, properly centered on one row

### Added
- `components/icons/index.tsx`: `MPerson`, `MVisibility`, `MVisibilityOff`, `MLocalOffer`

---

## v1.8.0 — 2026-06-05 · Tokenomics Page + Competitive Edge Section

### Added
- `app/tokenomics/page.tsx` — full GTK tokenomics investor one-pager (public route):
  - Hero section with dark green gradient and CTAs
  - 6 Token Fundamentals cards (Name, Symbol, Chain, Supply, Fee, Contract)
  - 5-step Token Flow vertical timeline with live links
  - Distribution progress bars (60% rewards, 20% treasury, 12% community, 8% team)
  - Fee comparison table (Stellar vs BSC vs ETH vs Polygon)
  - Why Stellar: 6 advantage cards
  - 10-feature competitor grid (vs EcoLedger, ZeLoop, TikCoin)
  - CTA: start org or join as member
- `components/landing/CompetitiveEdge.tsx` — landing page competitive section:
  - 6 advantage cards with coloured icon backgrounds
  - 4 competitor failure callouts with ✗ badges
  - CTAs: Tokenomics page + Org setup
- `app/page.tsx`: Added `<CompetitiveEdge />` between HowItWorks and CTA banner
- `components/Navbar.tsx`: Added Tokenomics link with MCoin icon

### Added (icons)
- `MCoin` — for Tokenomics nav link

---

## v1.7.0 — 2026-06-04 · Full Material Design Icon Migration

### Changed
- **All pages and components:** Replaced HeroIcons, Lucide icons, and all emoji with Material Design filled SVGs
- `components/Sidebar.tsx`: Replaced all HeroIcons; simplified dual outline/solid pattern to single icon with colour change for active state
- `components/layouts/OrgAdminLayout.tsx`: Replaced HeroIcons with `MDashboard, MPeople, MBolt, MBarChart, MCreditCard, MBusiness, MPersonAdd`
- `components/ui/UserMenu.tsx`: Replaced all HeroIcons with Material icons; role badges now use icons
- `components/stellar/FreighterConnect.tsx`: `🔗` → `MLink`, `🌿` → `MLeaf`
- `components/org/UpgradeModal.tsx`: `🔒` emoji → `MLock`
- `components/Navbar.tsx`: Added Google Material icons to all nav links and auth buttons
- `components/landing/HeroSection.tsx`: Trust badge icons updated to Material icons
- `app/signup/page.tsx`: `<Leaf>` from lucide-react → `<MLeaf>`

### Added (icons/index.tsx)
- `MSettings`, `MAccountCircle`, `MLogout`, `MExpandMore`, `MHome`, `MLogin`, `MOpenInNew`
- `MCheckCircle`, `MPeople` (previously missing from some usages)

---

## v1.6.0 — 2026-06-03 · Hero Section Background Image

### Changed
- `components/landing/HeroSection.tsx`: Rebuilt to use `hero_eco_illustration.png` as full-width background
  - `fill` + `object-contain` + `objectPosition: "right center"` — full image visible, pushed right
  - `bg-white` — white letterbox sides instead of dark background
  - White-to-transparent gradient overlay (0% → 72%) for text readability
  - Dark text (gray-900, gray-700) replaces previous white text

### Fixed
- Multiple previous attempts used `object-cover` which cropped the image top/bottom
- Reverted via `git checkout HEAD -- components/landing/HeroSection.tsx` before final implementation

---

## v1.5.0 — 2026-06-02 · Landing Page Icons + CTA Cleanup

### Changed
- `app/page.tsx`: Replaced all emojis in stats, features, and How It Works sections with Lucide vector icons
- Stats bar: dark background with coloured icon pills
- Feature cards: branded green icon backgrounds

### Fixed
- Removed decorative circular leaf emblem from CTA banner (was visually cluttered)
- Restored white gradient for text readability on About Us hero

---

## v1.4.0 — 2026-05-30 · Signin Rebuild

### Added
- `app/signin/page.tsx`: Full rebuild to match mockup
  - Full-screen hero background (`signin_hero.png`, `object-cover`)
  - White form card floating centered on the hero
  - Frosted-glass trust badges below card
  - Freighter wallet connect button
  - Google/Apple/Microsoft social login buttons (coming soon toast)

### Fixed
- Trust badges invisible on light hero — switched to frosted card with dark text

---

## v1.3.0 — 2026-05-28 · Admin Verification Flow

### Added
- `app/org/admin/actions/page.tsx`: Full admin action queue
  - Pending action list with evidence photo and description
  - Approve/Reject buttons triggering on-chain mint
  - Member blockchain proof display (SHA-256 hash + Stellar Expert link)
- `components/layouts/OrgAdminLayout.tsx`: Persistent Invite Member button in sidebar

---

## v1.2.0 — 2026-05-25 · Billing + Analytics + Withdrawal

### Added
- `app/org/admin/billing/page.tsx`: Rebuild with full Stripe integration
  - Current plan display, upgrade/downgrade CTA
  - Stripe Customer Portal link
  - Billing history table from `billing_events`
- `app/analytics/page.tsx`: Rebuild matching `analytics_metrics_page_mockup.png`
  - Recharts bar chart for action trends
  - Member growth, token circulation stats
  - Top actions leaderboard sidebar
- `app/withdraw/page.tsx`: GTK → KSH/USD withdrawal page
  - M-Pesa phone number input
  - Bank transfer option
  - Withdrawal history table
- `app/api/withdraw/route.ts`: POST/GET withdrawal requests
- `database/migrations/018_create_withdrawal_requests.sql`

---

## v1.1.0 — 2026-05-20 · RBAC + Auth Hardening

### Added
- `providers/UserProvider.tsx`: Single Supabase auth subscription for the whole app
  - Eliminated 13x duplicate `onAuthStateChange` listeners causing cascade
  - Centralized org + role resolution via `/api/auth/me`

### Fixed
- `useUser` hook was creating a new Supabase subscription per component — causing 401 cascade on `refreshSession()`
- `org_members` RLS policies blocking client-side queries — moved to server-side via `/api/auth/me`
- Trial plan incorrectly resolving to Starter — fixed plan mapping in billing middleware
- Empty `orgId` on multiple routes causing 500 errors — added guards across all org-scoped routes

---

## v1.0.0 — 2026-05-15 · Initial SaaS Launch

### Added

**Frontend (Next.js 16 App Router)**
- Landing page with hero, stats, features, How It Works, CTA
- Authentication: `/signin`, `/signup` with role selector (admin/superadmin)
- Invite flow: `/join/[token]`
- Dashboard: GTK balance, recent actions, leaderboard mini-widget
- Submit Action: `/submit-action` with photo upload and action type
- Leaderboard: `/leaderboard` — org + global rankings
- Redeem: `/redeem` — reward catalog with Freighter-signed redemptions
- Org Admin: setup wizard, members, action verification queue, analytics, billing, settings
- Super Admin: `/admin` — platform-wide org and user management
- Public: `/how-it-works`, `/impact`, `/about`, `/pricing`, `/terms`, `/privacy`

**Blockchain (Stellar Soroban)**
- `GreenToken.rs` — SEP-41 token deployed: `CCSSWPHW3KJHEI4FIBTMBNQ7DPMN73JVCQB7JHEWXFAVFRCYTTS5UJDK`
- `ActionRegistry.rs` — deployed: `CBIHBB35RI2LWHECDJ4G2ZZSGXYVOCCTVFPUNGOI7DOWQOWA3OPDVRDS`
- `RewardManager.rs` — deployed: `CAZJ4I42D4CATJMF2WOIUUYXJ5GOP5N3ICUFAS6SOQKU4DD6TSQAFSQE`
- Freighter wallet integration (`@stellar/freighter-api`)

**Backend (Next.js API Routes)**
- 38 API endpoints across 13 route groups
- Multi-tenant middleware chain: Edge auth → org resolver → plan gate → rate limiter
- Stripe billing: Checkout, Portal, Webhook handler

**Database (Supabase PostgreSQL)**
- 13 tables with RLS enabled
- 23 SQL migration files
- Row-Level Security policies for all user data

**Documentation**
- `README.md` — project overview, live contracts, quick start
- `DEVELOPMENT_RULES.md` — strict coding standards
- `architecture/` — 16 technical reference documents
- `.env.example` — all required environment variables documented

---

## Deployed Contracts — Live on Stellar Testnet

Redeployed at v2.3.0 (2026-06-08) — new contract IDs below. All 3 contracts now include `upgrade()`, `burn_from`, type-safe events, and zero deprecation warnings.

| Contract | Contract ID | Explorer |
|---|---|---|
| GreenToken (GTK) | `CCSSWPHW3KJHEI4FIBTMBNQ7DPMN73JVCQB7JHEWXFAVFRCYTTS5UJDK` | [View ↗](https://stellar.expert/explorer/testnet/contract/CCSSWPHW3KJHEI4FIBTMBNQ7DPMN73JVCQB7JHEWXFAVFRCYTTS5UJDK) |
| ActionRegistry | `CBIHBB35RI2LWHECDJ4G2ZZSGXYVOCCTVFPUNGOI7DOWQOWA3OPDVRDS` | [View ↗](https://stellar.expert/explorer/testnet/contract/CBIHBB35RI2LWHECDJ4G2ZZSGXYVOCCTVFPUNGOI7DOWQOWA3OPDVRDS) |
| RewardManager | `CAZJ4I42D4CATJMF2WOIUUYXJ5GOP5N3ICUFAS6SOQKU4DD6TSQAFSQE` | [View ↗](https://stellar.expert/explorer/testnet/contract/CAZJ4I42D4CATJMF2WOIUUYXJ5GOP5N3ICUFAS6SOQKU4DD6TSQAFSQE) |

**Network:** Stellar Testnet · Soroban RPC `https://soroban-testnet.stellar.org`

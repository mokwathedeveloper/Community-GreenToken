<div align="center">

# 🌿 Community GreenToken — Contributors

*Built for the WebBridge Hackathon 2026 — Stellar Track*

</div>

---

## 👥 Core Team

### Mokwa Moffat Ohuru — @mokwathedeveloper
**Role:** Lead Architect · Full-Stack Engineer · Product Designer

[![GitHub](https://img.shields.io/badge/GitHub-mokwathedeveloper-181717?logo=github)](https://github.com/mokwathedeveloper)

**Contributions (206 commits):**
- 🔗 Soroban smart contract architecture — GreenToken SEP-41, ActionRegistry, RewardManager
- 🌐 Next.js 16 frontend architecture — App Router, layouts, design system
- 🗄️ Supabase schema design — 13 tables, 23 migrations, RLS policies
- 💳 Stripe SaaS billing integration — Checkout, Portal, Webhooks
- 🎨 UI/UX design — all 19 pages matching mockup specs exactly
- 📊 Analytics and leaderboard systems
- 📄 Full documentation suite — README, WHITEPAPER, TOKENOMICS, SECURITY, INVESTOR

---

### Kamwanga Raheem — @RockieRaheem
**Role:** Frontend Engineer · UI/UX

[![GitHub](https://img.shields.io/badge/GitHub-RockieRaheem-181717?logo=github)](https://github.com/RockieRaheem)

**Contributions (117 commits):**
- 🎨 Landing page UI — hero section, features, how-it-works, competitive edge
- 🖼️ Material Design icon migration — replaced all emoji and Lucide icons with custom SVG factory
- 🔐 Auth page redesigns — signin full-screen hero, signup split-panel layout
- 🧭 Navbar and sidebar polish — responsive layout, alignment fixes
- 📑 Tokenomics page — investor-facing GTK economics one-pager
- 🏆 Impact, About, How It Works public pages

---

### Tumusando — @Tumusando
**Role:** Blockchain Engineer · Stellar Integration

[![GitHub](https://img.shields.io/badge/GitHub-Tumusando-181717?logo=github)](https://github.com/Tumusando)

**Contributions (76 commits):**
- ⭐ Stellar/Freighter components — FreighterConnect, TokenBalance, NetworkBadge, TransactionStatus
- 🪝 Custom hooks — `useStellarWallet`, Freighter connect/disconnect
- 📤 Action submission UI — wired to real `/api/actions/submit` with evidence hash validation
- 🔗 Stellar JS SDK integration patterns — on-chain balance sync, explorer links

---

### Kamwanga Raheem (Tekguru) — @TekguruCybersec
**Role:** Backend Engineer · Security

[![GitHub](https://img.shields.io/badge/GitHub-TekguruCybersec-181717?logo=github)](https://github.com/TekguruCybersec)

**Contributions (13 commits):**
- 🛡️ In-memory rate limiter — per-org presets for action_submit, action_verify, redeem, org_create
- 🔐 Security hardening — rate limiting middleware, atomic RPC, rollback on failure
- 🔑 API routes — analytics sub-routes (actions trends, token distribution, member growth)
- 📊 Super-admin routes — org detail, plan override, org suspend/reactivate
- 🎟️ Invite system — GET/DELETE `/invites/:id` — validate + admin revoke
- 💰 Rewards routes — PUT/DELETE soft-delete, update; GET redeem history
- 💸 Donations routes — project CRUD, user donation history
- 🔧 Billing webhook fixes — enterprise plan mapping, trial event handling, safe org_id extraction
- ⚡ Actions verify atomic RPC — increment_token_balance, rate limiting, rollback on failure
- 🗄️ Migration 019 — atomic increment_token_balance RPC, evidence_hash dedicated column

---

### Collins Nyamwaya — @CollinsDev
**Role:** Backend Engineer · SaaS Layer

[![GitHub](https://img.shields.io/badge/GitHub-nyamwayacollins-181717?logo=github)](https://github.com/nyamwayacollins)

**Contributions (61 commits):**
- 🏢 5-Step Org Onboarding Wizard — profile, token config, plan, contract, invite
- 💳 Stripe billing API — `POST /billing/create-checkout`, `POST /billing/portal`, `GET /billing/status`, `POST /billing/webhook`
- 🎟️ Invite system API — `POST /invites/create`, `POST /invites/[token]/accept` (with 410 on expired)
- 📋 Billing webhook — verified Stripe signatures, plan sync, billing audit log

---

## 📊 Contribution Stats

| Contributor | Commits | Primary Area |
|---|:---:|---|
| Mokwa Moffat Ohuru (@mokwathedeveloper) | 206 | Architecture, frontend, blockchain, design |
| RockieRaheem (@RockieRaheem) | 117 | Frontend, UI/UX, landing pages |
| Tumusando (@Tumusando) | 76 | Stellar integration, blockchain components |
| Collins Nyamwaya | 61 | SaaS billing API, org wizard, invites |
| TekguruCybersec | 13 | Security, rate limiting, backend routes |
| **Total** | **473+** | |

---

## 🏗️ Architecture Ownership

| Component | Owner |
|---|---|
| Soroban Smart Contracts (Rust) | Mokwa Moffat |
| Stellar JS SDK Integration | Tumusando + Mokwa |
| Next.js API Routes | Collins + TekguruCybersec + Mokwa |
| Frontend Pages | RockieRaheem + Mokwa |
| UI/UX Design | RockieRaheem |
| Stripe Billing | Collins |
| Security & Rate Limiting | TekguruCybersec |
| Database Schema | Mokwa + Collins |
| Documentation | Mokwa + RockieRaheem |

---

## 🚀 Contributing

Post-hackathon contributions are welcome!

### Setup

```bash
# Fork the repo, then:
git clone https://github.com/mokwathedeveloper/Community-GreenToken.git
cd Community-GreenToken
npm install
cp .env.example .env.local
# Fill in .env.local — see README.md for full variable reference
npm run dev
```

### Branch Naming

```
feature/description    → New features
fix/description        → Bug fixes
docs/description       → Documentation only
style/description      → UI / styling changes
refactor/description   → Code refactoring
```

### Commit Convention

```
feat(scope): description      → New feature
fix(scope): description       → Bug fix
docs(scope): description      → Documentation
style(scope): description     → Styling
refactor(scope): description  → Refactoring
chore(scope): description     → Maintenance
```

### Standards Before Opening a PR

- ✅ `npx tsc --noEmit` — zero TypeScript errors
- ✅ `npm run test` — all tests pass
- ✅ `npm run lint` — no ESLint warnings
- ✅ All new API routes have Zod validation
- ✅ All new components use Material Design icons from `components/icons/index.tsx`
- ✅ Supabase queries are org-scoped (`WHERE org_id = ?`)
- 📖 Read [`DEVELOPMENT_RULES.md`](DEVELOPMENT_RULES.md) before contributing

### Pull Request Template

Open PR against `main` with:
- **What:** What changed and where
- **Why:** The reason for the change
- **Test:** How you tested it
- Link any related issues

---

## 🙏 Acknowledgements

- **Stellar Development Foundation** — for Soroban, SEP-41, and outstanding documentation
- **Supabase** — for the most developer-friendly PostgreSQL platform available
- **Vercel** — for seamless Next.js deployment with Edge runtime
- **Stripe** — for battle-tested SaaS billing infrastructure
- **WebBridge Hackathon** — for the platform and community to build something meaningful for the planet

---

*Community GreenToken · June 2026 · WebBridge Hackathon Stellar Track*

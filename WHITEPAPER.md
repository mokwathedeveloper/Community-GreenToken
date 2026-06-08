<div align="center">

# 🌿 Community GreenToken — Technical Whitepaper v1.0

**GreenToken (GTK) Protocol: Tokenizing Real-World Eco-Actions on Stellar**

*Whitepaper v1.0 · June 2026 · WebBridge Hackathon — Stellar Track*

[![Stellar](https://img.shields.io/badge/Blockchain-Stellar%20Soroban-brightgreen?logo=stellar)](https://stellar.org)
[![SEP-41](https://img.shields.io/badge/Standard-SEP--41-blue)](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0041.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📋 Abstract

Community GreenToken introduces a production-ready, multi-tenant SaaS protocol that converts verified real-world eco-actions into traceable, on-chain digital rewards. Built natively on the Stellar blockchain using Soroban smart contracts, the platform creates a trustless link between physical environmental behaviour and blockchain value — without requiring users to understand blockchain at all.

Unlike speculative "green tokens" that track pledges or price, GTK is minted only after a real action is verified by a trusted org administrator. Every token has verifiable provenance: a specific action, a specific person, a specific timestamp, and an immutable SHA-256 evidence hash. Every redemption burns the token on-chain. The total supply reflects exactly the amount of verified positive environmental contribution the community has produced.

---

## ❌ 1. Problem Statement

### 1.1 The Greenwashing Problem

Organisations and platforms claim to reward sustainable behaviour, but verification is absent. Carbon offset projects sell credits tied to forests that were never at risk. Recycling reward apps accept self-reported data. Pledge-based "green tokens" track promises, not actions.

The result: token value is disconnected from real-world impact. When tokens can be earned without verifiable effort, they approach zero utility and trust.

### 1.2 The Blockchain Friction Problem

Existing blockchain sustainability projects fail at adoption because they assume users understand wallets, gas fees, and private keys. EcoLedger planned Soroban contracts but shipped a mockup. ZeLoop built on BSC — transaction fees consumed the micro-rewards they promised users. The friction of blockchain UX is incompatible with the everyday nature of eco-actions.

### 1.3 The Missing Infrastructure Layer

No existing platform provides organisations with end-to-end infrastructure: sign up, configure a token program, invite members, verify actions, manage rewards, and track impact — without building blockchain infrastructure from scratch. This gap means well-intentioned organisations cannot operationalise sustainability rewards.

---

## ✅ 2. Solution Overview

Community GreenToken solves all three problems simultaneously:

| Problem | GreenToken Solution |
|---|---|
| 🌿 Greenwashing (unverified actions) | Admin verification required before any token minted — SHA-256 evidence hash stored on-chain |
| 💸 BSC/ETH gas fees making micro-rewards uneconomic | Built on Stellar: **$0.000001 per transaction** |
| 🏢 No org-level infrastructure | Full SaaS: setup wizard → member invites → action queue → rewards catalog → analytics |
| 🔑 Blockchain UX complexity for users | Freighter wallet optional — GTK balance visible in-app without requiring wallet connection |

---

## 🏗️ 3. System Architecture

### 3.1 Four-Layer Stack

```
┌─────────────────────────────────────────────────────────────┐
│  🖥️  LAYER 4 — Presentation                                 │
│  Next.js 16 App Router + React 19 + Tailwind CSS 4          │
│  19 pages · Material Design icons · Poppins font            │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP REST
┌─────────────────────────────▼───────────────────────────────┐
│  ⚡  LAYER 3 — Application Logic                             │
│  38 API Routes · Auth middleware · Plan gate · Zod schemas  │
└──────────────┬──────────────────────────────┬───────────────┘
               │ Stellar JS SDK               │ Supabase Client
┌──────────────▼──────────┐   ┌───────────────▼───────────────┐
│  🔗  LAYER 2 — Chain    │   │  🗄️  LAYER 1 — Data          │
│  Stellar Testnet        │   │  Supabase PostgreSQL          │
│  3 Soroban Contracts    │   │  13 tables · RLS enabled      │
│  Freighter wallet       │   │  Supabase Auth (JWT)          │
│  SEP-41 token standard  │   │  Stripe billing events        │
└─────────────────────────┘   └───────────────────────────────┘
```

### 3.2 🔒 Multi-Tenant Data Isolation

Every piece of data in the system is scoped to an `org_id`. Row-Level Security policies in Supabase enforce this at the database level — even if application code contained a bug, a member of Org A cannot read data from Org B.

```sql
-- RLS policy example — org_members table
CREATE POLICY "members_see_own_org" ON org_members
  FOR SELECT USING (org_id = current_setting('app.org_id')::uuid);
```

**Middleware chain** (applied in order):
1. **Auth middleware** — validates Supabase JWT
2. **Org resolver** — maps user to org via `org_members`
3. **Plan gate** — checks subscription tier for rate limits
4. **Route handler** — executes with verified org context

### 3.3 ⛓️ Blockchain Integration

The platform never requires users to interact with blockchain directly. Blockchain writes happen server-side using the platform admin keypair. Users may optionally connect Freighter for user-owned transaction signatures.

```
User Submits Action
       ↓
API validates + stores in Supabase (status: PENDING)
       ↓
Admin reviews in /org/admin/actions
       ↓
Admin clicks "Verify"
       ↓
Server: ActionRegistry.verify_action(action_id, user_address)
              ↓ cross-contract call (atomic)
        GreenToken.mint(user_address, reward_amount)
       ↓
Supabase token_balances updated
       ↓
User sees new GTK balance on /dashboard
```

---

## 📜 4. Smart Contracts

### 4.1 🌿 GreenToken.rs — SEP-41 Fungible Token

**Contract ID:** `CCSSWPHW3KJHEI4FIBTMBNQ7DPMN73JVCQB7JHEWXFAVFRCYTTS5UJDK`
[View on Stellar Expert ↗](https://stellar.expert/explorer/testnet/contract/CCSSWPHW3KJHEI4FIBTMBNQ7DPMN73JVCQB7JHEWXFAVFRCYTTS5UJDK)

```rust
pub fn mint(env: Env, to: Address, amount: i128);        // admin only
pub fn burn(env: Env, from: Address, amount: i128);      // RewardManager only
pub fn transfer(env: Env, from: Address, to: Address, amount: i128);
pub fn balance(env: Env, id: Address) -> i128;
pub fn approve(env: Env, from: Address, spender: Address, amount: i128, expiration_ledger: u32);
pub fn decimals(env: Env) -> u32;   // returns 7 (Stellar standard)
pub fn name(env: Env) -> String;    // "GreenToken"
pub fn symbol(env: Env) -> String;  // "GTK"
```

Key design decisions:
- 🔐 **Admin-only minting** — GTK cannot be created without a verified action
- 🔢 **7 decimal places** — Stellar standard, enabling fractional micro-rewards
- ⚡ **Cross-contract callable** — ActionRegistry invokes `mint()` atomically with verification

### 4.2 📋 ActionRegistry.rs — Eco-Action Verification

**Contract ID:** `CBIHBB35RI2LWHECDJ4G2ZZSGXYVOCCTVFPUNGOI7DOWQOWA3OPDVRDS`
[View on Stellar Expert ↗](https://stellar.expert/explorer/testnet/contract/CBIHBB35RI2LWHECDJ4G2ZZSGXYVOCCTVFPUNGOI7DOWQOWA3OPDVRDS)

```rust
pub fn register_action(
    env: Env,
    submitter: Address,
    evidence_hash: BytesN<32>,  // SHA-256 of photo evidence
    action_type: u32,
) -> u64;                       // returns action_id

pub fn verify_action(
    env: Env,
    action_id: u64,
    verifier: Address,          // must be admin
) -> bool;                      // calls GreenToken.mint() on success
```

🔑 **Evidence hashing:** SHA-256 hash of the photo stored on-chain. Same hash cannot be submitted twice — replay attacks rejected at contract level.

### 4.3 🎁 RewardManager.rs — Token Redemption

**Contract ID:** `CAZJ4I42D4CATJMF2WOIUUYXJ5GOP5N3ICUFAS6SOQKU4DD6TSQAFSQE`
[View on Stellar Expert ↗](https://stellar.expert/explorer/testnet/contract/CAZJ4I42D4CATJMF2WOIUUYXJ5GOP5N3ICUFAS6SOQKU4DD6TSQAFSQE)

```rust
pub fn create_reward(env: Env, org_id: u64, name: String, gtk_cost: i128, stock: u32) -> u64;
pub fn redeem(env: Env, user: Address, reward_id: u64) -> bool;  // burns GTK atomically
pub fn get_redemption_history(env: Env, user: Address) -> Vec<RedemptionRecord>;
```

🔥 **Deflationary design:** every redemption destroys GTK. Supply decreases with community activity.
🔑 **User sovereignty:** `redeem()` requires Freighter signature — platform never controls user wallets.

---

## 💰 5. Token Design

### GTK Properties

| Property | Value |
|---|---|
| 🏷️ Name | GreenToken |
| 🔤 Symbol | GTK |
| ⭐ Standard | SEP-41 (Stellar) |
| 🔢 Decimals | 7 |
| 📊 Total Supply Cap | 100,000,000 GTK |
| 🔑 Minting Authority | Platform admin (verified actions only) |
| 🔥 Burn Mechanism | Every redemption via RewardManager |
| ⚡ Chain | Stellar (Soroban) |
| 💸 Tx Cost | $0.000001 per transaction |
| ⏱️ Finality | ~5 seconds |

### 🔄 Mint-on-Verify Mechanism

```
🌿 User submits eco-action + photo evidence
              ↓
   🔑 evidence_hash = SHA-256(photo)
              ↓
   📋 ActionRegistry.register_action(submitter, evidence_hash, action_type)
              ↓
   ⏳ Action stored with status: PENDING
              ↓
   👤 Org admin reviews evidence in /org/admin/actions
              ↓
   ✅ Admin approves → ActionRegistry.verify_action(action_id)
              ↓ [cross-contract call — atomic]
   💰 GreenToken.mint(submitter_address, reward_amount)
              ↓
   🎉 GTK appears in user wallet on Stellar
```

---

## 🏢 6. SaaS Architecture

### Multi-Tenant Design (B2B2C)

| Layer | Role |
|---|---|
| 🏢 **Platform** (us) | Infrastructure, contracts, billing |
| 🏫 **Organizations** | Schools, NGOs, corporations — launch GTK programs |
| 👥 **Members** | Community members who earn and redeem GTK |

### 💳 Subscription Tiers

| Tier | Monthly | Members | Actions/mo |
|---|---|---|---|
| **Starter** | Free | 25 | 100 |
| **Pro** | $49 | 500 | 5,000 |
| **Enterprise** | Custom | Unlimited | Unlimited |

---

## 🔒 7. Security Architecture

### Key Controls

| Layer | Control | Implementation |
|---|---|---|
| 🌐 API | JWT validation | Supabase Auth on every request |
| 🗄️ Database | Row-Level Security | RLS on all 13 tables |
| ⛓️ Blockchain | Admin keypair isolation | Secret key server-side only — never browser |
| 📥 Input | Schema validation | Zod on all API inputs |
| 🔁 Replay protection | Evidence hash uniqueness | SHA-256 hashes indexed uniquely on-chain |
| ⏱️ Rate limiting | Per-endpoint limits | `lib/middleware/rateLimiter.ts` |
| 💳 Stripe | Webhook verification | Signature validation on every event |

### ⭐ OWASP Top 10 Coverage

| Risk | ✅ Mitigation |
|---|---|
| A01 Broken Access Control | Supabase RLS on all 13 tables; org_id enforced on every query |
| A02 Cryptographic Failures | TLS everywhere; no plaintext secrets; SHA-256 evidence hashing |
| A03 Injection | Supabase parameterized queries; Zod validation; no raw SQL |
| A04 Insecure Design | Atomic contract calls; admin-only minting; user-signed redemptions |
| A05 Security Misconfiguration | `.env.example` documents all vars; no default credentials |
| A06 Vulnerable Components | `npm audit` on every deployment |
| A07 Auth Failures | Supabase JWT; RLS per user; session validation in middleware |
| A08 Data Integrity Failures | Evidence SHA-256 on-chain; Stripe webhook signatures |
| A09 Logging Failures | Admin secret key never logged |
| A10 SSRF | No user-controlled URL fetching |

---

## ⭐ 8. Why Stellar

### Technical Fit

| Stellar Property | Why It Matters for GreenToken |
|---|---|
| 💸 $0.000001 per tx | Micro-rewards viable — 10,000 actions costs **$0.01** |
| ⏱️ 5-second finality | Token appears in wallet immediately after verification |
| 🔗 SEP-41 standard | GTK works in any Stellar wallet out of the box |
| 📜 Soroban (Rust contracts) | Trustless verification; cross-contract atomicity |
| 🌱 Carbon-neutral (SCP) | Aligned with our eco-mission |
| 💳 Freighter wallet | Familiar browser extension UX |

### 💸 Competitive Fee Analysis

| Chain | Avg Tx Fee | 10,000 Actions | Verdict |
|---|---|---|---|
| **⭐ Stellar** | $0.000001 | **$0.01** | ✅ Viable at any scale |
| Polygon | $0.01–$0.05 | $100–$500 | ⚠️ Marginal for micro-rewards |
| BNB Chain | $0.10–$2.00 | $1,000–$20,000 | ❌ Destroys micro-reward economics |
| Ethereum | $2.00–$50.00 | $20,000–$500,000 | ❌ Completely non-viable |

> ZeLoop chose BSC and collapsed when fees made their micro-reward model uneconomical. We chose Stellar from day one — **the fee structure is the product.**

---

## 🗄️ 9. Data Model

```
🏢 organizations
    │
    ├── 👥 org_members (role: owner | admin | member)
    │       └── 👤 users
    ├── 🎟️ invites
    ├── 📋 actions ──── 💰 token_balances
    │               └── 📜 redemption_logs
    ├── 🎁 rewards
    ├── 🏆 leaderboard (cached)
    ├── 📊 analytics (aggregated)
    ├── 🌍 donations
    ├── 💳 billing_events
    └── 💸 withdrawal_requests
```

---

## 🗺️ 10. Roadmap

| Phase | Feature | Status |
|---|---|:---:|
| **Phase 1 — Core** | 3 Soroban contracts on Stellar Testnet | ✅ Done |
| **Phase 1 — Core** | Multi-tenant org management | ✅ Done |
| **Phase 1 — Core** | Action verification → mint flow | ✅ Done |
| **Phase 2 — SaaS** | Stripe billing + plan enforcement | ✅ Done |
| **Phase 2 — SaaS** | Analytics dashboards | ✅ Done |
| **Phase 2 — SaaS** | Leaderboard + gamification | ✅ Done |
| **Phase 3 — Scale** | QR code action verification | 🔄 Planned |
| **Phase 3 — Scale** | IoT sensor integration | 🔄 Planned |
| **Phase 3 — Scale** | M-Pesa withdrawal (KES/USD off-ramp) | 🔄 Planned |
| **Phase 4 — Mainnet** | External smart contract audit | 🔄 Planned |
| **Phase 4 — Mainnet** | Stellar Mainnet deployment | 🔄 Planned |
| **Phase 4 — Mainnet** | DAO governance | 🔄 Planned |

---

## 🏁 11. Conclusion

Community GreenToken is the only platform that simultaneously solves the three core problems in blockchain sustainability: verification integrity, micro-reward economics, and organisational infrastructure. By building natively on Stellar — the only chain where $0.000001 fees make micro-rewards genuinely viable — we create a token where every unit represents a real, verified, positive environmental action.

The SaaS layer means any organisation in the world can launch a verified sustainability reward program today. The blockchain layer means every action is permanently, immutably recorded. The combination is something no competitor has shipped.

---

<div align="center">

*Community GreenToken · Technical Whitepaper v1.0 · June 2026*

**#StellarBlockchain #GreenToken #WebBridgeHackathon #Soroban**

[Live Demo](https://community-greentoken-fb803chx2-moracios-projects.vercel.app) · [GitHub](https://github.com/mokwathedeveloper/Community-GreenToken) · [Tokenomics](/tokenomics)

</div>

# 🌿 Community GreenToken

> **Rewarding Sustainable Actions. Building Better Communities.**  
> A blockchain-powered platform on **Stellar** that tokenizes real-world eco-actions into verifiable, tradeable rewards.

[![Stellar](https://img.shields.io/badge/Stellar-Soroban-brightgreen?logo=stellar)](https://stellar.org)
[![SEP-41](https://img.shields.io/badge/Standard-SEP--41-blue)](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0041.md)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)](https://typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Styling-Tailwind%20CSS-38BDF8?logo=tailwindcss)](https://tailwindcss.com)

---

## What Is Community GreenToken?

Community GreenToken (GTK) is a **SaaS platform** that enables organizations — schools, municipalities, NGOs, and corporations — to launch their own blockchain-verified sustainability reward programs.

Users earn **GreenTokens (GTK)** by completing verifiable eco-actions like recycling, planting trees, carpooling, and reducing energy use. Tokens are minted on the **Stellar blockchain** using **Soroban smart contracts**, creating a transparent, immutable record of every positive environmental contribution.

### Why Stellar?

| Reason | Detail |
|---|---|
| **5-second finality** | Instant token rewards after action verification |
| **$0.00001 per tx** | Micro-rewards viable for every small eco-action |
| **SEP-41 standard** | Universal token interface — any Stellar wallet works |
| **Soroban** | Trustless action verification without centralized control |
| **Carbon-neutral** | Stellar's Proof-of-Agreement aligns with our eco-mission |

---

## Live Demo

🌐 **Frontend:** `http://localhost:3000` (run `npm run dev`)  
🔗 **Stellar Testnet Contracts — LIVE:**

| Contract | ID | Explorer |
|---|---|---|
| GreenToken (GTK) | `CCWB632FUW5RVXEZ424JI6HPC723FOVGX5Z2Z6DF4XZ7CEMLQB2U2JVH` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCWB632FUW5RVXEZ424JI6HPC723FOVGX5Z2Z6DF4XZ7CEMLQB2U2JVH) |
| ActionRegistry | `CBN5MHWIRHT4UKLAVVHOJC3MP5PNK7S2PCNWF4GOSEWVMUCORJOR2OMO` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CBN5MHWIRHT4UKLAVVHOJC3MP5PNK7S2PCNWF4GOSEWVMUCORJOR2OMO) |
| RewardManager | `CCM6ELX6CBDNTHS2XNVQSLE4GQLPEHCYRHKWJCT6PCO55PD2U33FEJTR` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCM6ELX6CBDNTHS2XNVQSLE4GQLPEHCYRHKWJCT6PCO55PD2U33FEJTR) |

**Admin Wallet (Testnet):** `GBUJUY43L6EVCKLPRNZUPUE7RO7MTFFTRUDXURJPE2SRE4K6X6KAT6HZ`  
**Supabase Project:** `https://thjqzzsoptsdocnyoxcu.supabase.co` — 13 tables, RLS enabled

---

## Architecture

```
[ Freighter Wallet ] ←→ [ Next.js Frontend ]
                               ↓
                    [ Next.js API Routes ]
                     ↙              ↘
         [ Soroban RPC ]       [ Supabase DB ]
              ↓
   ┌──────────────────────┐
   │   GreenToken (GTK)   │  SEP-41 Token
   │   ActionRegistry     │  Eco-action log + verification
   │   RewardManager      │  Token redemption + burn
   └──────────────────────┘
         Stellar Testnet
```

**Full architecture details:** [`architecture/stellar_blockchain_architecture.md`](architecture/stellar_blockchain_architecture.md)

---

## Core Features

| Feature | Description | On-Chain? |
|---|---|---|
| **Eco-Action Submission** | Users submit actions with photo evidence (SHA-256 hashed on-chain) | ✅ Yes |
| **Admin Verification** | Admins verify actions, triggering on-chain token minting | ✅ Yes |
| **GreenToken (GTK)** | SEP-41 compliant token, minted per verified action | ✅ Yes |
| **Token Redemption** | Users burn GTK for rewards (signed by Freighter wallet) | ✅ Yes |
| **Leaderboard** | Community rankings by GTK earned | Hybrid |
| **Donation Tracking** | Allocate tokens to eco-projects with on-chain records | Hybrid |
| **Analytics Dashboard** | Real-time impact metrics per organization | Off-chain |
| **Multi-Tenant SaaS** | Each org runs its own GTK program | Off-chain |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Blockchain** | Stellar (Soroban smart contracts in Rust) |
| **Token Standard** | SEP-41 (Stellar Ecosystem Proposal 41) |
| **Wallet** | Freighter (`@stellar/freighter-api`) |
| **Stellar JS SDK** | `@stellar/stellar-sdk` |
| **Frontend** | Next.js 14 + TypeScript + Tailwind CSS |
| **Database** | Supabase (PostgreSQL + Auth + Realtime) |
| **Deployment** | Vercel (frontend) + Stellar Testnet (contracts) |

---

## Getting Started

### Prerequisites

```bash
# Node.js 18+
node --version  # v18.x or higher

# Rust + Soroban toolchain
rustup target add wasm32-unknown-unknown
cargo install --locked stellar-cli --features opt

# Freighter wallet browser extension
# Install from: https://freighter.app
```

### 1. Clone and Install

```bash
git clone https://github.com/mokwathedeveloper/Community-GreenToken
cd Community-GreenToken
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Fill in your values (see .env.example for all required variables)
```

### 3. Deploy Smart Contracts to Testnet

```bash
# Build contracts
cd contracts
stellar contract build

# Deploy (run deploy script)
cd ..
bash scripts/deploy.sh

# Copy the printed contract IDs into .env.local
```

### 4. Initialize Contracts

```bash
# Set up token rewards, initial rewards catalog, admin roles
npx ts-node scripts/initialize.ts
```

### 5. Run the App

```bash
npm run dev
# Open: http://localhost:3000
```

### 6. Test the Full Flow

1. Open the app, click **Connect Wallet** → connect Freighter on Testnet
2. Fund your testnet wallet: visit `/api/stellar/wallet/fund?address=YOUR_KEY` or use [Friendbot](https://laboratory.stellar.org/#account-creator?network=test)
3. Submit a test eco-action on `/feature` (upload any photo as evidence)
4. Open Org Admin `/org/admin` → verify the action
5. Watch your GTK balance increase on the Dashboard
6. Go to `/redeem` → redeem tokens for a reward (sign with Freighter)
7. Check the transaction on [Stellar Expert Testnet](https://stellar.expert/explorer/testnet)

---

## Smart Contract Overview

### GreenToken.rs — SEP-41 Token
- Full SEP-41 interface (mint, burn, transfer, approve, allowance, balance)
- Admin-controlled minting — tokens only created for verified real-world actions
- 7 decimal places (Stellar standard)
- Emits on-chain events for every state change

### ActionRegistry.rs — Eco-Action Verification
- Records action submissions with SHA-256 evidence hash
- Admin verification triggers cross-contract token minting
- 10 action types with configurable token rewards
- Prevents replay: duplicate evidence hashes rejected on-chain

### RewardManager.rs — Token Redemption
- Manages reward catalog per organization
- Burns GTK on redemption — deflationary token mechanics
- User-signed transactions — platform never controls user wallets
- Full redemption history on-chain

---

## Project Structure

```
community-greentoken/
├── contracts/              Soroban smart contracts (Rust)
│   ├── green_token/        SEP-41 GTK token
│   ├── action_registry/    Action verification
│   └── reward_manager/     Token redemption
├── lib/stellar/            Stellar SDK service layer (TypeScript)
├── pages/api/stellar/      Next.js API routes
├── components/stellar/     React components (wallet, balance, tx status)
├── hooks/                  React hooks (wallet, token, actions)
├── architecture/           Full technical documentation
└── ux_ui/                  Design specs and page blueprints
```

---

## Environment Variables

See [`.env.example`](.env.example) for the full list. Key variables:

```env
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_GREEN_TOKEN_CONTRACT_ID=C...
NEXT_PUBLIC_ACTION_REGISTRY_CONTRACT_ID=C...
NEXT_PUBLIC_REWARD_MANAGER_CONTRACT_ID=C...
STELLAR_ADMIN_SECRET_KEY=S...    # server-side only, never public
```

---

## Team

| Name | Role |
|---|---|
| [Team Member 1] | Frontend / Next.js |
| [Team Member 2] | Backend / API |
| [Team Member 3] | Soroban Smart Contracts |
| [Team Member 4] | UX / Product |

---

## Documentation Index

| Document | Description |
|---|---|
| [`architecture/stellar_blockchain_architecture.md`](architecture/stellar_blockchain_architecture.md) | Full Stellar/Soroban architecture, contract specs, token economics |
| [`architecture/stellar_implementation_rules.md`](architecture/stellar_implementation_rules.md) | Strict development rules for blockchain code |
| [`architecture/stellar_sdk_api_spec.md`](architecture/stellar_sdk_api_spec.md) | Every function signature for SDK layer and API routes |
| [`DEVELOPMENT_RULES.md`](DEVELOPMENT_RULES.md) | All project-wide strict development rules |
| [`ux_ui/features_specs/DESIGN_SPEC.md`](ux_ui/features_specs/DESIGN_SPEC.md) | Complete UI design system and component library |

---

## Hackathon — WebBridge Stellar Track

This project was built for the **WebBridge Hackathon — Stellar Track**.

**Stellar implementation highlights:**
- ✅ 3 Soroban smart contracts deployed on Stellar Testnet
- ✅ Full SEP-41 token standard compliance
- ✅ Freighter wallet integration for user-owned redemptions  
- ✅ Cross-contract calls (ActionRegistry → GreenToken mint)
- ✅ On-chain evidence hashing for action verification integrity
- ✅ Stellar Explorer links for all transactions
- ✅ Deflationary token mechanics (burn on redemption)

---

*Built with ❤️ for a greener tomorrow, powered by Stellar.*

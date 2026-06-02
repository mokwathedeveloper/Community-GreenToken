# Community GreenToken Blockchain Implementation MD

This markdown provides a **professional developer blueprint** for implementing blockchain functionality in Community GreenToken, including smart contracts, token minting, QR/IoT verification, AI impact scoring, and real-time analytics.

---

## ⚠️ IMPORTANT — Stellar Soroban, NOT Solidity

> This project runs on the **Stellar blockchain** using **Soroban smart contracts written in Rust**.
> References to `.sol` files below are **legacy placeholders** and MUST be replaced with Rust/Soroban contracts.
> See `architecture/stellar_blockchain_architecture.md` for the correct specification.

## 1. Smart Contracts (Soroban / Rust — NOT Solidity)
- **green_token** (`contracts/green_token/src/lib.rs`): SEP-41 compliant GTK token — mint, burn, transfer, approve, balance.
- **action_registry** (`contracts/action_registry/src/lib.rs`): Records and verifies eco-actions; triggers cross-contract token minting.
- **reward_manager** (`contracts/reward_manager/src/lib.rs`): Manages reward catalog; burns GTK on user redemption.

**SDK:** `@stellar/stellar-sdk` (JavaScript) + `soroban-sdk` (Rust crate)  
**Wallet:** Freighter (`@stellar/freighter-api`)  
**Full spec:** `architecture/stellar_sdk_api_spec.md`

## 2. Core Functions
- `registerUser(walletAddress, name)` → Registers new users.
- `verifyAction(userId, actionType)` → Mints tokens for verified actions.
- `redeemTokens(userId, rewardId)` → Deducts tokens and logs redemption.
- `getLeaderboard()` → Returns top contributors.
- `getTokenBalance(userId)` → Returns current token balance.

## 3. Mandatory QR/IoT Integration
- Camera auto-focus and QR scanning UX optimizations.
- IoT sensor verification for real-world actions.
- Real-time dashboard analytics updates.
- AI/Analytics scoring for environmental impact.

## 4. Data Storage
- Users: wallet address, token balances, total actions.
- Actions: action ID, type, timestamp, verification status.
- Rewards: reward ID, token cost, availability, redemption history.

## 5. Frontend Integration
- Next.js API routes handle action submission, token redemption, and verification.
- Dashboard components update in real time: `MetricCard`, `LeaderboardCard`, `DonationProgress`.

## 6. Security & Best Practices
- Validate inputs on-chain.
- Prevent double-minting or replay attacks.
- Use blockchain event logging for transparency.
- Audit smart contracts before mainnet deployment.
- Ensure cryptographic integrity for QR/IoT data.

## 7. Correct Folder Structure (Stellar/Soroban)
```
contracts/                          ← Soroban contracts (Rust)
├─ Cargo.toml                       ← Workspace
├─ green_token/src/lib.rs           ← SEP-41 GTK token
├─ action_registry/src/lib.rs       ← Eco-action verification
└─ reward_manager/src/lib.rs        ← Token redemption

lib/stellar/                        ← TypeScript SDK layer
├─ config.ts                        ← Network + contract IDs
├─ client.ts                        ← Soroban RPC + Horizon servers
├─ freighter.ts                     ← Freighter wallet helpers
├─ transactions.ts                  ← Tx building + polling
└─ contracts/
   ├─ green-token.ts
   ├─ action-registry.ts
   └─ reward-manager.ts

pages/api/stellar/                  ← Next.js API routes
├─ actions/submit.ts
├─ actions/verify.ts
├─ tokens/balance.ts
├─ rewards/redeem.ts
└─ wallet/fund.ts

components/stellar/                 ← React components
├─ WalletConnect.tsx
├─ TokenBalance.tsx
├─ TransactionStatus.tsx
└─ NetworkBadge.tsx
```
> **Full specification:** `architecture/stellar_sdk_api_spec.md`

This MD file ensures **mandatory implementation
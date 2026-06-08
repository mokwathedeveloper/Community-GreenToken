# Community GreenToken — Blockchain Implementation Reference

This document is the developer blueprint for all blockchain functionality: Soroban smart contracts, token flows, QR verification, and frontend integration.

**Full spec:** `architecture/stellar_blockchain_architecture.md`  
**API spec:** `architecture/stellar_sdk_api_spec.md`

---

## Stack

| Layer | Technology |
|---|---|
| Blockchain | Stellar (Soroban smart contracts) |
| Contract language | Rust — Soroban SDK 26.0.1 |
| Build target | `wasm32v1-none` (requires Rust 1.84+) |
| JS integration | `@stellar/stellar-sdk` |
| Wallet | Freighter (`@stellar/freighter-api`) |
| Backend | Next.js 16 App Router (`app/api/`) |

---

## 1. Smart Contracts

All three contracts live under `contracts/` (Cargo workspace):

| Contract | File | Purpose |
|---|---|---|
| GreenToken | `contracts/green_token/src/lib.rs` | SEP-41 fungible token (GTK) — mint, burn, transfer, approve, burn_from |
| ActionRegistry | `contracts/action_registry/src/lib.rs` | Records eco-actions on-chain; admin verify triggers cross-contract mint |
| RewardManager | `contracts/reward_manager/src/lib.rs` | Reward catalog; burns GTK on redemption (deflationary) |

### Deployed testnet IDs (2026-06-08)

```
NEXT_PUBLIC_GREEN_TOKEN_CONTRACT_ID=CCSSWPHW3KJHEI4FIBTMBNQ7DPMN73JVCQB7JHEWXFAVFRCYTTS5UJDK
NEXT_PUBLIC_ACTION_REGISTRY_CONTRACT_ID=CBIHBB35RI2LWHECDJ4G2ZZSGXYVOCCTVFPUNGOI7DOWQOWA3OPDVRDS
NEXT_PUBLIC_REWARD_MANAGER_CONTRACT_ID=CAZJ4I42D4CATJMF2WOIUUYXJ5GOP5N3ICUFAS6SOQKU4DD6TSQAFSQE
```

### Build and deploy
```bash
cd contracts
cargo build --release --target wasm32v1-none

# Upload + deploy each WASM, then initialize
# Full commands: architecture/stellar_blockchain_architecture.md → "Contract Deployment" section
```

### In-place upgrades (no re-deploy)
All 3 contracts expose `upgrade(admin, new_wasm_hash)` — upload a new WASM, pass the hash, storage is preserved.

---

## 2. Core Token Flows

### Action submission → token mint (server-side)
```
User uploads evidence photo
  → SHA-256 hash computed client-side
  → POST /api/stellar/actions/submit
    → ActionRegistry.submit_action(user, type, evidence_hash, org_id)
    → Saved to Supabase (status: pending)

Admin approves in dashboard
  → POST /api/stellar/actions/verify
    → ActionRegistry.verify_action(action_id, tokens)
      → cross-contract: GreenToken.mint(user, tokens)
    → Supabase: action.status = "verified", token_balances updated
```

### Token redemption (user-signed)
```
User clicks "Redeem" on reward card
  → Freighter prompts user to sign the transaction (user's own keypair)
  → POST /api/stellar/rewards/redeem (submits signed tx)
    → RewardManager.redeem_reward(user, reward_id)
      → cross-contract: GreenToken.burn(user, token_cost)
    → Supabase: redemption logged, balance decremented
```

---

## 3. Folder Structure

```
contracts/                          ← Soroban Rust workspace
├─ Cargo.toml
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

app/api/stellar/                    ← Next.js App Router API routes
├─ actions/submit/route.ts
├─ actions/verify/route.ts
├─ tokens/balance/route.ts
├─ rewards/redeem/route.ts
└─ wallet/fund/route.ts

app/api/impact/
├─ me/route.ts                      ← Personal CO₂ offset + streak (authenticated)

app/api/stats/
└─ public/route.ts                  ← Aggregate public stats (5-min ISR)

components/stellar/                 ← Stellar UI components
├─ WalletConnect.tsx
├─ TokenBalance.tsx
├─ TransactionStatus.tsx
└─ NetworkBadge.tsx

components/dashboard/
└─ ImpactSummary.tsx                ← CO₂ offset + streak + real-world equivalency
```

---

## 4. Security Principles

1. **Server keypair never touches user funds** — platform key mints/verifies only
2. **User must sign redemptions** — Freighter wallet; no backend can drain user wallets
3. **Evidence hash on-chain** — prevents post-hoc falsification; SHA-256 is stored, not the photo
4. **Duplicate evidence rejected** — `EvidenceUsed(BytesN<32>)` storage key in ActionRegistry
5. **`require_auth()` on every privileged function** — Soroban enforces this at the VM level
6. **`approve()` TTL aligned** — `extend_ttl()` keeps the Soroban temp storage entry alive through the full allowance period
7. **All token amounts are `i128`** — no overflow risk from 64-bit truncation

---

## 5. Event System

All events use type-safe `#[contractevent]` structs (Soroban SDK 26+). The struct name is the auto-first topic; no `symbol_short!` magic strings. See each contract's `// ── Events` section for the full struct definitions.

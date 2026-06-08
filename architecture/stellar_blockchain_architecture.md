# Community GreenToken — Stellar Blockchain Architecture

**Network:** Stellar (Soroban Smart Contracts)  
**Standard:** SEP-41 (Stellar Token Standard)  
**Language:** Rust (Soroban SDK) for contracts | TypeScript (Stellar JS SDK) for integration  
**Wallet:** Freighter Browser Extension  
**Testnet RPC:** `https://soroban-testnet.stellar.org`  
**Mainnet RPC:** `https://soroban-mainnet.stellar.org`  
**Horizon Testnet:** `https://horizon-testnet.stellar.org`  
**Build toolchain:** Rust 1.84+, Soroban SDK 26.0.1, target `wasm32v1-none`

---

## Deployed Contract IDs (Testnet — updated 2026-06-08)

| Contract | Address |
|---|---|
| GreenToken | `CCSSWPHW3KJHEI4FIBTMBNQ7DPMN73JVCQB7JHEWXFAVFRCYTTS5UJDK` |
| ActionRegistry | `CBIHBB35RI2LWHECDJ4G2ZZSGXYVOCCTVFPUNGOI7DOWQOWA3OPDVRDS` |
| RewardManager | `CAZJ4I42D4CATJMF2WOIUUYXJ5GOP5N3ICUFAS6SOQKU4DD6TSQAFSQE` |
| Admin Public Key | `GBUJUY43L6EVCKLPRNZUPUE7RO7MTFFTRUDXURJPE2SRE4K6X6KAT6HZ` |

WASM hashes uploaded this deployment:
- GreenToken: `49f1aef40e6cc9ed009acfcc6b60b6b0a228cf53ae18e56e306cc20bb4c491fc`
- ActionRegistry: `52fbc8dae43ebd59f07521ab7da17fd38a8dba3d3e1d5bf9c671f800900fbbea`
- RewardManager: `9bfc2ed31b46aa684d54e70bfe198c6f3324e2adfefa0ff33cc04ff84522f88d`

All 3 contracts include `upgrade(admin, new_wasm_hash)` for future in-place WASM upgrades.

---

## Why Stellar?

Stellar is purpose-built for real-world asset tokenization and community incentive programs:

| Stellar Advantage | Why It Matters for GreenToken |
|---|---|
| **5-second finality** | Token rewards appear instantly after action verification |
| **$0.00001 per transaction** | Enables micro-rewards for every small eco-action |
| **SEP-41 token standard** | Universal token interface — any Stellar wallet can hold GTK |
| **Soroban (on-chain logic)** | Trustless action verification without a centralized server |
| **Built-in account model** | Every wallet is a Stellar account — no contract deployment needed to receive tokens |
| **Carbon-neutral chain** | Aligned with our environmental mission |
| **Freighter wallet** | Simple UX — no MetaMask complexity for community users |

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     USER / BROWSER                           │
│                                                              │
│   Freighter Wallet Extension (Stellar keypair)               │
│        │                                                     │
│        │  signTransaction()                                  │
│        ▼                                                     │
│   Next.js Frontend (React + TypeScript)                      │
│   • FreighterConnect component                               │
│   • ActionSubmit form                                        │
│   • TokenBalance display                                     │
│   • Dashboard / Leaderboard                                  │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP (REST API)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js API Routes (Backend)                    │
│                                                              │
│  /api/stellar/actions/submit   — log action in DB + chain    │
│  /api/stellar/actions/verify   — admin verify + mint tokens  │
│  /api/stellar/tokens/balance   — read on-chain GTK balance   │
│  /api/stellar/rewards/redeem   — burn GTK + log redemption   │
│  /api/stellar/wallet/fund      — Friendbot testnet funding   │
│  /api/stellar/network/status   — health check                │
└──────┬─────────────────────────────┬───────────────────────┘
       │                             │
       │ Stellar JS SDK              │ Supabase Client
       ▼                             ▼
┌──────────────────┐    ┌────────────────────────────────────┐
│  STELLAR NETWORK │    │         SUPABASE DATABASE           │
│                  │    │                                      │
│  Soroban RPC     │    │  users, actions, token_balances,     │
│  Horizon API     │    │  redemption_logs, leaderboard,       │
│                  │    │  analytics_metrics, donations         │
│  ┌────────────┐  │    └────────────────────────────────────┘
│  │ GreenToken │  │
│  │ Contract   │  │  ← SEP-41 token (GTK)
│  │ (Soroban)  │  │
│  └────────────┘  │
│  ┌────────────┐  │
│  │  Action    │  │
│  │  Registry  │  │  ← Verifies eco-actions on-chain
│  │  (Soroban) │  │
│  └────────────┘  │
│  ┌────────────┐  │
│  │   Reward   │  │
│  │  Manager   │  │  ← Burns tokens on redemption
│  │  (Soroban) │  │
│  └────────────┘  │
└──────────────────┘
```

---

## The Three Soroban Smart Contracts

### Contract 1 — GreenToken (SEP-41 Token)

**Purpose:** The on-chain token that users earn and spend. Fully SEP-41 compliant so any Stellar wallet or DEX can interact with it natively.

**Token Details:**
- **Name:** GreenToken
- **Symbol:** GTK
- **Decimals:** 7 (Stellar standard)
- **Minting:** Admin-only (controlled by ActionRegistry calls)
- **Burning:** On redemption via RewardManager

**All Functions to Implement:**

| Function | Parameters | Returns | Who Can Call |
|---|---|---|---|
| `initialize` | `admin: Address, decimal: u32, name: String, symbol: String` | — | One-time only |
| `mint` | `to: Address, amount: i128` | — | Admin only |
| `burn` | `from: Address, amount: i128` | — | Token holder |
| `burn_from` | `spender: Address, from: Address, amount: i128` | — | Approved spender |
| `transfer` | `from: Address, to: Address, amount: i128` | — | Token holder |
| `transfer_from` | `spender: Address, from: Address, to: Address, amount: i128` | — | Approved spender |
| `approve` | `from: Address, spender: Address, amount: i128, expiration_ledger: u32` | — | Token holder |
| `allowance` | `from: Address, spender: Address` | `i128` | Anyone |
| `balance` | `id: Address` | `i128` | Anyone |
| `decimals` | — | `u32` | Anyone |
| `name` | — | `String` | Anyone |
| `symbol` | — | `String` | Anyone |
| `set_admin` | `admin: Address, new_admin: Address` | — | Current admin |
| `upgrade` | `admin: Address, new_wasm_hash: BytesN<32>` | — | Admin only |

**Storage Keys (DataKey enum):**
```
Admin
Balance(Address)
Allowance(AllowanceDataKey { from, spender })
Metadata (name, symbol, decimal)
```

**Events (type-safe `#[contractevent]` structs, SDK 26+):**

| Struct | Fields (data) | Auto topic |
|---|---|---|
| `Mint` | `to: Address, amount: i128` | `"mint"` |
| `Burn` | `from: Address, amount: i128` | `"burn"` |
| `Transfer` | `from: Address, to: Address, amount: i128` | `"transfer"` |
| `Approve` | `from: Address, spender: Address, amount: i128, expiration_ledger: u32` | `"approve"` |
| `BurnFrom` | `spender: Address, from: Address, amount: i128` | `"burn_from"` |

**`approve()` TTL fix:** Uses `extend_ttl()` to align Soroban temporary storage TTL with `expiration_ledger`, preventing allowance entries from expiring before the logical deadline.

---

### Contract 2 — ActionRegistry

**Purpose:** Records every eco-action submission on-chain. Admins verify actions and trigger token minting. This is the core trust layer — the immutable audit trail of all sustainable actions.

**Action Types (Enum):**
```
Recycling
TreePlanting
Carpooling
EnergySaving
WaterSaving
CommunityCleanup
CompostingOrganics
PublicTransport
SolarEnergyUse
BeachCleanup
```

**Action Struct (stored on-chain):**
```
action_id:      u64
user:           Address
action_type:    ActionType (enum)
description:    String (max 200 chars)
evidence_hash:  BytesN<32>  ← SHA-256 hash of photo/QR data
timestamp:      u64         ← ledger timestamp
status:         ActionStatus (Pending | Verified | Rejected)
tokens_awarded: i128        ← set when verified
org_id:         BytesN<32>  ← for SaaS multi-tenancy
```

**All Functions to Implement:**

| Function | Parameters | Returns | Who Can Call |
|---|---|---|---|
| `initialize` | `admin: Address, token_contract: Address` | — | One-time only |
| `submit_action` | `user: Address, action_type: ActionType, description: String, evidence_hash: BytesN<32>, org_id: BytesN<32>` | `u64` (action_id) | Any authenticated user |
| `verify_action` | `action_id: u64, tokens_to_mint: i128` | — | Admin only |
| `reject_action` | `action_id: u64, reason: String` | — | Admin only |
| `get_action` | `action_id: u64` | `Action` | Anyone |
| `get_user_actions` | `user: Address` | `Vec<u64>` | Anyone |
| `get_pending_count` | — | `u64` | Anyone |
| `action_count` | — | `u64` | Anyone |
| `set_token_reward` | `admin: Address, action_type: ActionType, tokens: i128` | — | Admin only |
| `get_token_reward` | `action_type: ActionType` | `i128` | Anyone |
| `upgrade` | `admin: Address, new_wasm_hash: BytesN<32>` | — | Admin only |

**Default Token Rewards Per Action:**
```
Recycling          → 10 GTK (× 10^7 stroops)
TreePlanting       → 20 GTK
Carpooling         → 15 GTK
EnergySaving       → 12 GTK
WaterSaving        → 10 GTK
CommunityCleanup   → 25 GTK
CompostingOrganics → 10 GTK
PublicTransport    → 8 GTK
SolarEnergyUse     → 20 GTK
BeachCleanup       → 30 GTK
```

**Storage Keys:**
```
Admin
TokenContract
ActionCount
Action(u64)               ← action by ID
UserActions(Address)      ← Vec<u64> of action IDs per user
EvidenceUsed(BytesN<32>)  ← duplicate prevention
TokenReward(ActionType)
```

**Events (type-safe `#[contractevent]` structs, SDK 26+):**

| Struct | Fields | Auto topic |
|---|---|---|
| `ActionSubmitted` | `action_id: u64, user: Address, timestamp: u64` | `"action_submitted"` |
| `ActionVerified` | `action_id: u64, tokens: i128` | `"action_verified"` |
| `ActionRejected` | `action_id: u64` | `"action_rejected"` |

---

### Contract 3 — RewardManager

**Purpose:** Manages the reward catalog and handles token redemptions. Burns GTK tokens from the user's balance when they redeem a reward, creating deflationary token mechanics.

**Reward Struct:**
```
reward_id:    u32
name:         String
description:  String
token_cost:   i128
total_supply: Option<u32>   ← None = unlimited
redeemed:     u32
is_active:    bool
org_id:       BytesN<32>
```

**Redemption Struct:**
```
redemption_id:  u64
user:           Address
reward_id:      u32
tokens_burned:  i128
timestamp:      u64
tx_reference:   String    ← on-chain tx hash reference
```

**All Functions to Implement:**

| Function | Parameters | Returns | Who Can Call |
|---|---|---|---|
| `initialize` | `admin: Address, token_contract: Address` | — | One-time only |
| `add_reward` | `reward_id: u32, name: String, description: String, token_cost: i128, total_supply: Option<u32>, org_id: BytesN<32>` | — | Admin only |
| `update_reward` | `reward_id: u32, token_cost: i128, is_active: bool` | — | Admin only |
| `redeem_reward` | `user: Address, reward_id: u32` | `u64` (redemption_id) | Token holder |
| `get_reward` | `reward_id: u32` | `Reward` | Anyone |
| `get_all_rewards` | — | `Vec<u32>` | Anyone |
| `get_user_redemptions` | `user: Address` | `Vec<u64>` | Anyone |
| `get_redemption` | `redemption_id: u64` | `Redemption` | Anyone |
| `redemption_count` | — | `u64` | Anyone |
| `total_burned` | — | `i128` | Anyone |
| `upgrade` | `admin: Address, new_wasm_hash: BytesN<32>` | — | Admin only |

**Storage Keys:**
```
Admin
TokenContract
RewardCount
Reward(u32)
UserRedemptions(Address)
RedemptionCount
Redemption(u64)
TotalBurned
```

**Events (type-safe `#[contractevent]` structs, SDK 26+):**

| Struct | Fields | Auto topic |
|---|---|---|
| `RewardAdded` | `reward_id: u32, token_cost: i128` | `"reward_added"` |
| `RewardRedeemed` | `redemption_id: u64, user: Address, reward_id: u32, tokens_burned: i128` | `"reward_redeemed"` |

---

## Contract Interactions Sequence

### 1. User Submits an Eco-Action

```
User fills ActionForm (type + description + uploads photo evidence)
        │
        ▼
Frontend hashes photo: SHA-256(photo_bytes) → evidence_hash
        │
        ▼
API route: POST /api/stellar/actions/submit
  - Signs tx with PLATFORM_SECRET_KEY (server-side)
  - Calls ActionRegistry.submit_action(user, type, desc, evidence_hash, org_id)
  - Gets back action_id (u64)
  - Saves action to Supabase DB (with action_id as blockchain reference)
        │
        ▼
Returns action_id to frontend → shown in "Pending" state
```

### 2. Admin Verifies the Action → Tokens Minted

```
Admin opens verification queue in Org Admin Dashboard
        │
        ▼
Admin clicks "Approve" on an action
        │
        ▼
API route: POST /api/stellar/actions/verify
  - Auth check: JWT role must be 'admin' or 'owner'
  - Calls ActionRegistry.verify_action(action_id, tokens_amount)
    ↳ ActionRegistry internally calls GreenToken.mint(user, tokens_amount)
  - Updates Supabase: action.status = 'verified', tokens_awarded
  - Updates Supabase: token_balances.balance += tokens_awarded
        │
        ▼
Dashboard updates in real-time via Supabase Realtime subscription
User sees new token balance
Leaderboard updates
```

### 3. User Redeems Tokens for a Reward

```
User selects a reward card, clicks "Redeem"
        │
        ▼
Frontend: Freighter prompts user to SIGN the redemption transaction
  - User MUST sign with their own Freighter wallet key
  - This proves the user controls the wallet (not server-side)
        │
        ▼
API route: POST /api/stellar/rewards/redeem
  - Submits the user-signed transaction to Stellar network
  - RewardManager.redeem_reward(user, reward_id)
    ↳ RewardManager burns GTK from user's balance
    ↳ Updates reward.redeemed count
  - Records redemption in Supabase
        │
        ▼
Returns redemption_id + tx_hash → shown in ConfirmationModal
Token balance decreases on dashboard
```

---

## Evidence Hashing (QR / Photo Verification)

Every action submission requires an `evidence_hash` (SHA-256). This creates on-chain proof of the physical evidence without storing images on Stellar.

```
How it works:
1. User uploads photo of their eco-action (recycling bin, planted tree, etc.)
2. OR user scans a QR code at a verified eco-station
3. Frontend computes SHA-256 hash of the file bytes
4. Hash (32 bytes) is submitted to ActionRegistry on-chain
5. Original photo is stored in Supabase Storage
6. Anyone can verify: SHA-256(stored_photo) === on_chain_hash
```

**QR Code verification stations:**
- Each registered eco-station has a unique QR code signed by the platform keypair
- QR payload: `{ station_id, action_type, timestamp, platform_signature }`
- Backend verifies the signature before accepting the action
- Prevents fake QR submissions from unregistered stations

---

## Token Economics

| Parameter | Value | Rationale |
|---|---|---|
| Token Symbol | GTK | GreenToken |
| Decimals | 7 | Stellar standard (1 GTK = 10,000,000 stroops) |
| Initial Supply | 0 | Minted only on verified actions (no pre-mint) |
| Minting | Admin-controlled | Prevents inflation/gaming |
| Burning | On redemption | Deflationary mechanics, token has real utility |
| Max per action | 30 GTK (BeachCleanup) | Prevents whale gaming single action type |
| Minimum balance | 0.5 XLM reserve | Stellar account minimum (for gas fees) |

**Why no pre-mint?** Trust. Every token in circulation was earned by a verified real-world action. This is provable on-chain.

---

## Stellar-Specific Technical Requirements

### Accounts and Keypairs

```
Platform Admin Keypair:   G... (public) / S... (secret) → stored in .env.local
                          Controls: mint, verify, contract admin functions

User Wallets:             Connected via Freighter browser extension
                          Users sign their OWN redemption transactions
                          Users NEVER share private keys with the app

Contract Accounts:        Each deployed Soroban contract has its own address (C...)
```

### Ledger Storage Limits

Soroban has strict storage limits per transaction and per ledger entry:
- **Persistent storage:** Long-lived data (token balances, actions) — higher rent fee
- **Temporary storage:** Short-lived (nonces, temp state) — expires automatically
- **Instance storage:** Contract-level data (admin, config) — lives as long as contract

**Rule:** Token balances and action records → PERSISTENT storage.  
Temporary nonces and approval state → TEMPORARY storage with expiration.

### Transaction Fees (XLM)

Every Stellar operation requires a small XLM fee:
- Base fee: 100 stroops (0.00001 XLM) minimum
- Smart contract invocations: higher fee based on CPU/memory usage
- The platform pays fees for action submission and verification (server-side keypair)
- Users pay their own fees only for wallet-signed redemptions

---

## Contract Deployment (Stellar CLI — exact commands)

### Prerequisites
```bash
# Rust 1.84+ with wasm32v1-none target
rustup target add wasm32v1-none

# Stellar CLI 26+
stellar keys add admin --secret-key <STELLAR_ADMIN_SECRET_KEY>
```

### Build
```bash
cd contracts
cargo build --release --target wasm32v1-none
```

### Upload WASMs (get hash for each)
```bash
stellar contract upload --wasm target/wasm32v1-none/release/green_token.wasm \
  --network testnet --source admin

stellar contract upload --wasm target/wasm32v1-none/release/action_registry.wasm \
  --network testnet --source admin

stellar contract upload --wasm target/wasm32v1-none/release/reward_manager.wasm \
  --network testnet --source admin
```

### Deploy (each returns a contract ID)
```bash
stellar contract deploy --wasm-hash <GREEN_TOKEN_HASH>   --network testnet --source admin
stellar contract deploy --wasm-hash <ACTION_REGISTRY_HASH> --network testnet --source admin
stellar contract deploy --wasm-hash <REWARD_MANAGER_HASH>  --network testnet --source admin
```

### Initialize
```bash
# 1. GreenToken
stellar contract invoke --id <GREEN_TOKEN_ID> --network testnet --source admin \
  -- initialize \
  --admin <ADMIN_PUBLIC_KEY> --decimal 7 --name "GreenToken" --symbol "GTK"

# 2. ActionRegistry
stellar contract invoke --id <ACTION_REGISTRY_ID> --network testnet --source admin \
  -- initialize \
  --admin <ADMIN_PUBLIC_KEY> --token_contract <GREEN_TOKEN_ID>

# 3. RewardManager
stellar contract invoke --id <REWARD_MANAGER_ID> --network testnet --source admin \
  -- initialize \
  --admin <ADMIN_PUBLIC_KEY> --token_contract <GREEN_TOKEN_ID>
```

### Update .env.local
```
NEXT_PUBLIC_GREEN_TOKEN_CONTRACT_ID=<GREEN_TOKEN_ID>
NEXT_PUBLIC_ACTION_REGISTRY_CONTRACT_ID=<ACTION_REGISTRY_ID>
NEXT_PUBLIC_REWARD_MANAGER_CONTRACT_ID=<REWARD_MANAGER_ID>
```

### Future upgrades (in-place WASM swap, no re-deploy needed)
```bash
# Upload new WASM, then call upgrade() — storage is preserved
NEW_HASH=$(stellar contract upload --wasm target/.../green_token.wasm --network testnet --source admin)
stellar contract invoke --id <GREEN_TOKEN_ID> --network testnet --source admin \
  -- upgrade --admin <ADMIN_PUBLIC_KEY> --new_wasm_hash "$NEW_HASH"
```

---

## Network Configuration

```
TESTNET (Development & Hackathon demo):
  Horizon:     https://horizon-testnet.stellar.org
  Soroban RPC: https://soroban-testnet.stellar.org
  Network ID:  Test SDF Network ; September 2015
  Friendbot:   https://friendbot.stellar.org?addr={PUBLIC_KEY}

MAINNET (Production):
  Horizon:     https://horizon.stellar.org
  Soroban RPC: https://soroban-mainnet.stellar.org
  Network ID:  Public Global Stellar Network ; September 2015
```

---

## Security Principles for This Implementation

1. **Server keypair never touches user funds** — platform key only mints/verifies, never transfers user tokens
2. **User must sign redemptions** — Freighter wallet signature required; no backend can drain user wallets
3. **Evidence hash on-chain** — prevents falsification of submitted actions after the fact
4. **One action per evidence hash** — ActionRegistry must reject duplicate evidence_hash submissions
5. **Admin role separation** — `verify_action` and `set_admin` are separate roles; compromise of one does not compromise the other
6. **Soroban access control** — every privileged function uses `require_auth()` for the admin address
7. **Overflow protection** — all arithmetic on `i128` token amounts must check for overflow
8. **Re-entrancy safe** — Soroban's execution model is synchronous and does not allow re-entrant calls

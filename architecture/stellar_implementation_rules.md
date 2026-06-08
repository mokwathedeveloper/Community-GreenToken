# Community GreenToken — Stellar Blockchain Strict Implementation Rules

**These rules are MANDATORY during all blockchain development.**  
**Authority:** No deviation without documented justification.  
**Read alongside:** `stellar_blockchain_architecture.md` and `DEVELOPMENT_RULES.md`

---

## Rule Language

| Word | Meaning |
|---|---|
| **MUST** | Mandatory. No exceptions. |
| **MUST NOT** | Forbidden. |
| **SHOULD** | Strongly recommended. |

---

## Part 1 — Stellar Network Rules

**R-STL-01** — MUST use **Soroban** for all smart contract logic. MUST NOT write Solidity or any EVM-compatible contract code. This is a Stellar hackathon.

**R-STL-02** — MUST target **Stellar Testnet** during development and hackathon demo. Contract IDs and addresses MUST be testnet addresses starting with `C...` (contract) and `G...` (account).

**R-STL-03** — MUST use the **official Stellar JS SDK** (`@stellar/stellar-sdk`) for all Stellar interactions in JavaScript/TypeScript. MUST NOT use ethers.js, web3.js, or any EVM library.

**R-STL-04** — MUST use **Freighter** (`@stellar/freighter-api`) as the wallet integration. This is the primary Stellar wallet. Support for other Stellar wallets (e.g., Albedo, xBull) is optional.

**R-STL-05** — MUST store the Stellar Testnet RPC URLs in `.env.local` as constants:
```
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

---

## Part 2 — Soroban Contract Rules

**R-SC-01** — ALL three contracts MUST be written in **Rust** using the `soroban-sdk` crate. No other smart contract language is acceptable on Stellar.

**R-SC-02** — The GreenToken contract MUST implement the **full SEP-41 interface**. No functions may be omitted. Partial SEP-41 is not acceptable.

**R-SC-03** — Every privileged contract function (mint, verify, add_reward, set_admin) MUST call `admin.require_auth()` as the FIRST line of the function body. This is the Soroban access control pattern.

```rust
// ✅ CORRECT — require_auth is first
pub fn mint(env: Env, admin: Address, to: Address, amount: i128) {
    admin.require_auth();  // ← MUST be first
    // ... rest of logic
}

// ❌ WRONG — any auth check after business logic
pub fn mint(env: Env, admin: Address, to: Address, amount: i128) {
    let balance = get_balance(&env, &to);
    admin.require_auth();  // too late
    // ...
}
```

**R-SC-04** — MUST use `i128` for ALL token amounts. MUST NOT use `u64`, `u32`, or `f64` for token values. Stellar token amounts are always `i128`.

**R-SC-05** — MUST validate that all token amounts are **positive** before any mint or transfer:
```rust
if amount <= 0 { panic!("amount must be positive"); }
```

**R-SC-06** — The ActionRegistry contract MUST reject duplicate `evidence_hash` submissions. Store a mapping of `BytesN<32> → bool` and check before accepting any new action.

**R-SC-07** — MUST use `env.storage().persistent()` for token balances and action records. MUST NOT use `env.storage().temporary()` for data that must survive beyond one ledger.

**R-SC-08** — MUST emit a contract event for every state-changing operation. Events are how the frontend listens for on-chain changes.
```rust
env.events().publish(
    (symbol_short!("mint"), symbol_short!("v1")),
    (to.clone(), amount),
);
```

**R-SC-09** — The ActionRegistry MUST call `GreenToken.mint()` WITHIN the `verify_action` function using a cross-contract call. The backend MUST NOT call GreenToken.mint directly — minting must only happen through ActionRegistry.

**R-SC-10** — MUST write at least one test for every public contract function using `#[cfg(test)]` and `soroban-sdk`'s testutils. Zero-test contracts MUST NOT be deployed.

**R-SC-11** — The Cargo workspace MUST be at `contracts/Cargo.toml`. Each contract is a separate crate inside `contracts/`. Do not mix contract code with frontend code.

```
contracts/
├── Cargo.toml          ← workspace root
├── green_token/
│   ├── Cargo.toml
│   └── src/lib.rs
├── action_registry/
│   ├── Cargo.toml
│   └── src/lib.rs
└── reward_manager/
    ├── Cargo.toml
    └── src/lib.rs
```

**R-SC-12** — MUST build contracts with `--release` profile for deployment:
```bash
stellar contract build
```
MUST NOT deploy `debug` builds. Debug builds are ~10× larger and will exceed Stellar's contract size limits.

---

## Part 3 — JavaScript SDK Rules

**R-SDK-01** — MUST create a dedicated `lib/stellar/` folder for all Stellar-related TypeScript code. MUST NOT scatter Stellar SDK calls across page or component files.

**R-SDK-02** — The `lib/stellar/config.ts` file MUST be the SINGLE source of truth for all network configuration. All other files import from config, never hardcode URLs or contract IDs.

```typescript
// lib/stellar/config.ts — SINGLE SOURCE OF TRUTH
export const STELLAR_CONFIG = {
  network:          process.env.NEXT_PUBLIC_STELLAR_NETWORK as 'testnet' | 'mainnet',
  horizonUrl:       process.env.NEXT_PUBLIC_HORIZON_URL!,
  sorobanRpcUrl:    process.env.NEXT_PUBLIC_SOROBAN_RPC_URL!,
  networkPassphrase: process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE!,
  contracts: {
    greenToken:      process.env.NEXT_PUBLIC_GREEN_TOKEN_CONTRACT_ID!,
    actionRegistry:  process.env.NEXT_PUBLIC_ACTION_REGISTRY_CONTRACT_ID!,
    rewardManager:   process.env.NEXT_PUBLIC_REWARD_MANAGER_CONTRACT_ID!,
  },
} as const;
```

**R-SDK-03** — MUST use `SorobanRpc.Server` for all contract read and simulation calls. MUST use `Horizon.Server` for account balance, transaction history, and account existence checks.

**R-SDK-04** — MUST simulate every transaction before submitting it (`server.simulateTransaction(tx)`). A failed simulation means the transaction WILL fail on-chain — do not submit it.

**R-SDK-05** — MUST handle the three possible transaction states and surface them to the user:
- `PENDING` — transaction submitted, awaiting confirmation
- `SUCCESS` — transaction included in a ledger
- `FAILED` — transaction failed or timed out

**R-SDK-06** — MUST implement retry logic with exponential backoff when polling for transaction status. MUST NOT use a fixed-interval polling loop.

**R-SDK-07** — The platform admin secret key (`STELLAR_ADMIN_SECRET_KEY`) MUST ONLY be used server-side in Next.js API routes. MUST NEVER be passed to the frontend or stored in `NEXT_PUBLIC_` environment variables.

**R-SDK-08** — MUST convert all token display values using the decimal factor: `displayed = raw_amount / 10^7`. MUST NOT display raw `i128` stroops to the user.

```typescript
// ✅ CORRECT
const displayBalance = Number(rawBalance) / 10_000_000;  // 7 decimals

// ❌ WRONG
const displayBalance = Number(rawBalance);  // shows 10000000 instead of 1.0
```

---

## Part 4 — Freighter Wallet Rules

**R-FRQ-01** — MUST check `isConnected()` AND `isAllowed()` from `@stellar/freighter-api` before attempting any wallet operation. A connected wallet is not necessarily allowed for the current dApp.

```typescript
// ✅ CORRECT
import { isConnected, isAllowed, getPublicKey } from '@stellar/freighter-api';

const connected = await isConnected();
const allowed   = await isAllowed();
if (!connected || !allowed) { /* show connect button */ }
```

**R-FRQ-02** — MUST call `setAllowed()` when user clicks "Connect Wallet" to request permission. MUST NOT assume the wallet is allowed on page load.

**R-FRQ-03** — MUST use `signTransaction(xdr, { network: 'TESTNET' })` for signing. MUST pass the network explicitly. MUST NOT call sign without the network parameter.

**R-FRQ-04** — MUST handle the case where Freighter is NOT installed and show a clear "Install Freighter" message with a link to `https://freighter.app`. MUST NOT silently fail.

**R-FRQ-05** — MUST NEVER ask the user to sign a transaction that includes a server-side mint or admin action. Those are signed server-side. Users only sign their OWN redemption transactions.

**R-FRQ-06** — Wallet public key MUST be displayed shortened in the UI: first 4 + last 4 characters:
```typescript
const short = `${pubkey.slice(0,4)}...${pubkey.slice(-4)}`;
// Example: GABC...WXYZ
```

---

## Part 5 — API Route Rules

**R-API-STL-01** — ALL Stellar API routes MUST live under `pages/api/stellar/`. MUST NOT mix Stellar routes with non-Stellar routes in the same file.

**R-API-STL-02** — Routes that MINT tokens or VERIFY actions MUST check the user's JWT role before executing ANY Stellar operation. If role is not `admin` or `owner`, return `403` immediately.

**R-API-STL-03** — MUST record every on-chain transaction hash in the Supabase database alongside the related record (action, redemption, etc.). The `tx_hash` column is MANDATORY on every blockchain-touching table.

**R-API-STL-04** — MUST validate the Stellar public key format (starts with `G`, length 56 characters) before using it in any contract call. Invalid keys MUST return `400`.

```typescript
// ✅ CORRECT
import { StrKey } from '@stellar/stellar-sdk';
if (!StrKey.isValidEd25519PublicKey(publicKey)) {
  return res.status(400).json({ error: 'Invalid Stellar public key' });
}
```

**R-API-STL-05** — The Friendbot funding endpoint (`/api/stellar/wallet/fund`) MUST only work on testnet. MUST check `NEXT_PUBLIC_STELLAR_NETWORK === 'testnet'` before calling Friendbot. MUST NOT expose this endpoint on mainnet.

**R-API-STL-06** — Every API route that interacts with Stellar MUST return the `tx_hash` in the response body when a transaction is submitted. The frontend MUST display this to the user as proof of on-chain activity.

---

## Part 6 — Frontend Component Rules

**R-FE-STL-01** — The `WalletConnect` component MUST be present in the Navbar on all dashboard/app pages. Its state (connected/disconnected) MUST be global via React Context.

**R-FE-STL-02** — MUST show a `NetworkBadge` component on all authenticated pages indicating which Stellar network the user is connected to (TESTNET / MAINNET). Users must always know their network context.

**R-FE-STL-03** — Every action that submits a transaction MUST show a `TransactionStatus` component with three states: Submitting → Confirming → Success/Failed. MUST NOT silently process transactions without UI feedback.

**R-FE-STL-04** — Token balances MUST be fetched BOTH from Supabase (for speed) AND verified against the on-chain balance via Stellar SDK. If they differ, the on-chain value wins and Supabase is updated.

**R-FE-STL-05** — MUST show the Stellar Explorer link for every completed transaction:
```
Testnet: https://stellar.expert/explorer/testnet/tx/{tx_hash}
Mainnet: https://stellar.expert/explorer/public/tx/{tx_hash}
```

**R-FE-STL-06** — MUST display the user's Stellar public key (shortened) alongside their username in the dashboard header. This makes the Web3 identity clear.

---

## Part 7 — Evidence and QR Rules

**R-QR-01** — Every action submission MUST include an `evidence_hash`. Submissions without evidence MUST be rejected by both the frontend validation and the ActionRegistry contract.

**R-QR-02** — The evidence hash MUST be computed in the browser BEFORE sending to the API:
```typescript
// Hash the file in the browser
const arrayBuffer = await file.arrayBuffer();
const hashBuffer  = await crypto.subtle.digest('SHA-256', arrayBuffer);
const hashArray   = Array.from(new Uint8Array(hashBuffer));
const hashHex     = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
// hashHex is 64 chars (32 bytes) — submit this as evidence_hash
```

**R-QR-03** — QR code station data MUST include a platform-signed payload. The backend MUST verify the signature using the platform's Ed25519 keypair before accepting QR-based actions. MUST NOT trust unsigned QR data.

**R-QR-04** — MUST store the original evidence file in Supabase Storage under `evidence/{action_id}/{original_filename}`. The storage path and the on-chain hash together enable full auditability.

---

## Part 8 — Hackathon Submission Rules

**R-HCK-01** — The GitHub repository MUST be set to **Public** before submission. A private repo cannot be graded.

**R-HCK-02** — The README.md MUST contain:
1. Project description (what it does, why Stellar)
2. Live demo URL or clear instructions to run locally
3. Deployed contract IDs on Stellar Testnet (all 3)
4. Stellar Testnet Explorer links for each contract
5. How to connect Freighter wallet and test the flow
6. Architecture diagram or description
7. Tech stack list with Stellar/Soroban prominently featured
8. Team member names

**R-HCK-03** — MUST demonstrate at least ONE end-to-end on-chain transaction in the demo:
- User connects Freighter → submits action → admin verifies → tokens appear on-chain

**R-HCK-04** — All three contracts MUST be deployed to Stellar Testnet with their IDs stored in the README and in `.env.example`. MUST NOT submit with placeholder contract IDs.

**R-HCK-05** — MUST NOT copy contract code from other public repositories. The ActionRegistry and RewardManager are original to this project. The GreenToken may use SEP-41 reference implementation as a base but MUST be adapted and documented.

**R-HCK-06** — Commit messages during development MUST be clean and descriptive. The grader reads the git history. Avoid messages like "fix" or "update" — use messages like "feat: add ActionRegistry verify_action with cross-contract mint".

---

## Required File Structure for Blockchain Code

```
(project root)
├── contracts/                    ← Rust/Soroban contracts
│   ├── Cargo.toml                ← Workspace root
│   ├── green_token/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs            ← Main contract + SEP-41 interface
│   │       ├── storage_types.rs  ← DataKey enum + storage helpers
│   │       └── test.rs           ← Unit tests
│   ├── action_registry/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs            ← Contract logic
│   │       ├── types.rs          ← Action, ActionType, ActionStatus structs
│   │       └── test.rs
│   └── reward_manager/
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs
│           ├── types.rs          ← Reward, Redemption structs
│           └── test.rs
│
├── lib/stellar/                  ← TypeScript SDK layer
│   ├── config.ts                 ← Network config (SINGLE SOURCE)
│   ├── client.ts                 ← SorobanRpc + Horizon server instances
│   ├── freighter.ts              ← Freighter wallet helpers
│   ├── transactions.ts           ← Transaction building utilities
│   ├── types.ts                  ← TypeScript types mirroring Rust structs
│   └── contracts/
│       ├── green-token.ts        ← GreenToken contract client
│       ├── action-registry.ts    ← ActionRegistry contract client
│       └── reward-manager.ts     ← RewardManager contract client
│
├── pages/api/stellar/            ← Next.js API routes
│   ├── wallet/
│   │   └── fund.ts               ← Friendbot (testnet only)
│   ├── tokens/
│   │   ├── balance.ts            ← Read GTK balance
│   │   └── mint.ts               ← Admin-only direct mint (emergency)
│   ├── actions/
│   │   ├── submit.ts             ← Submit eco-action
│   │   └── verify.ts             ← Admin verify + mint
│   ├── rewards/
│   │   └── redeem.ts             ← Redeem tokens
│   └── network/
│       └── status.ts             ← Health check
│
├── hooks/                        ← React hooks
│   ├── useStellarWallet.ts       ← Wallet connection state
│   ├── useGreenToken.ts          ← Token balance + operations
│   └── useActions.ts             ← Action submission + status
│
├── components/stellar/           ← Stellar-specific UI components
│   ├── WalletConnect.tsx         ← Freighter connect button
│   ├── TokenBalance.tsx          ← GTK balance display
│   ├── TransactionStatus.tsx     ← Tx pending/success/failed
│   ├── NetworkBadge.tsx          ← TESTNET/MAINNET indicator
│   └── ActionVerifier.tsx        ← Evidence upload + hash
│
├── scripts/
│   ├── deploy.sh                 ← Deploy all 3 contracts to testnet
│   └── initialize.ts             ← Post-deploy initialization script
│
├── .env.example                  ← All required env vars documented
└── README.md                     ← Hackathon submission README
```

---

## Environment Variables Required

```bash
# .env.local — NEVER commit this file

# Stellar Network
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015

# Deployed Contract IDs (set after deployment)
NEXT_PUBLIC_GREEN_TOKEN_CONTRACT_ID=C...
NEXT_PUBLIC_ACTION_REGISTRY_CONTRACT_ID=C...
NEXT_PUBLIC_REWARD_MANAGER_CONTRACT_ID=C...

# Platform Admin Keypair (SERVER SIDE ONLY — never NEXT_PUBLIC_)
STELLAR_ADMIN_PUBLIC_KEY=G...
STELLAR_ADMIN_SECRET_KEY=S...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Dependencies to Install

```bash
# Stellar / Soroban (JavaScript)
npm install @stellar/stellar-sdk @stellar/freighter-api

# Rust toolchain (for building contracts)
rustup target add wasm32v1-none
cargo install --locked stellar-cli --features opt

# Build contracts
cd contracts && stellar contract build
```

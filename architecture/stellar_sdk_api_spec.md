# Community GreenToken — Stellar SDK & API Routes Specification

**This document specifies every function signature, parameter, return type, and behavior for the Stellar SDK layer and Next.js API routes. Write code to match this spec exactly.**

---

## lib/stellar/config.ts

**Purpose:** Single source of truth for all network constants. Every other file imports from here.

```typescript
// Exports:
STELLAR_CONFIG: {
  network: 'testnet' | 'mainnet'
  horizonUrl: string
  sorobanRpcUrl: string
  networkPassphrase: string
  contracts: {
    greenToken: string       // C... contract ID
    actionRegistry: string   // C... contract ID
    rewardManager: string    // C... contract ID
  }
}

// Helper: get Stellar Explorer base URL
getExplorerUrl(network: string): string
// Returns: 'https://stellar.expert/explorer/testnet' or '/public'

// Helper: get full tx explorer link
getTxExplorerUrl(txHash: string): string
// Returns: `${explorerBase}/tx/${txHash}`
```

---

## lib/stellar/client.ts

**Purpose:** Initializes and exports Soroban RPC and Horizon server instances. Import these wherever Stellar network calls are needed.

```typescript
// Exports:
sorobanServer: SorobanRpc.Server       // For contract calls and simulation
horizonServer: Horizon.Server          // For account queries and tx history

// Function:
getSorobanServer(): SorobanRpc.Server
getHorizonServer(): Horizon.Server

// Function: fund a testnet account via Friendbot
fundTestnetAccount(publicKey: string): Promise<{ success: boolean, txHash?: string }>
// Calls: https://friendbot.stellar.org?addr={publicKey}
// Returns: success + optional tx hash
// Throws: Error if called on mainnet
```

---

## lib/stellar/freighter.ts

**Purpose:** All Freighter wallet interactions. Import in frontend components only.

```typescript
// Types:
type WalletStatus = {
  isInstalled: boolean
  isConnected: boolean
  isAllowed: boolean
  publicKey: string | null
  network: string | null
}

// Function: Check full wallet status
checkWalletStatus(): Promise<WalletStatus>

// Function: Request wallet permission
connectWallet(): Promise<{ publicKey: string }>
// Calls: setAllowed() then getPublicKey()
// Throws: 'Freighter not installed' if extension missing

// Function: Sign a transaction XDR
signTx(xdr: string, network: string): Promise<string>
// Returns: signed XDR string
// network param must match STELLAR_CONFIG.networkPassphrase

// Function: Get shortened public key for display
shortenKey(publicKey: string): string
// Returns: 'GABC...WXYZ' (first 4 + last 4)
```

---

## lib/stellar/transactions.ts

**Purpose:** Utilities for building, simulating, submitting, and polling Stellar transactions.

```typescript
// Types:
type TxResult = {
  txHash: string
  status: 'SUCCESS' | 'FAILED'
  ledger: number
  errorMessage?: string
}

// Function: Build a Soroban contract call transaction
buildContractTx(
  sourcePublicKey: string,
  contractId: string,
  method: string,
  args: xdr.ScVal[],
  fee?: number             // default: 1_000_000 stroops
): Promise<Transaction>

// Function: Simulate a transaction (must call before submit)
simulateTx(tx: Transaction): Promise<SorobanRpc.Api.SimulateTransactionResponse>
// Returns simulation result — check for errors before submitting

// Function: Submit a signed transaction and poll for result
submitAndWait(signedXdr: string): Promise<TxResult>
// Polls every 2s with exponential backoff, up to 30s timeout

// Function: Read contract value (no transaction needed)
readContractValue(
  contractId: string,
  method: string,
  args: xdr.ScVal[]
): Promise<xdr.ScVal>
// Uses simulateTransaction in read-only mode

// Function: Parse i128 from ScVal
parseI128(scVal: xdr.ScVal): bigint

// Function: Convert GTK display amount to stroops
toStroops(amount: number): bigint
// amount × 10^7

// Function: Convert stroops to GTK display amount
fromStroops(stroops: bigint): number
// stroops / 10^7
```

---

## lib/stellar/contracts/green-token.ts

**Purpose:** Typed client for the GreenToken Soroban contract.

```typescript
// All functions return Promises

getBalance(walletAddress: string): Promise<bigint>
// Calls: GreenToken.balance(id: Address)
// Returns: raw i128 balance in stroops

getName(): Promise<string>
// Calls: GreenToken.name()

getSymbol(): Promise<string>
// Calls: GreenToken.symbol()

getDecimals(): Promise<number>
// Calls: GreenToken.decimals() → always returns 7

getTotalSupply(): Promise<bigint>
// Note: SEP-41 does not define total_supply — derive from Supabase analytics

// Admin functions (server-side only, uses STELLAR_ADMIN_SECRET_KEY):
mint(adminSecret: string, toAddress: string, amount: bigint): Promise<TxResult>
// Calls: GreenToken.mint(to, amount)

burn(adminSecret: string, fromAddress: string, amount: bigint): Promise<TxResult>
// Calls: GreenToken.burn(from, amount)

// User functions (uses user-signed XDR):
buildTransferTx(fromAddress: string, toAddress: string, amount: bigint): Promise<string>
// Returns: unsigned XDR — user must sign with Freighter
```

---

## lib/stellar/contracts/action-registry.ts

**Purpose:** Typed client for the ActionRegistry Soroban contract.

```typescript
// Types:
enum ActionType {
  Recycling = 0,
  TreePlanting = 1,
  Carpooling = 2,
  EnergySaving = 3,
  WaterSaving = 4,
  CommunityCleanup = 5,
  CompostingOrganics = 6,
  PublicTransport = 7,
  SolarEnergyUse = 8,
  BeachCleanup = 9,
}

type OnChainAction = {
  actionId:      bigint
  user:          string    // Stellar public key
  actionType:    ActionType
  description:   string
  evidenceHash:  string    // hex string of 32 bytes
  timestamp:     bigint
  status:        'Pending' | 'Verified' | 'Rejected'
  tokensAwarded: bigint
  orgId:         string
}

// Functions:
submitAction(
  adminSecret: string,       // platform signs submission
  userAddress: string,
  actionType: ActionType,
  description: string,
  evidenceHash: string,      // 64-char hex (32 bytes)
  orgId: string              // 64-char hex org identifier
): Promise<{ actionId: bigint; txHash: string }>

verifyAction(
  adminSecret: string,
  actionId: bigint,
  tokensToMint: bigint       // in stroops (i128)
): Promise<TxResult>

rejectAction(
  adminSecret: string,
  actionId: bigint,
  reason: string
): Promise<TxResult>

getAction(actionId: bigint): Promise<OnChainAction>

getUserActions(userAddress: string): Promise<bigint[]>
// Returns: array of action IDs

getPendingCount(): Promise<bigint>

getActionCount(): Promise<bigint>

getTokenReward(actionType: ActionType): Promise<bigint>
// Returns: default tokens for this action type (in stroops)
```

---

## lib/stellar/contracts/reward-manager.ts

**Purpose:** Typed client for the RewardManager Soroban contract.

```typescript
// Types:
type OnChainReward = {
  rewardId:     number
  name:         string
  description:  string
  tokenCost:    bigint      // in stroops
  totalSupply:  number | null
  redeemed:     number
  isActive:     boolean
  orgId:        string
}

type OnChainRedemption = {
  redemptionId:  bigint
  user:          string
  rewardId:      number
  tokensBurned:  bigint
  timestamp:     bigint
}

// Functions:
addReward(
  adminSecret: string,
  rewardId: number,
  name: string,
  description: string,
  tokenCost: bigint,
  totalSupply: number | null,
  orgId: string
): Promise<TxResult>

buildRedeemTx(
  userAddress: string,
  rewardId: number
): Promise<string>
// Returns: unsigned XDR — user MUST sign with Freighter
// This is the only user-signed transaction in the whole system

redeemReward(
  signedXdr: string          // already signed by user via Freighter
): Promise<{ redemptionId: bigint; txHash: string }>

getReward(rewardId: number): Promise<OnChainReward>

getAllRewards(): Promise<number[]>
// Returns: array of active reward IDs

getUserRedemptions(userAddress: string): Promise<bigint[]>
// Returns: array of redemption IDs

getRedemption(redemptionId: bigint): Promise<OnChainRedemption>

getTotalBurned(): Promise<bigint>
// Total GTK burned across all redemptions (deflationary metric)
```

---

## Next.js API Routes Specification

### GET /api/stellar/network/status

**Purpose:** Health check — confirm Stellar connection is working.  
**Auth:** None  
**Returns:**
```json
{
  "network": "testnet",
  "horizonConnected": true,
  "sorobanConnected": true,
  "latestLedger": 12345678,
  "contracts": {
    "greenToken":     "C...",
    "actionRegistry": "C...",
    "rewardManager":  "C..."
  }
}
```

---

### POST /api/stellar/wallet/fund

**Purpose:** Fund a testnet wallet using Friendbot. Only works on testnet.  
**Auth:** Requires valid JWT (prevent abuse)  
**Body:** `{ "publicKey": "G..." }`  
**Validation:**
- `publicKey` must be a valid Stellar Ed25519 public key
- `NEXT_PUBLIC_STELLAR_NETWORK` must be `testnet`

**Returns:**
```json
{ "success": true, "txHash": "abc123..." }
```
**Errors:** `400` invalid key, `403` mainnet blocked, `500` Friendbot error

---

### GET /api/stellar/tokens/balance

**Purpose:** Read GTK token balance for a wallet.  
**Auth:** Requires valid JWT  
**Query:** `?address=G...`  
**Logic:**
1. Validate Stellar public key format
2. Call `GreenToken.balance(address)` on-chain via Soroban RPC
3. Convert stroops → GTK display value
4. Also return Supabase balance for comparison

**Returns:**
```json
{
  "address":         "G...",
  "onChainBalance":  "125.0000000",
  "displayBalance":  "125",
  "supabaseBalance": 125,
  "inSync":          true
}
```

---

### POST /api/stellar/actions/submit

**Purpose:** Submit an eco-action — log in DB + call ActionRegistry on-chain.  
**Auth:** Requires valid JWT (any authenticated user)  
**Body:**
```json
{
  "actionType":    "TreePlanting",
  "description":   "Planted 3 trees in Sandton park",
  "evidenceHash":  "a3f5...c2d1",
  "orgId":         "uuid-of-org"
}
```
**Validation:**
- `evidenceHash` must be exactly 64 hex characters (32 bytes)
- `actionType` must be one of the 10 defined ActionType values
- `description` max 200 characters
- `orgId` must match the JWT's org_id

**Logic:**
1. Check `evidenceHash` is not a duplicate (Supabase + on-chain)
2. Call `ActionRegistry.submit_action(user, type, desc, hash, org)` using platform key
3. Get `action_id` back from contract
4. Save to Supabase `actions` table with `blockchain_action_id` and `tx_hash`

**Returns:**
```json
{
  "actionId":           "uuid-from-supabase",
  "blockchainActionId": "42",
  "txHash":             "abc123...",
  "explorerUrl":        "https://stellar.expert/explorer/testnet/tx/abc123...",
  "status":             "pending",
  "message":            "Action submitted. Awaiting admin verification."
}
```

---

### POST /api/stellar/actions/verify

**Purpose:** Admin verifies an action — triggers on-chain mint.  
**Auth:** JWT role must be `admin` or `owner`  
**Body:**
```json
{
  "actionId":   "uuid-from-supabase",
  "tokensToMint": 20
}
```
**Logic:**
1. Verify JWT role is `admin` or `owner` — return `403` otherwise
2. Fetch action from Supabase, get `blockchain_action_id`
3. Convert `tokensToMint` to stroops: `tokensToMint * 10^7`
4. Call `ActionRegistry.verify_action(blockchain_action_id, stroops)` using platform key
5. ActionRegistry internally mints tokens via cross-contract call
6. Update Supabase: `actions.status = 'verified'`, `actions.tokens_awarded = tokensToMint`, `actions.verified_tx_hash`
7. Update Supabase: `token_balances.balance += tokensToMint`

**Returns:**
```json
{
  "success":      true,
  "txHash":       "def456...",
  "explorerUrl":  "https://stellar.expert/explorer/testnet/tx/def456...",
  "tokensAwarded": 20,
  "userBalance":   145
}
```

---

### POST /api/stellar/rewards/redeem

**Purpose:** User redeems tokens — submits user-signed transaction.  
**Auth:** JWT required (the token holder themselves)  
**Body:**
```json
{
  "rewardId":  1,
  "signedXdr": "AAAAAgAAAA..."
}
```
**Logic:**
1. Parse the signed XDR to verify it calls `RewardManager.redeem_reward`
2. Verify the signer matches the JWT user's wallet
3. Submit signed XDR to Stellar network
4. Record redemption in Supabase: `redemption_logs` table with `tx_hash`
5. Update `token_balances.balance` in Supabase

**Returns:**
```json
{
  "success":       true,
  "redemptionId":  "uuid",
  "txHash":        "ghi789...",
  "explorerUrl":   "https://stellar.expert/explorer/testnet/tx/ghi789...",
  "tokensBurned":  50,
  "newBalance":    95
}
```
**Error cases:**
- `400` invalid signed XDR
- `400` reward not available or sold out
- `409` insufficient GTK balance
- `403` signer does not match JWT user

---

## lib/stellar/types.ts — TypeScript Types Reference

```typescript
// Mirror every Rust struct and enum as TypeScript types

export type StellarNetwork = 'testnet' | 'mainnet';

export enum ActionType {
  Recycling          = 'Recycling',
  TreePlanting       = 'TreePlanting',
  Carpooling         = 'Carpooling',
  EnergySaving       = 'EnergySaving',
  WaterSaving        = 'WaterSaving',
  CommunityCleanup   = 'CommunityCleanup',
  CompostingOrganics = 'CompostingOrganics',
  PublicTransport    = 'PublicTransport',
  SolarEnergyUse     = 'SolarEnergyUse',
  BeachCleanup       = 'BeachCleanup',
}

export type ActionStatus = 'Pending' | 'Verified' | 'Rejected';

export type TransactionStatus = 'idle' | 'submitting' | 'confirming' | 'success' | 'failed';

export interface WalletState {
  isInstalled:  boolean;
  isConnected:  boolean;
  publicKey:    string | null;
  network:      string | null;
  balance:      string | null;  // GTK display balance
}

export interface ActionSubmission {
  actionType:    ActionType;
  description:   string;
  evidenceHash:  string;        // 64-char hex
  evidenceFile?: File;          // kept locally, hash sent on-chain
}

export interface TxResult {
  txHash:        string;
  status:        'SUCCESS' | 'FAILED';
  ledger:        number;
  explorerUrl:   string;
  errorMessage?: string;
}

export const ACTION_TOKEN_REWARDS: Record<ActionType, number> = {
  [ActionType.Recycling]:          10,
  [ActionType.TreePlanting]:       20,
  [ActionType.Carpooling]:         15,
  [ActionType.EnergySaving]:       12,
  [ActionType.WaterSaving]:        10,
  [ActionType.CommunityCleanup]:   25,
  [ActionType.CompostingOrganics]: 10,
  [ActionType.PublicTransport]:     8,
  [ActionType.SolarEnergyUse]:     20,
  [ActionType.BeachCleanup]:       30,
};
```

---

## hooks/ Specification

### useStellarWallet.ts
```typescript
// Returns:
{
  wallet:         WalletState
  connect:        () => Promise<void>
  disconnect:     () => void
  isLoading:      boolean
  error:          string | null
}
```

### useGreenToken.ts
```typescript
// Returns:
{
  balance:         string | null   // display balance e.g. "125.0"
  rawBalance:      bigint | null   // stroops
  isLoading:       boolean
  refetch:         () => void
  mint:            (to: string, amount: number) => Promise<TxResult>  // admin only
  buildRedeemTx:   (rewardId: number) => Promise<string>              // returns unsigned XDR
}
```

### useActions.ts
```typescript
// Returns:
{
  submitAction:    (data: ActionSubmission) => Promise<{ actionId: string; txHash: string }>
  actions:         Action[]    // user's actions from Supabase
  isSubmitting:    boolean
  txStatus:        TransactionStatus
  lastTxHash:      string | null
  error:           string | null
}
```

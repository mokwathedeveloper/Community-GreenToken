# Community GreenToken Blockchain Implementation MD

This markdown provides a **professional developer blueprint** for implementing blockchain functionality in Community GreenToken, including smart contracts, token minting, QR/IoT verification, AI impact scoring, and real-time analytics.

---

## ⚠️ IMPORTANT — Stellar Soroban, NOT Solidity

> This project runs on **Stellar** using **Soroban (Rust)** — NOT Ethereum/Solidity.  
> Full specification: `architecture/stellar_blockchain_architecture.md`  
> Strict rules: `architecture/stellar_implementation_rules.md`

## 1. Smart Contracts (Soroban / Rust — three contracts)
- **green_token** → `contracts/green_token/src/lib.rs` : Full SEP-41 GTK token. Admin mint. 7 decimals.
- **action_registry** → `contracts/action_registry/src/lib.rs` : Immutable eco-action log + cross-contract mint.
- **reward_manager** → `contracts/reward_manager/src/lib.rs` : Reward catalog + user-signed token burn on redemption.

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

## 7. Folder Structure Suggestion
```
frontend/
├─ components/
│  ├─ QRScanner.jsx
│  ├─ IoTListener.jsx
│  ├─ ActionForm.jsx
│  ├─ SubmitButton.jsx
│  └─ ConfirmationModal.jsx
├─ pages/
│  ├─ feature.jsx
│  └─ verify-action.jsx
backend/
├─ api/
│  ├─ verifyQR.js
│  └─ verifyIoT.js
blockchain/
├─ contracts/
│  ├─ GreenToken.sol
│  ├─ ActionRegistry.sol
│  └─ RewardManagement.sol
ai/
├─ impactScoring.js
```

This MD file ensures **mandatory implementation
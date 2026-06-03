// lib/stellar/index.ts — barrel export for the Stellar SDK layer
// Spec: architecture/stellar_sdk_api_spec.md

export * from "./config";
export * from "./client";

// types.ts exports — exclude TxResult to avoid conflict with client.ts
export type {
  StellarNetwork,
  ActionStatus,
  TransactionStatus,
  WalletState,
  OnChainAction,
  OnChainReward,
} from "./types";
export { ActionType, ACTION_TOKEN_REWARDS } from "./types";

// Contract clients
export * as GreenTokenContract     from "./contracts/green-token";
export * as ActionRegistryContract from "./contracts/action-registry";
export * as RewardManagerContract  from "./contracts/reward-manager";

// Rule R-FE-02: TypeScript types mirroring Rust structs
// Spec: architecture/stellar_sdk_api_spec.md Section 14

export type StellarNetwork = "testnet" | "mainnet";

export enum ActionType {
  Recycling          = "Recycling",
  TreePlanting       = "TreePlanting",
  Carpooling         = "Carpooling",
  EnergySaving       = "EnergySaving",
  WaterSaving        = "WaterSaving",
  CommunityCleanup   = "CommunityCleanup",
  CompostingOrganics = "CompostingOrganics",
  PublicTransport    = "PublicTransport",
  SolarEnergyUse     = "SolarEnergyUse",
  BeachCleanup       = "BeachCleanup",
}

export type ActionStatus = "Pending" | "Verified" | "Rejected";

export type TransactionStatus = "idle" | "submitting" | "confirming" | "success" | "failed";

export interface WalletState {
  isInstalled:  boolean;
  isConnected:  boolean;
  publicKey:    string | null;
  network:      string | null;
  gtBalance:    string | null;     // GTK display balance
}

export interface OnChainAction {
  actionId:      bigint;
  user:          string;           // Stellar G... address
  actionType:    ActionType;
  description:   string;
  evidenceHash:  string;           // 64-char hex SHA-256
  timestamp:     bigint;
  status:        ActionStatus;
  tokensAwarded: bigint;           // in stroops (i128)
  orgId:         string;
}

export interface OnChainReward {
  rewardId:     number;
  name:         string;
  description:  string;
  tokenCost:    bigint;
  totalSupply:  number | null;
  redeemed:     number;
  isActive:     boolean;
}

export interface TxResult {
  txHash:        string;
  status:        "SUCCESS" | "FAILED";
  ledger:        number;
  explorerUrl:   string;
  errorMessage?: string;
}

/** Default GTK token rewards per action type (in display GTK, not stroops) */
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

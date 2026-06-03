// lib/stellar/index.ts — barrel export for the Stellar SDK layer
// Spec: architecture/stellar_sdk_api_spec.md

export * from "./config";
export * from "./client";
export * from "./types";

// Freighter (browser-only — imported dynamically where needed)
// export * from "./freighter";

// Contract clients
export * as GreenTokenContract    from "./contracts/green-token";
export * as ActionRegistryContract from "./contracts/action-registry";
export * as RewardManagerContract  from "./contracts/reward-manager";

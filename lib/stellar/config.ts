// Rule R-SDK-02: SINGLE SOURCE OF TRUTH for all Stellar network configuration
// Spec: architecture/stellar_sdk_api_spec.md Section 1
// Rule R-STL-05: MUST store Stellar config in .env.local (never hardcoded)

export type StellarNetwork = "testnet" | "mainnet";

function requireEnv(key: string, fallback?: string): string {
  const val = process.env[key] ?? fallback;
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const STELLAR_CONFIG = {
  network: (process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet") as StellarNetwork,

  horizonUrl:        process.env.NEXT_PUBLIC_HORIZON_URL     ?? "https://horizon-testnet.stellar.org",
  sorobanRpcUrl:     process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org",
  networkPassphrase: process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ?? "Test SDF Network ; September 2015",

  contracts: {
    greenToken:     process.env.NEXT_PUBLIC_GREEN_TOKEN_CONTRACT_ID     ?? "",
    actionRegistry: process.env.NEXT_PUBLIC_ACTION_REGISTRY_CONTRACT_ID ?? "",
    rewardManager:  process.env.NEXT_PUBLIC_REWARD_MANAGER_CONTRACT_ID  ?? "",
  },
} as const;

/** Returns the Stellar Expert explorer base URL for the current network */
export function getExplorerBase(): string {
  return STELLAR_CONFIG.network === "mainnet"
    ? "https://stellar.expert/explorer/public"
    : "https://stellar.expert/explorer/testnet";
}

/** Returns a full transaction explorer link */
export function getTxExplorerUrl(txHash: string): string {
  return `${getExplorerBase()}/tx/${txHash}`;
}

/** Returns a full contract explorer link */
export function getContractExplorerUrl(contractId: string): string {
  return `${getExplorerBase()}/contract/${contractId}`;
}

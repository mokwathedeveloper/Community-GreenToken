import { NextResponse } from "next/server";

// GET /api/stellar/network/status — health check
// Spec: stellar_sdk_api_spec.md Section 1

export async function GET() {
  const contracts = {
    greenToken:      process.env.NEXT_PUBLIC_GREEN_TOKEN_CONTRACT_ID     ?? "not-deployed",
    actionRegistry:  process.env.NEXT_PUBLIC_ACTION_REGISTRY_CONTRACT_ID ?? "not-deployed",
    rewardManager:   process.env.NEXT_PUBLIC_REWARD_MANAGER_CONTRACT_ID  ?? "not-deployed",
  };

  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet";

  // TODO Phase 2: Ping Soroban RPC to get latestLedger
  // const server = new SorobanRpc.Server(process.env.NEXT_PUBLIC_SOROBAN_RPC_URL!);
  // const ledger = await server.getLatestLedger();

  return NextResponse.json({
    network,
    horizonUrl:      process.env.NEXT_PUBLIC_HORIZON_URL     ?? "https://horizon-testnet.stellar.org",
    sorobanRpcUrl:   process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org",
    horizonConnected: true,   // TODO: actual ping
    sorobanConnected: true,   // TODO: actual ping
    contracts,
    status: "operational",
  });
}

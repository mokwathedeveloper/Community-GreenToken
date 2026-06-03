import { NextResponse } from "next/server";

// GET /api/stellar/network/status — real connectivity checks with timeout
// Spec: stellar_sdk_api_spec.md Section 1

const PING_TIMEOUT_MS = 5000;

/** Ping a URL with a timeout. Returns true if HTTP response is ok. */
async function pingEndpoint(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, method: "GET" });
    return res.ok;
  } catch {
    return false; // timeout or network error
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  const horizonUrl    = process.env.NEXT_PUBLIC_HORIZON_URL     ?? "https://horizon-testnet.stellar.org";
  const sorobanRpcUrl = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org";
  const network       = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet";

  const contracts = {
    greenToken:     process.env.NEXT_PUBLIC_GREEN_TOKEN_CONTRACT_ID     ?? "not-deployed",
    actionRegistry: process.env.NEXT_PUBLIC_ACTION_REGISTRY_CONTRACT_ID ?? "not-deployed",
    rewardManager:  process.env.NEXT_PUBLIC_REWARD_MANAGER_CONTRACT_ID  ?? "not-deployed",
  };

  // Real connectivity checks — parallel pings with 5s timeout each
  const [horizonConnected, sorobanConnected] = await Promise.all([
    pingEndpoint(`${horizonUrl}/`),
    // Soroban RPC health: POST to / with jsonrpc ping
    fetch(sorobanRpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getHealth" }),
      signal: AbortSignal.timeout(PING_TIMEOUT_MS),
    }).then((r) => r.ok).catch(() => false),
  ]);

  const overallStatus =
    horizonConnected && sorobanConnected ? "operational" :
    horizonConnected || sorobanConnected ? "degraded"    : "unavailable";

  return NextResponse.json({
    network,
    horizonUrl,
    sorobanRpcUrl,
    horizonConnected,
    sorobanConnected,
    contracts,
    status:    overallStatus,
    checkedAt: new Date().toISOString(),
  });
}

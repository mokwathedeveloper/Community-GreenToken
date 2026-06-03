import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { parseBody, fundWalletSchema } from "@/lib/validation/schemas";

// POST /api/stellar/wallet/fund
// Rule R-API-STL-05: ONLY works on testnet — blocked on mainnet

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  // Rule: blocked on mainnet
  if (process.env.NEXT_PUBLIC_STELLAR_NETWORK !== "testnet") {
    return NextResponse.json(
      { error: { code: "MAINNET_BLOCKED", message: "Friendbot is only available on testnet." } },
      { status: 403 }
    );
  }

  const parsed = await parseBody(req, fundWalletSchema);
  if ("error" in parsed) return parsed.error;
  const { publicKey } = parsed.data;

  // AbortController timeout — Friendbot can be slow; fail fast after 10s
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`,
      { signal: controller.signal }
    );
    clearTimeout(timer);

    if (!res.ok) {
      const body = await res.text().catch(() => "unknown error");
      throw new Error(`Friendbot returned ${res.status}: ${body}`);
    }

    const tx = await res.json();
    return NextResponse.json({
      data: { success: true, txHash: tx.hash ?? null, message: "Wallet funded with 10,000 XLM on testnet." },
    });
  } catch (err) {
    clearTimeout(timer);
    const isTimeout = err instanceof Error && err.name === "AbortError";
    console.error("[api/stellar/wallet/fund]", isTimeout ? "timeout" : err);
    return NextResponse.json(
      {
        error: {
          code:    isTimeout ? "FRIENDBOT_TIMEOUT" : "FRIENDBOT_ERROR",
          message: isTimeout ? "Friendbot timed out. Try again." : "Failed to fund wallet. Try again.",
        },
      },
      { status: 503 }
    );
  }
}

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

  try {
    const res = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    if (!res.ok) throw new Error(await res.text());

    const tx = await res.json();
    return NextResponse.json({
      data: { success: true, txHash: tx.hash ?? null, message: "Wallet funded with 10,000 XLM on testnet." },
    });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "FRIENDBOT_ERROR", message: "Failed to fund wallet. Try again." } },
      { status: 500 }
    );
  }
}

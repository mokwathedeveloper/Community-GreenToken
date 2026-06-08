/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getAuthContext, unauthorized } from "@/lib/middleware/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { generateWallet } from "@/lib/stellar/wallet";

// POST /api/stellar/wallet/generate
// Generates a new Stellar keypair for the authenticated user.
// Stores the public key in users.wallet_address.
// Returns { publicKey, secretKey } ONCE — the secret is never stored server-side.

export async function POST() {
  const auth = await getAuthContext();
  if (!auth) return unauthorized();

  const supabase = createAdminClient();

  try {
    const wallet = await generateWallet(auth.userId, supabase);
    return NextResponse.json({ data: wallet }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate wallet.";
    return NextResponse.json(
      { error: { code: "WALLET_ERROR", message } },
      { status: 500 }
    );
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Keypair } from "@stellar/stellar-sdk";
import { fundTestnetAccount } from "./client";

export interface GeneratedWallet {
  publicKey: string;
  secretKey: string;
}

/**
 * Generates a fresh Stellar keypair for a user.
 * Stores ONLY the public key in users.wallet_address — the secret key is
 * returned once and NEVER persisted server-side.
 * Funds the account via Friendbot on testnet (fire-and-forget).
 */
export async function generateWallet(
  userId:  string,
  supabase: any,
): Promise<GeneratedWallet> {
  const kp        = Keypair.random();
  const publicKey = kp.publicKey();
  const secretKey = kp.secret();

  await (supabase as any)
    .from("users")
    .update({ wallet_address: publicKey })
    .eq("id", userId);

  // Fund on testnet asynchronously — non-critical, never blocks the response
  fundTestnetAccount(publicKey).catch(() => {});

  return { publicKey, secretKey };
}

"use client";

// Rule R-FRQ-01 to R-FRQ-06: Freighter wallet strict rules
// Spec: architecture/stellar_sdk_api_spec.md Section 3
// Rule R-FRQ-04: MUST show "Install Freighter" if not installed

import { STELLAR_CONFIG, type StellarNetwork } from "./config";

export interface WalletStatus {
  isInstalled:  boolean;
  isConnected:  boolean;
  isAllowed:    boolean;
  publicKey:    string | null;
  network:      string | null;
}

/**
 * Check full Freighter wallet status.
 * Rule R-FRQ-01: MUST check both isConnected AND isAllowed.
 */
export async function checkWalletStatus(): Promise<WalletStatus> {
  // Freighter is a browser extension — not available in SSR
  if (typeof window === "undefined") {
    return { isInstalled: false, isConnected: false, isAllowed: false, publicKey: null, network: null };
  }

  try {
    const {
      isConnected,
      isAllowed,
      getAddress,
      getNetwork,
    } = await import("@stellar/freighter-api");

    const connected = await isConnected();
    const allowed   = await isAllowed();

    if (!connected.isConnected) {
      return { isInstalled: true, isConnected: false, isAllowed: false, publicKey: null, network: null };
    }

    const publicKey = allowed.isAllowed ? (await getAddress()).address : null;
    const network   = (await getNetwork()).network ?? null;

    return {
      isInstalled: true,
      isConnected: connected.isConnected,
      isAllowed:   allowed.isAllowed,
      publicKey,
      network,
    };
  } catch {
    // Freighter not installed
    return { isInstalled: false, isConnected: false, isAllowed: false, publicKey: null, network: null };
  }
}

/**
 * Request wallet permission and return the public key.
 * Rule R-FRQ-02: MUST call setAllowed() when user clicks Connect.
 */
export async function connectWallet(): Promise<{ publicKey: string }> {
  if (typeof window === "undefined") throw new Error("Cannot connect wallet on server.");

  const { isConnected, setAllowed, getAddress } = await import("@stellar/freighter-api");
  const connected = await isConnected();

  if (!connected.isConnected) {
    throw new Error("Freighter not installed. Please install from https://freighter.app");
  }

  await setAllowed();
  const { address } = await getAddress();
  if (!address) throw new Error("Could not get address from Freighter.");

  return { publicKey: address };
}

/**
 * Sign a transaction XDR using Freighter.
 * Rule R-FRQ-03: MUST pass network explicitly.
 * Rule R-FRQ-05: MUST NOT ask user to sign admin/mint operations.
 */
export async function signTx(xdr: string): Promise<string> {
  if (typeof window === "undefined") throw new Error("Cannot sign on server.");

  const { signTransaction } = await import("@stellar/freighter-api");
  const networkPassphrase = STELLAR_CONFIG.networkPassphrase;

  const result = await signTransaction(xdr, { networkPassphrase });
  if ("error" in result) throw new Error(result.error ?? "Freighter signing rejected.");

  return result.signedTxXdr;
}

/**
 * Returns shortened public key for UI display.
 * Rule R-FRQ-06: MUST display shortened key — GABC...WXYZ
 */
export function shortenKey(publicKey: string): string {
  if (!publicKey || publicKey.length < 8) return publicKey;
  return `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
}

/** Freighter install URL */
export const FREIGHTER_INSTALL_URL = "https://freighter.app";

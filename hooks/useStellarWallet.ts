"use client";

// Rules: R-FE-01, R-FRQ-01 to R-FRQ-06
// Spec: architecture/stellar_sdk_api_spec.md Section 15

import { useState, useEffect, useCallback } from "react";
import type { WalletState } from "@/lib/stellar/types";

const INITIAL: WalletState = {
  isInstalled:  false,
  isConnected:  false,
  publicKey:    null,
  network:      null,
  gtBalance:    null,
};

export function useStellarWallet() {
  const [wallet,    setWallet]    = useState<WalletState>(INITIAL);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  // Check wallet status on mount (browser only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    (async () => {
      try {
        const { checkWalletStatus } = await import("@/lib/stellar/freighter");
        const status = await checkWalletStatus();
        setWallet((w) => ({ ...w, ...status }));
      } catch {
        // Freighter not installed — silently set isInstalled: false
      }
    })();
  }, []);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { connectWallet } = await import("@/lib/stellar/freighter");
      const { publicKey } = await connectWallet();
      setWallet((w) => ({ ...w, isConnected: true, isAllowed: true, publicKey }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet.");
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet(INITIAL);
    setError(null);
  }, []);

  return { wallet, connect, disconnect, isLoading: loading, error };
}

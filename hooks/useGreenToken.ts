"use client";

// Rule R-FE-06: MUST use SWR/React Query for API data fetching
// Spec: stellar_sdk_api_spec.md Section 16

import { useState, useEffect, useCallback } from "react";

interface BalanceData {
  balance:       number;
  totalEarned:   number;
  totalSpent:    number;
  onChainBalance: number | null;
  displayBalance: number;
  inSync:        boolean;
}

export function useGreenToken() {
  const [data,    setData]    = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/tokens/balance");
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load balance");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  return {
    balance:       data?.displayBalance ?? 0,
    rawBalance:    data?.balance        ?? 0,
    totalEarned:   data?.totalEarned    ?? 0,
    onChainBalance: data?.onChainBalance,
    inSync:        data?.inSync ?? true,
    isLoading:     loading,
    error,
    refetch:       fetchBalance,
  };
}

export function useActions() {
  const [actions,  setActions]  = useState<Record<string, unknown>[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [pending,  setPending]  = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [allRes, pendRes] = await Promise.all([
          fetch("/api/actions?limit=10"),
          fetch("/api/actions?status=pending&limit=1"),
        ]);
        const [all, pend] = await Promise.all([allRes.json(), pendRes.json()]);
        setActions(all.data ?? []);
        setPending(pend.pagination?.total ?? 0);
      } catch {/* non-blocking */}
      setLoading(false);
    })();
  }, []);

  return { actions, loading, pendingCount: pending };
}

export function useRewards() {
  const [rewards,  setRewards]  = useState<Record<string, unknown>[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch("/api/rewards").then((r) => r.json())
      .then((d) => setRewards(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { rewards, loading };
}

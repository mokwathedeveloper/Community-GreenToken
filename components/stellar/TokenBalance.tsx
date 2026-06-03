"use client";

// Rule R-FE-STL-04: balance fetched from Supabase (speed) AND verified on-chain
// Rule R-SDK-08: display balance = raw stroops / 10^7
// Spec: TEAM_TASK_ASSIGNMENT.md Tumusando Phase 2.3

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TokenBalanceProps {
  className?: string;
  compact?:   boolean;
}

export default function TokenBalance({ className, compact = false }: TokenBalanceProps) {
  const [balance,   setBalance]   = useState<number | null>(null);
  const [onChain,   setOnChain]   = useState<number | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [inSync,    setInSync]    = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("/api/tokens/balance");
        const json = await res.json();
        setBalance(json.data?.displayBalance ?? 0);
        setOnChain(json.data?.onChainBalance ?? null);
        setInSync(json.data?.inSync ?? true);
      } catch {
        setBalance(0);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <div className="w-4 h-4 bg-primary-100 rounded-full animate-pulse" />
        <div className="w-16 h-4 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label={`GTK token balance: ${balance?.toLocaleString() ?? 0}`}
      className={cn("flex items-center gap-1.5", className)}
    >
      <span className="text-sm" aria-hidden="true">🪙</span>
      <span className={cn("font-semibold text-primary-700", compact ? "text-sm" : "text-base")}>
        {balance?.toLocaleString() ?? 0}
        {!compact && <span className="text-xs text-gray-400 ml-1">GTK</span>}
      </span>
      {!inSync && onChain !== null && (
        <span
          title={`On-chain: ${onChain.toLocaleString()} GTK`}
          className="text-xs text-amber-500 cursor-help"
          aria-label="Balance may be out of sync with blockchain"
        >
          ⚠
        </span>
      )}
    </div>
  );
}

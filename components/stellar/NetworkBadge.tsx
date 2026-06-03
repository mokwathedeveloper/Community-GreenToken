"use client";

// Rule R-FE-STL-02: MUST show network indicator on all authenticated pages
// Spec: TEAM_TASK_ASSIGNMENT.md Tumusando Phase 2.5

import { cn } from "@/lib/utils";
import { STELLAR_CONFIG } from "@/lib/stellar/config";

interface NetworkBadgeProps {
  className?: string;
}

export default function NetworkBadge({ className }: NetworkBadgeProps) {
  const isTestnet = STELLAR_CONFIG.network === "testnet";

  return (
    <span
      role="status"
      aria-label={`Connected to Stellar ${STELLAR_CONFIG.network}`}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border",
        isTestnet
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-green-50 text-green-700 border-green-200",
        className
      )}
    >
      <span
        className={cn("w-1.5 h-1.5 rounded-full", isTestnet ? "bg-amber-400" : "bg-green-500")}
        aria-hidden="true"
      />
      {isTestnet ? "TESTNET" : "MAINNET"}
    </span>
  );
}

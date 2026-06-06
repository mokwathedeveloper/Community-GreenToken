"use client";

// Rules: R-FRQ-01–06, R-A11Y-01, R-COLOR-02, R-FE-01
// Spec: TEAM_TASK_ASSIGNMENT.md Tumusando Phase 2.1
// Rule R-FRQ-04: MUST show "Install Freighter" if not installed

import { useStellarWallet } from "@/hooks/useStellarWallet";
import { shortenKey, FREIGHTER_INSTALL_URL } from "@/lib/stellar/freighter";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { MLink, MLeaf } from "@/components/icons";

interface FreighterConnectProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showAddress?: boolean;
}

export default function FreighterConnect({
  className,
  size = "md",
  showAddress = true,
}: FreighterConnectProps) {
  const { wallet, connect, disconnect, isLoading, error } = useStellarWallet();

  // Rule R-FRQ-04: Show install link if Freighter not found
  if (!wallet.isInstalled) {
    return (
      <a
        href={FREIGHTER_INSTALL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold",
          "border-2 border-amber-400 text-amber-700 rounded-xl hover:bg-amber-50 transition-colors",
          "focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none",
          className
        )}
        aria-label="Install Freighter Stellar wallet (opens in new tab)"
      >
        <MLink className="w-4 h-4" aria-hidden="true" />
        Install Freighter
        <span className="text-xs opacity-60" aria-hidden="true">↗</span>
      </a>
    );
  }

  // Connected — show address + disconnect
  if (wallet.isConnected && wallet.publicKey) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {showAddress && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 rounded-full border border-primary-100"
            title={wallet.publicKey}
          >
            <MLeaf className="w-3 h-3 text-primary-600" aria-hidden="true" />
            <span className="text-xs font-mono font-semibold text-primary-700">
              {shortenKey(wallet.publicKey)}
            </span>
          </div>
        )}
        <button
          onClick={disconnect}
          aria-label="Disconnect Freighter wallet"
          className={cn(
            "text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors",
            "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
          )}
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Not connected — show connect button
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Button
        variant="outline"
        size={size}
        loading={isLoading}
        onClick={connect}
        icon={<MLink className="w-4 h-4" aria-hidden="true" />}
        aria-label="Connect Freighter Stellar wallet"
      >
        Connect Wallet
      </Button>
      {error && (
        <p role="alert" className="text-xs text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}

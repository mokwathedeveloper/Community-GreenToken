"use client";

// Rule R-FE-STL-03: every transaction MUST show Submitting → Confirming → Success/Failed
// Rule R-FE-STL-05: MUST show Stellar Explorer link on completion
// Spec: TEAM_TASK_ASSIGNMENT.md Tumusando Phase 2.4

import Link from "next/link";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { getTxExplorerUrl } from "@/lib/stellar/config";
import type { TransactionStatus } from "@/lib/stellar/types";
import { cn } from "@/lib/utils";

interface TransactionStatusProps {
  status:      TransactionStatus;
  txHash?:     string | null;
  title?:      string;
  description?: string;
  onClose?:   () => void;
  onRetry?:   () => void;
}

const STATUS_CONFIG: Record<TransactionStatus, {
  icon: string; label: string; color: string; animate: boolean;
}> = {
  idle:        { icon: "🪙",  label: "Ready",       color: "text-gray-400",    animate: false },
  submitting:  { icon: "📡",  label: "Submitting…", color: "text-blue-500",    animate: true  },
  confirming:  { icon: "⛓️",  label: "Confirming…", color: "text-amber-500",   animate: true  },
  success:     { icon: "✅",  label: "Confirmed!",  color: "text-primary-500", animate: false },
  failed:      { icon: "❌",  label: "Failed",      color: "text-red-500",     animate: false },
};

export default function TransactionStatusModal({
  status,
  txHash,
  title,
  description,
  onClose,
  onRetry,
}: TransactionStatusProps) {
  const isOpen   = status !== "idle";
  const config   = STATUS_CONFIG[status];
  const explorerUrl = txHash ? getTxExplorerUrl(txHash) : null;

  return (
    <Modal
      open={isOpen}
      onClose={status === "success" || status === "failed" ? onClose ?? (() => {}) : () => {}}
      title={title ?? config.label}
      icon={<span className="text-3xl">{config.icon}</span>}
    >
      <div className="text-center space-y-4">
        {/* Animated indicator */}
        {config.animate && (
          <div className="flex justify-center">
            <Spinner size="xl" thick decorative />
          </div>
        )}

        <p className={cn("text-sm font-semibold", config.color)}>{config.label}</p>

        {description && (
          <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
        )}

        {/* Tx hash + Explorer link — Rule R-FE-STL-05 */}
        {txHash && (
          <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Transaction Hash</p>
            <p className="text-xs font-mono text-gray-700 truncate">
              {txHash.slice(0, 16)}…{txHash.slice(-8)}
            </p>
          </div>
        )}

        {explorerUrl && (status === "success" || status === "failed") && (
          <Link
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none rounded"
          >
            View on Stellar Expert ↗
          </Link>
        )}

        {/* Actions */}
        {status === "success" && onClose && (
          <Button variant="primary" size="md" fullWidth onClick={onClose}>Done</Button>
        )}
        {status === "failed" && (
          <div className="flex flex-col gap-2">
            {onRetry && <Button variant="primary" size="md" fullWidth onClick={onRetry}>Try Again</Button>}
            {onClose && <Button variant="ghost" size="sm" fullWidth onClick={onClose}>Cancel</Button>}
          </div>
        )}
      </div>
    </Modal>
  );
}

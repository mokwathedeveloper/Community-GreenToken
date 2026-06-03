"use client";

import Link from "next/link";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
// Note: 'View Plans' uses a styled <Link> directly since Button doesn't implement asChild pattern

// Spec: TEAM_TASK_ASSIGNMENT.md — Tumusando Phase 1.7
// Shown when usePlan() returns canAccess = false

interface UpgradeModalProps {
  feature:      string;
  requiredPlan: string | null;
  onClose:      () => void;
}

export default function UpgradeModal({ feature, requiredPlan, onClose }: UpgradeModalProps) {
  return (
    <Modal
      open
      onClose={onClose}
      title={`Upgrade to access ${feature}`}
      description={
        requiredPlan
          ? `${feature} is available on the ${requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} plan and above.`
          : `Upgrade your plan to access ${feature}.`
      }
      icon={<span aria-hidden="true">🔒</span>}
    >
      <div className="flex flex-col gap-3 mt-2">
        <Link
          href="/pricing"
          className="flex items-center justify-center w-full px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors duration-150 shadow-sm focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          View Plans
        </Link>
        <Button variant="ghost" size="md" fullWidth onClick={onClose}>
          Maybe Later
        </Button>
      </div>
    </Modal>
  );
}

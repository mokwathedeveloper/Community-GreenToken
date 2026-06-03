"use client";

import Link from "next/link";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

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
        <Button variant="primary" size="md" fullWidth asChild>
          <Link href="/pricing">View Plans</Link>
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={onClose}>
          Maybe Later
        </Button>
      </div>
    </Modal>
  );
}

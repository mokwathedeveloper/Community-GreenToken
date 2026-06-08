"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useOrg } from "@/hooks/useOrg";

// Spec: TEAM_TASK_ASSIGNMENT.md — Tumusando Phase 1.8
// Rule: TrialBanner uses role="alert" for screen readers

export default function TrialBanner() {
  const { trialEndsAt, plan } = useOrg();
  const [dismissed, setDismissed] = useState(false);
  // Capture "now" once at mount via lazy initializer — Date.now referenced as fn, not called in render
  const [now] = useState<number>(Date.now);

  // Compute daysLeft before early returns — hooks must not be conditional
  const daysLeft = useMemo(
    () => trialEndsAt
      ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - now) / (1000 * 60 * 60 * 24)))
      : 0,
    [trialEndsAt, now]
  );

  if (dismissed || !trialEndsAt || plan !== "free") return null;
  if (daysLeft <= 0) return null;

  const isUrgent = daysLeft <= 3;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-center justify-between px-6 py-2.5 text-sm font-medium ${
        isUrgent ? "bg-red-500 text-white" : "bg-amber-400 text-amber-900"
      }`}
    >
      <span>
        {isUrgent ? "⚠️" : "🎁"}{" "}
        {daysLeft === 1
          ? "Your Pro trial ends tomorrow!"
          : `${daysLeft} days left in your free Pro trial.`}{" "}
        <Link
          href="/org/admin/billing"
          className={`underline font-semibold hover:no-underline ${
            isUrgent ? "text-white" : "text-amber-900"
          }`}
        >
          Upgrade now
        </Link>
      </span>

      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss trial banner"
        className="ml-4 p-1 rounded hover:bg-black/10 transition-colors flex-shrink-0"
      >
        <XMarkIcon className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

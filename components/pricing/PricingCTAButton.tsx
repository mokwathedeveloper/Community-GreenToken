"use client";

// Spec §8: CTA buttons include plan name in accessible text
// Spec §4: Loading state during Stripe redirect
// Owner: RockieRaheem

import { cn } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";

interface PricingCTAButtonProps {
  planName:   string;
  label:      string;
  highlight:  boolean;
  loading:    boolean;
  onClick:    () => void;
}

export default function PricingCTAButton({
  planName, label, highlight, loading, onClick,
}: PricingCTAButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      aria-label={`${label} — ${planName} plan`}
      className={cn(
        "w-full py-3 rounded-xl font-semibold text-sm transition-all duration-150",
        "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:opacity-70 disabled:cursor-wait",
        highlight
          ? "bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
          : "border-2 border-primary-500 text-primary-600 hover:bg-primary-50"
      )}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner size="sm" color="current" decorative />
          Redirecting…
        </span>
      ) : label}
    </button>
  );
}

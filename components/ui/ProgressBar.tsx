"use client";

import { cn } from "@/lib/utils";

// Spec: DESIGN_SPEC.md Section 6.9
// Turns amber at 90%, red at 100% — used for donation progress and plan usage.

interface ProgressBarProps {
  value: number;
  max: number;
  colorClass?: string;
  showLabel?: boolean;
  size?: "xs" | "sm" | "md";
  className?: string;
  label?: string;
}

const HEIGHTS = { xs: "h-1", sm: "h-2", md: "h-2.5" };

export default function ProgressBar({
  value,
  max,
  colorClass = "bg-primary-500",
  showLabel = false,
  size = "sm",
  className,
  label,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const isWarning = pct >= 80 && pct < 100;
  const isFull    = pct >= 100;

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>{label ?? `${value.toLocaleString()} / ${max.toLocaleString()}`}</span>
          <span className={cn(isWarning && "text-amber-500 font-medium", isFull && "text-red-500 font-medium")}>
            {pct}%
          </span>
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className={cn("w-full bg-gray-100 rounded-full overflow-hidden", HEIGHTS[size])}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 motion-reduce:transition-none",
            isFull    ? "bg-red-500"   :
            isWarning ? "bg-amber-400" :
            colorClass
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

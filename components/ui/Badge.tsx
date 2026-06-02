"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Spec: DESIGN_SPEC.md Section 6.11
// Rule R-COLOR-03: MUST use the exact status badge color map

export type BadgeColor =
  | "green"
  | "blue"
  | "amber"
  | "red"
  | "gray"
  | "violet";

const STYLES: Record<BadgeColor, string> = {
  green:  "bg-green-100  text-green-700",
  blue:   "bg-blue-100   text-blue-700",
  amber:  "bg-amber-100  text-amber-700",
  red:    "bg-red-100    text-red-600",
  gray:   "bg-gray-100   text-gray-600",
  violet: "bg-violet-100 text-violet-700",
};

const DOT_COLORS: Record<BadgeColor, string> = {
  green:  "bg-green-500",
  blue:   "bg-blue-500",
  amber:  "bg-amber-500",
  red:    "bg-red-500",
  gray:   "bg-gray-400",
  violet: "bg-violet-500",
};

interface BadgeProps {
  color?: BadgeColor;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

export default function Badge({
  color = "gray",
  dot = false,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full",
        STYLES[color],
        className
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", DOT_COLORS[color])}
        />
      )}
      {children}
    </span>
  );
}

// Convenience exports for common statuses
export const BadgeAvailable  = (p: Omit<BadgeProps, "color">) => <Badge color="green"  dot {...p} />;
export const BadgeOngoing    = (p: Omit<BadgeProps, "color">) => <Badge color="blue"   dot {...p} />;
export const BadgeTrialing   = (p: Omit<BadgeProps, "color">) => <Badge color="amber"  {...p} />;
export const BadgePastDue    = (p: Omit<BadgeProps, "color">) => <Badge color="red"    dot {...p} />;
export const BadgeCompleted  = (p: Omit<BadgeProps, "color">) => <Badge color="gray"   {...p} />;

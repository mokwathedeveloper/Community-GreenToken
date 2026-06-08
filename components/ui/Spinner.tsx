import { cn } from "@/lib/utils";

export type SpinnerSize  = "xs" | "sm" | "md" | "lg" | "xl";
export type SpinnerColor = "primary" | "white" | "amber" | "current" | "muted";

const SIZES: Record<SpinnerSize, string> = {
  xs:  "w-3   h-3   border",
  sm:  "w-4   h-4   border-2",
  md:  "w-6   h-6   border-2",
  lg:  "w-8   h-8   border-2",
  xl:  "w-10  h-10  border-2",
};

const THICK_SIZES: Record<SpinnerSize, string> = {
  xs:  "w-3   h-3   border-2",
  sm:  "w-4   h-4   border-2",
  md:  "w-6   h-6   border-4",
  lg:  "w-8   h-8   border-4",
  xl:  "w-10  h-10  border-4",
};

const COLORS: Record<SpinnerColor, string> = {
  primary: "border-primary-200 border-t-primary-600",
  white:   "border-white/30   border-t-white",
  amber:   "border-amber-200  border-t-amber-500",
  current: "border-current/20 border-t-current",
  muted:   "border-gray-200   border-t-gray-500",
};

interface SpinnerProps {
  /** Visual size of the spinner */
  size?:       SpinnerSize;
  /** Track + fill colour scheme */
  color?:      SpinnerColor;
  /** Use thicker border (border-4 vs border-2) */
  thick?:      boolean;
  className?:  string;
  /** Accessible label — only used when decorative={false} (default) */
  label?:      string;
  /** true → aria-hidden; use when the parent element already conveys loading state */
  decorative?: boolean;
}

export default function Spinner({
  size       = "md",
  color      = "primary",
  thick      = false,
  className,
  label      = "Loading…",
  decorative = false,
}: SpinnerProps) {
  return (
    <span
      role={decorative ? undefined : "status"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
      className={cn(
        "inline-block rounded-full animate-spin flex-shrink-0",
        thick ? THICK_SIZES[size] : SIZES[size],
        COLORS[color],
        className,
      )}
    />
  );
}

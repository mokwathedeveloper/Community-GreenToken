import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/** Single shimmer block — use as the atomic skeleton primitive. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("bg-gray-100 rounded animate-pulse", className)}
    />
  );
}

interface SkeletonRowsProps {
  /** Number of skeleton rows to render */
  rows?:      number;
  /** Tailwind height class for each row, e.g. "h-12" */
  height?:    string;
  /** Tailwind border-radius class for each row, e.g. "rounded-xl" */
  rounded?:   string;
  /** Padding on the container, e.g. "p-6" or "px-5 py-4" */
  padding?:   string;
  /** Gap between rows, e.g. "space-y-3" */
  gap?:       string;
  className?: string;
}

/** N uniform rows of skeleton blocks — the most common list-loading pattern. */
export function SkeletonRows({
  rows    = 3,
  height  = "h-12",
  rounded = "rounded-xl",
  padding = "p-6",
  gap     = "space-y-3",
  className,
}: SkeletonRowsProps) {
  return (
    <div
      role="status"
      aria-label="Loading…"
      aria-busy="true"
      className={cn(gap, padding, className)}
    >
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className={cn(height, rounded)} />
      ))}
    </div>
  );
}

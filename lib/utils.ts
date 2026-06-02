import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes safely.
 * Combines clsx conditional logic with tailwind-merge conflict resolution.
 * Rule R-FE-08: MUST use cn() for all conditional className logic.
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-primary-500", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as a compact string (1,250 → "1.25K")
 */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

/**
 * Shorten a Stellar public key for display: GABC...WXYZ
 * Rule R-FRQ-06: MUST display shortened public key in UI.
 */
export function shortenStellarKey(key: string): string {
  if (!key || key.length < 8) return key;
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

/**
 * Convert GTK stroops (i128) to display amount.
 * Rule R-SDK-08: MUST convert raw i128 stroops to display value.
 * 1 GTK = 10,000,000 stroops (7 decimals)
 */
export function fromStroops(stroops: bigint | number): number {
  return Number(stroops) / 10_000_000;
}

/**
 * Convert display GTK amount to stroops.
 */
export function toStroops(amount: number): bigint {
  return BigInt(Math.round(amount * 10_000_000));
}

/**
 * Format a GTK balance for display: "1,250.0"
 */
export function formatGTK(stroops: bigint | number, decimals = 1): string {
  return fromStroops(stroops).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Validate a Stellar public key format (starts with G, 56 chars).
 * Rule R-API-STL-04: MUST validate public key before any contract call.
 */
export function isValidStellarKey(key: string): boolean {
  return typeof key === "string" && /^G[A-Z2-7]{55}$/.test(key);
}

/**
 * Get the Stellar Expert explorer URL for a transaction.
 */
export function getTxExplorerUrl(
  txHash: string,
  network: "testnet" | "mainnet" = "testnet"
): string {
  const base =
    network === "mainnet"
      ? "https://stellar.expert/explorer/public"
      : "https://stellar.expert/explorer/testnet";
  return `${base}/tx/${txHash}`;
}

/**
 * Truncate a string with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}…`;
}

/**
 * Sleep for a given number of milliseconds. Useful for polling.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

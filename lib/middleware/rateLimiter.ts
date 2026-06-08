import { NextResponse } from "next/server";

/**
 * In-memory rate limiter — no external dependencies.
 * Uses a sliding window counter per key (org_id or IP).
 *
 * For production at scale, replace with Upstash Redis (@upstash/ratelimit).
 * Rule: Per-org rate limiting prevents token farming abuse.
 */

interface Window {
  count:     number;
  windowStart: number;
}

const MAX_STORE_SIZE = 10_000; // evict oldest entries above this to cap memory
const store = new Map<string, Window>();

// Periodic cleanup: remove entries whose window has fully expired
setInterval(() => {
  const now = Date.now();
  for (const [key, win] of store.entries()) {
    if (now - win.windowStart > 300_000) store.delete(key);
  }
  // Safety cap: if still over limit after TTL cleanup, evict oldest entries first
  if (store.size > MAX_STORE_SIZE) {
    const overflow = store.size - MAX_STORE_SIZE;
    let evicted = 0;
    for (const key of store.keys()) {
      if (evicted >= overflow) break;
      store.delete(key);
      evicted++;
    }
  }
}, 300_000).unref();

interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  limit:    number;
  /** Window size in milliseconds */
  windowMs: number;
}

const PRESETS: Record<string, RateLimitConfig> = {
  // Action submissions: 10 per minute per org (prevents token farming)
  action_submit:  { limit: 10,  windowMs: 60_000  },
  // Action verify: 30 per minute per org admin
  action_verify:  { limit: 30,  windowMs: 60_000  },
  // Redemptions: 5 per minute per user
  redeem:         { limit: 5,   windowMs: 60_000  },
  // Org creation: 3 per hour per IP
  org_create:     { limit: 3,   windowMs: 3_600_000 },
  // Invites: 20 per hour per org
  invite:         { limit: 20,  windowMs: 3_600_000 },
  // General API: 100 per minute per org
  default:        { limit: 100, windowMs: 60_000  },
};

/**
 * Check rate limit for a given key.
 * Returns null if allowed, or a 429 NextResponse if limit exceeded.
 *
 * @param key       Unique key (e.g., `org:${orgId}:action_submit`)
 * @param preset    Named preset from PRESETS (default: "default")
 */
export function checkRateLimit(
  key:    string,
  preset: keyof typeof PRESETS = "default"
): NextResponse | null {
  const config = PRESETS[preset] ?? PRESETS.default;
  const now    = Date.now();

  let win = store.get(key);

  if (!win || now - win.windowStart >= config.windowMs) {
    // Start new window
    win = { count: 1, windowStart: now };
    store.set(key, win);
    return null;
  }

  win.count++;

  if (win.count > config.limit) {
    const retryAfterSec = Math.ceil((config.windowMs - (now - win.windowStart)) / 1000);
    return NextResponse.json(
      {
        error: {
          code:    "RATE_LIMITED",
          message: `Too many requests. Please wait ${retryAfterSec} seconds.`,
          retryAfter: retryAfterSec,
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After":       String(retryAfterSec),
          "X-RateLimit-Limit": String(config.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return null;
}

/**
 * Build a rate-limit key combining identifier + action.
 * Uses org_id when available (tenant scoping), falls back to IP.
 */
export function rateLimitKey(
  action: string,
  orgId?: string | null,
  ip?:   string | null
): string {
  if (orgId) return `org:${orgId}:${action}`;
  if (ip)    return `ip:${ip}:${action}`;
  return `anon:${action}`;
}

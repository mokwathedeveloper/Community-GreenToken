/** @jest-environment node */
// Tests for lib/middleware/rateLimiter.ts
// Each test uses unique keys to avoid cross-test interference with the
// module-level in-memory store.

import { checkRateLimit, rateLimitKey } from "@/lib/middleware/rateLimiter";
import { NextResponse } from "next/server";

// ── rateLimitKey ──────────────────────────────────────────────────────────────

describe("rateLimitKey", () => {
  it("returns org-scoped key when orgId is provided", () => {
    expect(rateLimitKey("action_submit", "org-1")).toBe("org:org-1:action_submit");
  });

  it("returns IP-scoped key when only ip is provided", () => {
    expect(rateLimitKey("org_create", null, "1.2.3.4")).toBe("ip:1.2.3.4:org_create");
  });

  it("prefers orgId over ip when both are present", () => {
    expect(rateLimitKey("invite", "org-2", "5.6.7.8")).toBe("org:org-2:invite");
  });

  it("returns anonymous key when neither orgId nor ip is provided", () => {
    expect(rateLimitKey("default")).toBe("anon:default");
  });

  it("returns anonymous key when both orgId and ip are null", () => {
    expect(rateLimitKey("redeem", null, null)).toBe("anon:redeem");
  });
});

// ── checkRateLimit — basic behaviour ─────────────────────────────────────────

describe("checkRateLimit — basic behaviour", () => {
  it("returns null (allowed) for the first request on a fresh key", () => {
    const result = checkRateLimit("test:fresh-key-001");
    expect(result).toBeNull();
  });

  it("returns null when requests are within the limit", () => {
    const key = "test:within-limit-002";
    // default limit is 100 — call 50 times, all should be allowed
    for (let i = 0; i < 50; i++) {
      expect(checkRateLimit(key)).toBeNull();
    }
  });

  it("returns a 429 NextResponse once the limit is exceeded", () => {
    const key = "test:exceed-limit-003";
    // redeem preset: limit = 5, windowMs = 60_000
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, "redeem"); // calls 1-5 are within limit
    }
    const result = checkRateLimit(key, "redeem"); // call 6 exceeds limit
    expect(result).toBeInstanceOf(NextResponse);
    expect(result?.status).toBe(429);
  });

  it("includes RATE_LIMITED error code in the 429 response body", async () => {
    const key = "test:error-code-004";
    for (let i = 0; i < 5; i++) checkRateLimit(key, "redeem");
    const response = checkRateLimit(key, "redeem");
    const body = await response?.json() as { error: { code: string } };
    expect(body?.error?.code).toBe("RATE_LIMITED");
  });

  it("sets Retry-After header on the 429 response", () => {
    const key = "test:retry-after-005";
    for (let i = 0; i < 5; i++) checkRateLimit(key, "redeem");
    const response = checkRateLimit(key, "redeem");
    const retryAfter = response?.headers.get("Retry-After");
    expect(retryAfter).toBeTruthy();
    expect(Number(retryAfter)).toBeGreaterThan(0);
  });

  it("sets X-RateLimit-Limit header to the preset limit", () => {
    const key = "test:limit-header-006";
    for (let i = 0; i < 5; i++) checkRateLimit(key, "redeem");
    const response = checkRateLimit(key, "redeem");
    expect(response?.headers.get("X-RateLimit-Limit")).toBe("5");
  });

  it("keeps X-RateLimit-Remaining at 0 when exceeded", () => {
    const key = "test:remaining-header-007";
    for (let i = 0; i < 5; i++) checkRateLimit(key, "redeem");
    const response = checkRateLimit(key, "redeem");
    expect(response?.headers.get("X-RateLimit-Remaining")).toBe("0");
  });
});

// ── checkRateLimit — different keys don't interfere ──────────────────────────

describe("checkRateLimit — key isolation", () => {
  it("keys for different orgs are independent", () => {
    const keyA = "test:org-A:action_submit:isolation-010";
    const keyB = "test:org-B:action_submit:isolation-011";

    // exhaust key A (limit 100 for default, but use action_submit limit=10)
    for (let i = 0; i < 10; i++) checkRateLimit(keyA, "action_submit");
    checkRateLimit(keyA, "action_submit"); // 11th — over limit

    // key B should still be fine
    expect(checkRateLimit(keyB, "action_submit")).toBeNull();
  });

  it("different presets for the same key are independent", () => {
    const key1 = "test:preset-independence-020";
    const key2 = "test:preset-independence-021";

    // exhaust key1 with redeem preset (limit 5)
    for (let i = 0; i < 5; i++) checkRateLimit(key1, "redeem");
    const limited = checkRateLimit(key1, "redeem");
    expect(limited).not.toBeNull();

    // same action on key2 starts fresh
    expect(checkRateLimit(key2, "redeem")).toBeNull();
  });
});

// ── checkRateLimit — window reset ────────────────────────────────────────────

describe("checkRateLimit — window reset with fake timers", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("resets the window after windowMs elapses and allows requests again", () => {
    const key = "test:window-reset-030";

    // Exhaust the redeem window (limit 5, windowMs 60_000)
    for (let i = 0; i < 5; i++) checkRateLimit(key, "redeem");
    expect(checkRateLimit(key, "redeem")).not.toBeNull(); // 6th → blocked

    // Advance time past the window
    jest.advanceTimersByTime(60_001);

    // First request in new window should be allowed
    expect(checkRateLimit(key, "redeem")).toBeNull();
  });
});

// ── checkRateLimit — preset coverage ─────────────────────────────────────────

describe("checkRateLimit — preset limits", () => {
  const PRESETS: Array<{ name: Parameters<typeof checkRateLimit>[1]; limit: number }> = [
    { name: "action_submit", limit: 10  },
    { name: "action_verify", limit: 30  },
    { name: "redeem",        limit: 5   },
    { name: "invite",        limit: 20  },
    { name: "default",       limit: 100 },
  ];

  it.each(PRESETS)("$name preset blocks at request $limit + 1", ({ name, limit }) => {
    const key = `test:preset-${name}-limit-${Math.random()}`;
    for (let i = 0; i < limit; i++) {
      expect(checkRateLimit(key, name)).toBeNull();
    }
    expect(checkRateLimit(key, name)).not.toBeNull();
  });
});

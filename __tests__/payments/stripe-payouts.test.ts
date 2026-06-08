/** @jest-environment node */
// Tests for lib/payments/stripe-payouts.ts — Stripe SDK is fully mocked.
// createStripePayout reads process.env at call time, so we mutate env in tests.

// ── Stripe SDK mock ───────────────────────────────────────────────────────────

const mockPayoutsCreate = jest.fn();

jest.mock("stripe", () =>
  jest.fn().mockImplementation(() => ({
    payouts: { create: mockPayoutsCreate },
  }))
);

import Stripe from "stripe";
import { createStripePayout, isStripeConfigured } from "@/lib/payments/stripe-payouts";

const MockStripe = Stripe as unknown as jest.Mock;

const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
  jest.clearAllMocks();
});

afterAll(() => {
  process.env = originalEnv;
});

// ── isStripeConfigured ────────────────────────────────────────────────────────

describe("isStripeConfigured", () => {
  it("returns true when STRIPE_SECRET_KEY is set", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc123";
    expect(isStripeConfigured()).toBe(true);
  });

  it("returns false when STRIPE_SECRET_KEY is absent", () => {
    delete process.env.STRIPE_SECRET_KEY;
    expect(isStripeConfigured()).toBe(false);
  });

  it("returns false when STRIPE_SECRET_KEY is an empty string", () => {
    process.env.STRIPE_SECRET_KEY = "";
    expect(isStripeConfigured()).toBe(false);
  });
});

// ── createStripePayout ────────────────────────────────────────────────────────

describe("createStripePayout", () => {
  const PARAMS = {
    amountUsd:    25.50,
    withdrawalId: "wd-abc-123",
    memberName:   "Alice Kariuki",
    bankAccount:  "KE00123456789",
  };

  it("throws when STRIPE_SECRET_KEY is not set", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    await expect(createStripePayout(PARAMS)).rejects.toThrow("STRIPE_SECRET_KEY is not set");
  });

  it("converts USD amount to cents for the Stripe API", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc";
    mockPayoutsCreate.mockResolvedValue({ id: "po_test_1", status: "pending" });
    await createStripePayout(PARAMS);
    expect(mockPayoutsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 2550 })
    );
  });

  it("rounds fractional cents correctly (10.005 → 1001 cents)", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc";
    mockPayoutsCreate.mockResolvedValue({ id: "po_test_2", status: "pending" });
    await createStripePayout({ ...PARAMS, amountUsd: 10.005 });
    expect(mockPayoutsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 1001 })
    );
  });

  it("sets currency to usd in the Stripe call", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc";
    mockPayoutsCreate.mockResolvedValue({ id: "po_test_3", status: "pending" });
    await createStripePayout(PARAMS);
    expect(mockPayoutsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ currency: "usd" })
    );
  });

  it("includes withdrawal_id and member_name in payout metadata", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc";
    mockPayoutsCreate.mockResolvedValue({ id: "po_test_4", status: "pending" });
    await createStripePayout(PARAMS);
    expect(mockPayoutsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          withdrawal_id: "wd-abc-123",
          member_name:   "Alice Kariuki",
        }),
      })
    );
  });

  it("returns payoutId, status, and dashboardUrl on success", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_xyz";
    mockPayoutsCreate.mockResolvedValue({ id: "po_test_5", status: "pending" });
    const result = await createStripePayout(PARAMS);
    expect(result.payoutId).toBe("po_test_5");
    expect(result.status).toBe("pending");
    expect(result.dashboardUrl).toContain("po_test_5");
  });

  it("returns a test-mode dashboardUrl for sk_test keys", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_xyz";
    mockPayoutsCreate.mockResolvedValue({ id: "po_test_6", status: "pending" });
    const result = await createStripePayout(PARAMS);
    expect(result.dashboardUrl).toContain("/test/payouts/");
  });

  it("returns a live-mode dashboardUrl for sk_live keys", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_live_prod_key";
    mockPayoutsCreate.mockResolvedValue({ id: "po_live_1", status: "paid" });
    const result = await createStripePayout(PARAMS);
    expect(result.dashboardUrl).not.toContain("/test/");
    expect(result.dashboardUrl).toContain("dashboard.stripe.com/payouts/po_live_1");
  });

  it("instantiates Stripe with the secret key and correct API version", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_version_check";
    mockPayoutsCreate.mockResolvedValue({ id: "po_vc", status: "pending" });
    await createStripePayout(PARAMS);
    expect(MockStripe).toHaveBeenCalledWith(
      "sk_test_version_check",
      expect.objectContaining({ apiVersion: "2025-02-24.acacia" })
    );
  });

  it("propagates Stripe API errors", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_err";
    mockPayoutsCreate.mockRejectedValue(new Error("Stripe: Insufficient funds in account."));
    await expect(createStripePayout(PARAMS)).rejects.toThrow("Insufficient funds");
  });

  it("includes member name in payout description", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_desc";
    mockPayoutsCreate.mockResolvedValue({ id: "po_desc", status: "pending" });
    await createStripePayout(PARAMS);
    expect(mockPayoutsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        description: expect.stringContaining("Alice Kariuki"),
      })
    );
  });

  it("includes withdrawal_id in payout description", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_desc2";
    mockPayoutsCreate.mockResolvedValue({ id: "po_desc2", status: "pending" });
    await createStripePayout(PARAMS);
    expect(mockPayoutsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        description: expect.stringContaining("wd-abc-123"),
      })
    );
  });
});

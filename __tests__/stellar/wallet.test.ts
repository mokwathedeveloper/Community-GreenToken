/* eslint-disable @typescript-eslint/no-explicit-any -- mock objects in tests intentionally bypass strict SDK types */
// Tests for lib/stellar/wallet.ts — generateWallet().
// Stellar SDK and Supabase admin client are fully mocked.

// ── Mocks ──────────────────────────────────────────────────────────────────

// Mock the Stellar client BEFORE importing the module under test
jest.mock("@/lib/stellar/client", () => ({
  fundTestnetAccount: jest.fn().mockResolvedValue(true),
}));

jest.mock("@stellar/stellar-sdk", () => ({
  Keypair: {
    random: jest.fn().mockReturnValue({
      publicKey: jest.fn().mockReturnValue("GBUJUY43L6EVCKLPRNZUPUE7RO7MTFFTRUDXURJPE2SRE4K6X6KAT6HZ"),
      secret:    jest.fn().mockReturnValue("SDOKNR6XS6S66VA2KAT6I3GRW3HHJYLJFPTYHWQAID5UYP5BRD2JJW5A"),
    }),
  },
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────

import { generateWallet } from "@/lib/stellar/wallet";
import { fundTestnetAccount } from "@/lib/stellar/client";

const mockFundTestnetAccount = fundTestnetAccount as jest.Mock;

// ── Helpers ───────────────────────────────────────────────────────────────

const USER_ID      = "550e8400-e29b-41d4-a716-446655440000";
const MOCK_PUBKEY  = "GBUJUY43L6EVCKLPRNZUPUE7RO7MTFFTRUDXURJPE2SRE4K6X6KAT6HZ";
const MOCK_SECRET  = "SDOKNR6XS6S66VA2KAT6I3GRW3HHJYLJFPTYHWQAID5UYP5BRD2JJW5A";

function makeMockSupabase(updateError?: unknown) {
  const updateMock = jest.fn().mockReturnThis();
  const eqMock     = jest.fn().mockResolvedValue({ error: updateError ?? null });
  return {
    from: jest.fn().mockReturnValue({
      update: updateMock,
      eq:     eqMock,
      // Allow chaining: .from("users").update({}).eq("id", userId)
      _update: updateMock,
    }),
    _updateMock: updateMock,
    _eqMock:     eqMock,
  } as unknown as any;
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe("generateWallet — return value", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns the generated public key", async () => {
    const supabase = makeMockSupabase();
    const result = await generateWallet(USER_ID, supabase);
    expect(result.publicKey).toBe(MOCK_PUBKEY);
  });

  it("returns the generated secret key", async () => {
    const supabase = makeMockSupabase();
    const result = await generateWallet(USER_ID, supabase);
    expect(result.secretKey).toBe(MOCK_SECRET);
  });

  it("returns an object with exactly publicKey and secretKey", async () => {
    const supabase = makeMockSupabase();
    const result = await generateWallet(USER_ID, supabase);
    expect(Object.keys(result).sort()).toEqual(["publicKey", "secretKey"].sort());
  });

  it("publicKey starts with G (Stellar account prefix)", async () => {
    const supabase = makeMockSupabase();
    const { publicKey } = await generateWallet(USER_ID, supabase);
    expect(publicKey).toMatch(/^G/);
  });

  it("secretKey starts with S (Stellar secret prefix)", async () => {
    const supabase = makeMockSupabase();
    const { secretKey } = await generateWallet(USER_ID, supabase);
    expect(secretKey).toMatch(/^S/);
  });

  it("publicKey is 56 characters (valid Stellar address length)", async () => {
    const supabase = makeMockSupabase();
    const { publicKey } = await generateWallet(USER_ID, supabase);
    expect(publicKey).toHaveLength(56);
  });

  it("secretKey is 56 characters (valid Stellar secret length)", async () => {
    const supabase = makeMockSupabase();
    const { secretKey } = await generateWallet(USER_ID, supabase);
    expect(secretKey).toHaveLength(56);
  });
});

describe("generateWallet — DB update", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls supabase.from('users')", async () => {
    const supabase = makeMockSupabase();
    await generateWallet(USER_ID, supabase);
    expect(supabase.from).toHaveBeenCalledWith("users");
  });

  it("updates wallet_address with the generated public key", async () => {
    const supabase = makeMockSupabase();
    await generateWallet(USER_ID, supabase);
    expect(supabase._updateMock).toHaveBeenCalledWith({ wallet_address: MOCK_PUBKEY });
  });

  it("scopes the update to the correct user ID", async () => {
    const supabase = makeMockSupabase();
    await generateWallet(USER_ID, supabase);
    expect(supabase._eqMock).toHaveBeenCalledWith("id", USER_ID);
  });

  it("does NOT store the secret key in the DB", async () => {
    const supabase = makeMockSupabase();
    await generateWallet(USER_ID, supabase);
    const updateArg = supabase._updateMock.mock.calls[0][0];
    expect(updateArg).not.toHaveProperty("secret_key");
    expect(updateArg).not.toHaveProperty("secretKey");
    expect(updateArg).not.toHaveProperty("secret");
    expect(updateArg).not.toHaveProperty("private_key");
  });
});

describe("generateWallet — Friendbot funding", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls fundTestnetAccount with the generated public key", async () => {
    const supabase = makeMockSupabase();
    await generateWallet(USER_ID, supabase);
    // Wait for any pending microtasks (Friendbot is fire-and-forget)
    await new Promise((r) => setTimeout(r, 0));
    expect(mockFundTestnetAccount).toHaveBeenCalledWith(MOCK_PUBKEY);
  });

  it("does NOT throw even if Friendbot fails", async () => {
    mockFundTestnetAccount.mockRejectedValueOnce(new Error("Friendbot unreachable"));
    const supabase = makeMockSupabase();
    await expect(generateWallet(USER_ID, supabase)).resolves.toBeDefined();
  });

  it("still returns the wallet even when Friendbot is slow", async () => {
    mockFundTestnetAccount.mockImplementationOnce(
      () => new Promise((r) => setTimeout(r, 5000, true))
    );
    const supabase = makeMockSupabase();
    // Should resolve immediately — Friendbot is non-blocking
    const start = Date.now();
    await generateWallet(USER_ID, supabase);
    expect(Date.now() - start).toBeLessThan(500);
  });
});

describe("generateWallet — error handling", () => {
  beforeEach(() => jest.clearAllMocks());

  it("propagates DB error when supabase update fails", async () => {
    // Simulate a DB failure by rejecting the eq() call
    const failSupabase = {
      from: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockRejectedValue(new Error("DB connection lost")),
        }),
      }),
    } as unknown as any;

    await expect(generateWallet(USER_ID, failSupabase)).rejects.toThrow("DB connection lost");
  });

  it("does not leak the secret key in error messages", async () => {
    const failSupabase = {
      from: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockRejectedValue(new Error("DB error")),
        }),
      }),
    } as unknown as any;

    try {
      await generateWallet(USER_ID, failSupabase);
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : String(err);
      expect(errMessage).not.toContain(MOCK_SECRET);
    }
  });
});

describe("generateWallet — idempotency safety", () => {
  beforeEach(() => jest.clearAllMocks());

  it("generates a fresh keypair on each call (Keypair.random called each time)", async () => {
    const { Keypair } = await import("@stellar/stellar-sdk");
    const mockRandom  = Keypair.random as jest.Mock;

    const supabase = makeMockSupabase();
    await generateWallet(USER_ID, supabase);
    await generateWallet(USER_ID, supabase);

    expect(mockRandom).toHaveBeenCalledTimes(2);
  });
});

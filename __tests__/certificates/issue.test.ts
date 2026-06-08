/** @jest-environment node */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Tests for lib/certificates/issue.ts — issueCertificate().
// All Supabase calls are mocked. No DB or network required.

import { issueCertificate } from "@/lib/certificates/issue";

// ── Helpers ──────────────────────────────────────────────────────────────────

const ACTION_ID  = "abcdef12-3456-7890-abcd-ef1234567890";
const USER_ID    = "user-uuid-0001-0000-000000000001";
const ORG_ID     = "org-uuid-0001-0000-000000000001";
const CERT_ID    = "cert-uuid-0001-0000-000000000001";
const CERT_NUM   = `GTC-${new Date().getFullYear()}-ABCDEF12`; // first 8 hex of ACTION_ID, uppercase

const MOCK_ACTION = {
  id:              ACTION_ID,
  org_id:          ORG_ID,
  user_id:         USER_ID,
  action_type:     "TreePlanting",
  tokens_awarded:  250,
  proof_hash:      "a".repeat(64),
  stellar_tx_hash: "b".repeat(64),
  users:           { display_name: "Jane Doe" },
  organizations:   { name: "EcoCity Alliance" },
};

function makeSupabase({
  existingCert = null as { id: string; cert_number: string } | null,
  actionRow    = MOCK_ACTION as typeof MOCK_ACTION | null,
  insertResult = { id: CERT_ID, cert_number: CERT_NUM } as { id: string; cert_number: string } | null,
  insertError  = null as unknown,
} = {}) {
  let callCount = 0;

  return {
    from: jest.fn().mockImplementation((table: string) => {
      callCount++;

      // First call: certificates table (idempotency check)
      if (table === "certificates" && callCount === 1) {
        return {
          select: jest.fn().mockReturnThis(),
          eq:     jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({ data: existingCert }),
        };
      }

      // Second call: actions table (fetch action data)
      if (table === "actions") {
        return {
          select: jest.fn().mockReturnThis(),
          eq:     jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: actionRow }),
        };
      }

      // Third call: certificates table (insert)
      if (table === "certificates" && callCount >= 3) {
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: insertResult, error: insertError }),
        };
      }

      return {
        select: jest.fn().mockReturnThis(),
        eq:     jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null }),
        single:      jest.fn().mockResolvedValue({ data: null }),
        insert:      jest.fn().mockReturnThis(),
      };
    }),
    _callCount: () => callCount,
  } as unknown as any;
}

// ── Idempotency tests ────────────────────────────────────────────────────────

describe("issueCertificate — idempotency", () => {
  it("returns the existing cert without a second insert if already issued", async () => {
    const existing = { id: CERT_ID, cert_number: CERT_NUM };
    const supabase  = makeSupabase({ existingCert: existing });

    const result = await issueCertificate(ACTION_ID, supabase);
    expect(result).toEqual({ id: CERT_ID, certNumber: CERT_NUM });
  });

  it("does not call actions table when cert already exists", async () => {
    const existing = { id: CERT_ID, cert_number: CERT_NUM };
    const supabase  = makeSupabase({ existingCert: existing });

    await issueCertificate(ACTION_ID, supabase);
    // from() should be called only once (idempotency check) — never for actions
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });
});

// ── Happy path tests ─────────────────────────────────────────────────────────

describe("issueCertificate — happy path", () => {
  it("returns { id, certNumber } on successful insert", async () => {
    const supabase = makeSupabase();
    const result   = await issueCertificate(ACTION_ID, supabase);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(CERT_ID);
    expect(result?.certNumber).toBe(CERT_NUM);
  });

  it("cert_number starts with GTC-", async () => {
    const supabase = makeSupabase();
    const result   = await issueCertificate(ACTION_ID, supabase);
    expect(result?.certNumber).toMatch(/^GTC-/);
  });

  it("cert_number contains the current year", async () => {
    const supabase = makeSupabase();
    const result   = await issueCertificate(ACTION_ID, supabase);
    expect(result?.certNumber).toContain(String(new Date().getFullYear()));
  });

  it("cert_number suffix is uppercase and 8 chars (derived from action UUID)", async () => {
    const supabase = makeSupabase();
    const result   = await issueCertificate(ACTION_ID, supabase);
    // GTC-YYYY-XXXXXXXX — suffix is 8 uppercase hex chars
    const suffix = result?.certNumber.split("-").slice(2).join("-");
    expect(suffix).toMatch(/^[A-F0-9]{8}$/);
  });
});

// ── Error handling tests ─────────────────────────────────────────────────────

describe("issueCertificate — error handling", () => {
  it("returns null when action row is not found", async () => {
    const supabase = makeSupabase({ actionRow: null });
    const result   = await issueCertificate(ACTION_ID, supabase);
    expect(result).toBeNull();
  });

  it("returns null when insert fails", async () => {
    const supabase = makeSupabase({
      insertResult: null,
      insertError:  new Error("DB constraint violation"),
    });
    const result = await issueCertificate(ACTION_ID, supabase);
    expect(result).toBeNull();
  });

  it("returns null when supabase throws unexpectedly", async () => {
    const badSupabase = {
      from: jest.fn().mockImplementation(() => { throw new Error("Connection refused"); }),
    } as unknown as any;

    const result = await issueCertificate(ACTION_ID, badSupabase);
    expect(result).toBeNull();
  });

  it("never throws — always resolves", async () => {
    const badSupabase = {
      from: jest.fn().mockRejectedValue(new Error("Crash")),
    } as unknown as any;

    await expect(issueCertificate(ACTION_ID, badSupabase)).resolves.toBeNull();
  });
});

// ── CO2 offset mapping ───────────────────────────────────────────────────────

describe("issueCertificate — CO2 offset values", () => {
  const ACTION_CO2_PAIRS: [string, number][] = [
    ["TreePlanting",       21.77],
    ["Recycling",          2.00],
    ["SolarEnergyUse",     15.00],
    ["CompostingOrganics", 10.00],
    ["WaterSaving",        0.50],
  ];

  it.each(ACTION_CO2_PAIRS)("action '%s' maps to %s kg CO2", async (actionType, expectedCo2) => {
    // We can't directly verify the insert payload without more intrusive mocking,
    // so we verify via the CO2_OFFSETS_KG export instead.
    const { CO2_OFFSETS_KG } = await import("@/lib/certificates/generate");
    expect(CO2_OFFSETS_KG[actionType]).toBe(expectedCo2);
  });
});

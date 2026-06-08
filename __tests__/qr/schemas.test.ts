// Zod schema validation tests for QR event creation and scanning.
import { createQrEventSchema, qrScanSchema } from "@/lib/validation/schemas";

// ── createQrEventSchema ────────────────────────────────────────────────────────

const VALID_EVENT = {
  actionType:  "Recycling",
  label:       "Park Cleanup",
  lat:         37.7749,
  lng:         -122.4194,
  radiusM:     200,
  tokensAward: 10,
  validFrom:   "2026-06-08T10:00:00.000Z",
  validUntil:  "2026-06-09T10:00:00.000Z",
} as const;

describe("createQrEventSchema — valid inputs", () => {
  it("accepts a complete valid QR event", () => {
    expect(createQrEventSchema.safeParse(VALID_EVENT).success).toBe(true);
  });

  it("accepts the optional description field", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, description: "Bring gloves" }).success).toBe(true);
  });

  it("defaults radiusM to 200 when omitted", () => {
    const { radiusM: _r, ...rest } = VALID_EVENT;
    const result = createQrEventSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.radiusM).toBe(200);
  });

  it("defaults tokensAward to 10 when omitted", () => {
    const { tokensAward: _t, ...rest } = VALID_EVENT;
    const result = createQrEventSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tokensAward).toBe(10);
  });

  it("accepts extreme (valid) lat/lng values — poles and date-line", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, lat: 90, lng: 180 }).success).toBe(true);
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, lat: -90, lng: -180 }).success).toBe(true);
  });

  it("accepts the minimum radiusM (50m)", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, radiusM: 50 }).success).toBe(true);
  });

  it("accepts the maximum radiusM (50km)", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, radiusM: 50000 }).success).toBe(true);
  });

  it("accepts all 10 action types", () => {
    const types = [
      "Recycling", "TreePlanting", "Carpooling", "EnergySaving",
      "WaterSaving", "CommunityCleanup", "CompostingOrganics",
      "PublicTransport", "SolarEnergyUse", "BeachCleanup",
    ];
    types.forEach(actionType => {
      expect(createQrEventSchema.safeParse({ ...VALID_EVENT, actionType }).success).toBe(true);
    });
  });
});

describe("createQrEventSchema — GPS mandatory", () => {
  it("rejects missing lat", () => {
    const { lat: _lat, ...rest } = VALID_EVENT;
    expect(createQrEventSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing lng", () => {
    const { lng: _lng, ...rest } = VALID_EVENT;
    expect(createQrEventSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects lat > 90", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, lat: 90.001 }).success).toBe(false);
  });

  it("rejects lat < -90", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, lat: -90.001 }).success).toBe(false);
  });

  it("rejects lng > 180", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, lng: 180.001 }).success).toBe(false);
  });

  it("rejects lng < -180", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, lng: -180.001 }).success).toBe(false);
  });

  it("rejects string lat (type coercion not applied)", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, lat: "37.7749" }).success).toBe(false);
  });

  it("rejects null lat", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, lat: null }).success).toBe(false);
  });
});

describe("createQrEventSchema — time window", () => {
  it("rejects validUntil before validFrom", () => {
    const result = createQrEventSchema.safeParse({
      ...VALID_EVENT,
      validFrom:  "2026-06-09T10:00:00.000Z",
      validUntil: "2026-06-08T10:00:00.000Z",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.validUntil).toBeDefined();
    }
  });

  it("rejects validUntil equal to validFrom", () => {
    const ts = "2026-06-08T10:00:00.000Z";
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, validFrom: ts, validUntil: ts }).success).toBe(false);
  });
});

describe("createQrEventSchema — label and description", () => {
  it("rejects label shorter than 3 characters", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, label: "AB" }).success).toBe(false);
  });

  it("rejects label longer than 100 characters", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, label: "A".repeat(101) }).success).toBe(false);
  });

  it("accepts label of exactly 3 characters", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, label: "ABC" }).success).toBe(true);
  });

  it("rejects description longer than 300 characters", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, description: "A".repeat(301) }).success).toBe(false);
  });

  it("accepts description of exactly 300 characters", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, description: "A".repeat(300) }).success).toBe(true);
  });
});

describe("createQrEventSchema — tokens and radius", () => {
  it("rejects radiusM below 50", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, radiusM: 49 }).success).toBe(false);
  });

  it("rejects radiusM above 50000", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, radiusM: 50001 }).success).toBe(false);
  });

  it("rejects tokensAward of 0", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, tokensAward: 0 }).success).toBe(false);
  });

  it("rejects tokensAward above 10000", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, tokensAward: 10001 }).success).toBe(false);
  });

  it("accepts tokensAward of 1 (minimum)", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, tokensAward: 1 }).success).toBe(true);
  });

  it("accepts tokensAward of 10000 (maximum)", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, tokensAward: 10000 }).success).toBe(true);
  });

  it("rejects unknown actionType", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, actionType: "Mining" }).success).toBe(false);
  });

  it("rejects non-integer radiusM", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, radiusM: 100.5 }).success).toBe(false);
  });

  it("rejects non-integer tokensAward", () => {
    expect(createQrEventSchema.safeParse({ ...VALID_EVENT, tokensAward: 9.99 }).success).toBe(false);
  });
});

// ── qrScanSchema ──────────────────────────────────────────────────────────────

describe("qrScanSchema", () => {
  it("accepts a body with lat and lng", () => {
    expect(qrScanSchema.safeParse({ lat: 37.7749, lng: -122.4194 }).success).toBe(true);
  });

  it("accepts an empty body (GPS_REQUIRED is enforced in the handler, not the schema)", () => {
    expect(qrScanSchema.safeParse({}).success).toBe(true);
  });

  it("accepts only lat (incomplete — handler will reject, schema allows)", () => {
    expect(qrScanSchema.safeParse({ lat: 37.7749 }).success).toBe(true);
  });

  it("rejects lat > 90", () => {
    expect(qrScanSchema.safeParse({ lat: 91, lng: 0 }).success).toBe(false);
  });

  it("rejects lat < -90", () => {
    expect(qrScanSchema.safeParse({ lat: -91, lng: 0 }).success).toBe(false);
  });

  it("rejects lng > 180", () => {
    expect(qrScanSchema.safeParse({ lat: 0, lng: 181 }).success).toBe(false);
  });

  it("rejects lng < -180", () => {
    expect(qrScanSchema.safeParse({ lat: 0, lng: -181 }).success).toBe(false);
  });

  it("rejects string lat", () => {
    expect(qrScanSchema.safeParse({ lat: "37.7749", lng: -122.4194 }).success).toBe(false);
  });

  it("rejects NaN lat", () => {
    expect(qrScanSchema.safeParse({ lat: NaN, lng: 0 }).success).toBe(false);
  });

  it("accepts the GPS boundary values", () => {
    expect(qrScanSchema.safeParse({ lat: 90, lng: 180 }).success).toBe(true);
    expect(qrScanSchema.safeParse({ lat: -90, lng: -180 }).success).toBe(true);
  });
});

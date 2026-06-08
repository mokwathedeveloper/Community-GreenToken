/** @jest-environment node */
// Tests for lib/exchange-rates.ts
// Mocks global fetch to avoid real network calls and to reset module cache between tests.

// Note: exchange-rates module has in-process cache (_usdPerKes, _cacheTime).
// We use jest.isolateModules() to get a fresh module for each cache-sensitive test.

const MOCK_RATE = 0.00780; // mocked live KES→USD rate

function makeFetchMock(rate: number | null, shouldFail = false) {
  return jest.fn().mockImplementation(() => {
    if (shouldFail) return Promise.reject(new Error("Network error"));
    return Promise.resolve({
      json: () => Promise.resolve(
        rate !== null
          ? { rates: { USD: rate } }
          : { rates: {} }  // missing USD key
      ),
    });
  });
}

// ── getExchangeRates — return shape ──────────────────────────────────────────

describe("getExchangeRates — return shape", () => {
  beforeEach(() => {
    global.fetch = makeFetchMock(MOCK_RATE);
  });

  it("returns an object with gtkToKes, gtkToUsd, and usdPerKes", async () => {
    await jest.isolateModulesAsync(async () => {
      const { getExchangeRates } = await import("@/lib/exchange-rates");
      const rates = await getExchangeRates();
      expect(rates).toHaveProperty("gtkToKes");
      expect(rates).toHaveProperty("gtkToUsd");
      expect(rates).toHaveProperty("usdPerKes");
    });
  });

  it("gtkToKes is a positive number", async () => {
    await jest.isolateModulesAsync(async () => {
      const { getExchangeRates } = await import("@/lib/exchange-rates");
      const rates = await getExchangeRates();
      expect(typeof rates.gtkToKes).toBe("number");
      expect(rates.gtkToKes).toBeGreaterThan(0);
    });
  });

  it("gtkToUsd is a positive number", async () => {
    await jest.isolateModulesAsync(async () => {
      const { getExchangeRates } = await import("@/lib/exchange-rates");
      const rates = await getExchangeRates();
      expect(typeof rates.gtkToUsd).toBe("number");
      expect(rates.gtkToUsd).toBeGreaterThan(0);
    });
  });

  it("usdPerKes matches the mocked rate", async () => {
    await jest.isolateModulesAsync(async () => {
      const { getExchangeRates } = await import("@/lib/exchange-rates");
      const rates = await getExchangeRates();
      expect(rates.usdPerKes).toBeCloseTo(MOCK_RATE, 5);
    });
  });

  it("gtkToUsd = gtkToKes * usdPerKes (derived correctly)", async () => {
    await jest.isolateModulesAsync(async () => {
      const { getExchangeRates } = await import("@/lib/exchange-rates");
      const rates = await getExchangeRates();
      const expected = parseFloat((rates.gtkToKes * rates.usdPerKes).toFixed(6));
      expect(rates.gtkToUsd).toBeCloseTo(expected, 5);
    });
  });
});

// ── Fallback behaviour ───────────────────────────────────────────────────────

describe("getExchangeRates — fallback on API failure", () => {
  it("returns a valid rate object even when fetch throws", async () => {
    global.fetch = makeFetchMock(null, /* shouldFail */ true);
    await jest.isolateModulesAsync(async () => {
      const { getExchangeRates } = await import("@/lib/exchange-rates");
      const rates = await getExchangeRates();
      expect(rates.gtkToKes).toBeGreaterThan(0);
      expect(rates.gtkToUsd).toBeGreaterThan(0);
      expect(rates.usdPerKes).toBeGreaterThan(0);
    });
  });

  it("uses the 0.00777 historical fallback rate on API failure", async () => {
    global.fetch = makeFetchMock(null, true);
    await jest.isolateModulesAsync(async () => {
      const { getExchangeRates } = await import("@/lib/exchange-rates");
      const rates = await getExchangeRates();
      expect(rates.usdPerKes).toBeCloseTo(0.00777, 4);
    });
  });

  it("falls back when API response has no USD key", async () => {
    global.fetch = makeFetchMock(null);  // rates: {} — no USD
    await jest.isolateModulesAsync(async () => {
      const { getExchangeRates } = await import("@/lib/exchange-rates");
      const rates = await getExchangeRates();
      expect(rates.usdPerKes).toBeCloseTo(0.00777, 4);
    });
  });

  it("never throws — always resolves", async () => {
    global.fetch = makeFetchMock(null, true);
    await jest.isolateModulesAsync(async () => {
      const { getExchangeRates } = await import("@/lib/exchange-rates");
      await expect(getExchangeRates()).resolves.toBeDefined();
    });
  });
});

// ── gtkToKes helper ──────────────────────────────────────────────────────────

describe("gtkToKes helper", () => {
  it("multiplies GTK by gtkToKes rate", async () => {
    global.fetch = makeFetchMock(MOCK_RATE);
    await jest.isolateModulesAsync(async () => {
      const { getExchangeRates, gtkToKes } = await import("@/lib/exchange-rates");
      const rates = await getExchangeRates();
      const result = gtkToKes(1000, rates);
      expect(result).toBeCloseTo(1000 * rates.gtkToKes, 2);
    });
  });

  it("returns a two-decimal-place number", async () => {
    global.fetch = makeFetchMock(MOCK_RATE);
    await jest.isolateModulesAsync(async () => {
      const { getExchangeRates, gtkToKes } = await import("@/lib/exchange-rates");
      const rates  = await getExchangeRates();
      const result = gtkToKes(777, rates);
      expect(result.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
    });
  });

  it("returns 0 for 0 GTK", async () => {
    global.fetch = makeFetchMock(MOCK_RATE);
    await jest.isolateModulesAsync(async () => {
      const { getExchangeRates, gtkToKes } = await import("@/lib/exchange-rates");
      const rates = await getExchangeRates();
      expect(gtkToKes(0, rates)).toBe(0);
    });
  });
});

// ── gtkToUsd helper ──────────────────────────────────────────────────────────

describe("gtkToUsd helper", () => {
  it("multiplies GTK by gtkToUsd rate", async () => {
    global.fetch = makeFetchMock(MOCK_RATE);
    await jest.isolateModulesAsync(async () => {
      const { getExchangeRates, gtkToUsd } = await import("@/lib/exchange-rates");
      const rates  = await getExchangeRates();
      const result = gtkToUsd(1000, rates);
      expect(result).toBeCloseTo(1000 * rates.gtkToUsd, 4);
    });
  });

  it("returns a number", async () => {
    global.fetch = makeFetchMock(MOCK_RATE);
    await jest.isolateModulesAsync(async () => {
      const { getExchangeRates, gtkToUsd } = await import("@/lib/exchange-rates");
      const rates = await getExchangeRates();
      expect(typeof gtkToUsd(500, rates)).toBe("number");
    });
  });
});

/** @jest-environment node */

import {
  cn,
  formatCompact,
  shortenStellarKey,
  fromStroops,
  toStroops,
  formatGTK,
  isValidStellarKey,
  getTxExplorerUrl,
  truncate,
  sleep,
} from "@/lib/utils";

describe("cn()", () => {
  it("returns empty string with no args", () => {
    expect(cn()).toBe("");
  });

  it("joins basic classes", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("omits falsy conditionals", () => {
    expect(cn("base", false && "gone", undefined, "end")).toBe("base end");
  });

  it("resolves Tailwind conflicts — later class wins", () => {
    const result = cn("px-4", "px-6");
    expect(result).toBe("px-6");
  });

  it("resolves Tailwind text-color conflict", () => {
    const result = cn("text-gray-900", "text-primary-600");
    expect(result).toBe("text-primary-600");
  });
});

describe("formatCompact()", () => {
  it("returns plain number below 1 000", () => {
    expect(formatCompact(0)).toBe("0");
    expect(formatCompact(999)).toBe("999");
  });

  it("formats thousands with K suffix", () => {
    expect(formatCompact(1_000)).toBe("1.0K");
    expect(formatCompact(1_500)).toBe("1.5K");
    expect(formatCompact(999_999)).toBe("1000.0K");
  });

  it("formats millions with M suffix", () => {
    expect(formatCompact(1_000_000)).toBe("1.0M");
    expect(formatCompact(2_500_000)).toBe("2.5M");
  });
});

describe("shortenStellarKey()", () => {
  it("returns key unchanged when too short", () => {
    expect(shortenStellarKey("GAB")).toBe("GAB");
    expect(shortenStellarKey("")).toBe("");
  });

  it("shortens a full 56-char key to first4...last4", () => {
    const key = "GABC" + "A".repeat(48) + "WXYZ";
    expect(shortenStellarKey(key)).toBe("GABC...WXYZ");
  });
});

describe("fromStroops()", () => {
  it("converts 10 000 000 stroops to 1 GTK (bigint)", () => {
    expect(fromStroops(BigInt(10_000_000))).toBe(1);
  });

  it("converts 5 000 000 stroops to 0.5 GTK (number)", () => {
    expect(fromStroops(5_000_000)).toBeCloseTo(0.5);
  });

  it("converts 0 to 0", () => {
    expect(fromStroops(BigInt(0))).toBe(0);
  });

  it("handles partial stroops correctly", () => {
    expect(fromStroops(1)).toBeCloseTo(0.0000001);
  });
});

describe("toStroops()", () => {
  it("converts 1 GTK to 10 000 000 stroops", () => {
    expect(toStroops(1)).toBe(BigInt(10_000_000));
  });

  it("converts 0.5 GTK to 5 000 000 stroops", () => {
    expect(toStroops(0.5)).toBe(BigInt(5_000_000));
  });

  it("converts 0 to BigInt(0)", () => {
    expect(toStroops(0)).toBe(BigInt(0));
  });

  it("rounds fractional stroops", () => {
    // 0.0000001 GTK = 1 stroop
    expect(toStroops(0.0000001)).toBe(BigInt(1));
  });
});

describe("formatGTK()", () => {
  it("formats 1 GTK with 1 decimal by default", () => {
    expect(formatGTK(BigInt(10_000_000))).toBe("1.0");
  });

  it("formats large amounts with locale separator", () => {
    const result = formatGTK(BigInt(10_000_000_000));
    // "1,000.0" on most locales; just verify the decimal and magnitude
    expect(result).toContain("000");
    expect(result).toMatch(/\d/);
  });

  it("respects custom decimals param", () => {
    expect(formatGTK(BigInt(10_000_000), 2)).toBe("1.00");
  });
});

describe("isValidStellarKey()", () => {
  const validKey = "G" + "A".repeat(55);

  it("accepts a valid 56-char G-prefixed key", () => {
    expect(isValidStellarKey(validKey)).toBe(true);
  });

  it("accepts keys with digits 2-7", () => {
    const keyWith2 = "G" + "2".repeat(55);
    expect(isValidStellarKey(keyWith2)).toBe(true);
  });

  it("rejects empty string", () => {
    expect(isValidStellarKey("")).toBe(false);
  });

  it("rejects keys that don't start with G", () => {
    expect(isValidStellarKey("H" + "A".repeat(55))).toBe(false);
  });

  it("rejects keys shorter than 56 chars", () => {
    expect(isValidStellarKey("G" + "A".repeat(54))).toBe(false);
  });

  it("rejects keys longer than 56 chars", () => {
    expect(isValidStellarKey("G" + "A".repeat(56))).toBe(false);
  });

  it("rejects lowercase characters", () => {
    expect(isValidStellarKey("G" + "a".repeat(55))).toBe(false);
  });

  it("rejects digits outside 2-7 range (0, 1, 8, 9)", () => {
    expect(isValidStellarKey("G" + "0".repeat(55))).toBe(false);
    expect(isValidStellarKey("G" + "8".repeat(55))).toBe(false);
  });
});

describe("getTxExplorerUrl()", () => {
  const hash = "abc123def456";

  it("returns testnet URL by default", () => {
    const url = getTxExplorerUrl(hash);
    expect(url).toContain("testnet");
    expect(url).toContain(hash);
  });

  it("returns testnet URL when explicit", () => {
    const url = getTxExplorerUrl(hash, "testnet");
    expect(url).toContain("testnet");
    expect(url).not.toContain("public");
    expect(url).toContain(hash);
  });

  it("returns mainnet URL when specified", () => {
    const url = getTxExplorerUrl(hash, "mainnet");
    expect(url).toContain("public");
    expect(url).not.toContain("testnet");
    expect(url).toContain(hash);
  });
});

describe("truncate()", () => {
  it("returns string unchanged when at or under maxLength", () => {
    expect(truncate("hello", 10)).toBe("hello");
    expect(truncate("hello", 5)).toBe("hello");
  });

  it("truncates and appends ellipsis when over limit", () => {
    const result = truncate("hello world", 5);
    expect(result).toBe("hello…");
    expect(result.length).toBe(6); // 5 chars + "…"
  });

  it("handles empty string", () => {
    expect(truncate("", 5)).toBe("");
  });
});

describe("sleep()", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("returns a Promise that resolves after the given ms", async () => {
    const p = sleep(1000);
    jest.advanceTimersByTime(1000);
    await expect(p).resolves.toBeUndefined();
  });

  it("does not resolve before the timer fires", () => {
    let resolved = false;
    sleep(500).then(() => { resolved = true; });
    jest.advanceTimersByTime(499);
    expect(resolved).toBe(false);
  });
});

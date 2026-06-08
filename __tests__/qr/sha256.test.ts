/** @jest-environment node */
// Unit tests for sha256Hex — uses Web Crypto API (TextEncoder + crypto.subtle).
// Requires Node environment: jsdom does not expose these globals.
import { sha256Hex } from "@/lib/qr/utils";
import { createHash } from "crypto";

/** Node-native SHA-256 for cross-validation */
function nodeSha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

describe("sha256Hex", () => {
  it("returns a 64-character string", async () => {
    const result = await sha256Hex("hello");
    expect(result).toHaveLength(64);
  });

  it("returns only lowercase hex characters", async () => {
    const result = await sha256Hex("hello");
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it("matches Node.js crypto for the string 'hello'", async () => {
    const result   = await sha256Hex("hello");
    const expected = nodeSha256("hello");
    expect(result).toBe(expected);
  });

  it("matches Node.js crypto for the string 'abc'", async () => {
    const result   = await sha256Hex("abc");
    const expected = nodeSha256("abc");
    expect(result).toBe(expected);
  });

  it("is deterministic — same input always produces the same hash", async () => {
    const text = "qrtoken|1.2345678|-3.4567890|2026-06-08T12:00:00.000Z";
    const h1 = await sha256Hex(text);
    const h2 = await sha256Hex(text);
    expect(h1).toBe(h2);
  });

  it("different inputs produce different hashes", async () => {
    const h1 = await sha256Hex("input-one");
    const h2 = await sha256Hex("input-two");
    expect(h1).not.toBe(h2);
  });

  it("is sensitive to a single character change", async () => {
    const h1 = await sha256Hex("exactsametext");
    const h2 = await sha256Hex("exactsameteXt");
    expect(h1).not.toBe(h2);
  });

  it("handles an empty string", async () => {
    const result   = await sha256Hex("");
    const expected = nodeSha256("");
    expect(result).toBe(expected);
    expect(result).toHaveLength(64);
  });

  it("handles UTF-8 characters", async () => {
    const result   = await sha256Hex("eco-action 🌱");
    const expected = nodeSha256("eco-action 🌱");
    expect(result).toBe(expected);
  });

  it("produces the correct QR proof hash format", async () => {
    // Validates the exact format used in the scan route:
    // SHA-256(token|lat.toFixed(7)|lng.toFixed(7)|scanTime.toISOString())
    const token    = "abc123deadbeef";
    const lat      = (37.7749).toFixed(7);
    const lng      = (-122.4194).toFixed(7);
    const scanTime = new Date("2026-06-08T12:00:00.000Z").toISOString();
    const input    = `${token}|${lat}|${lng}|${scanTime}`;

    const result   = await sha256Hex(input);
    const expected = nodeSha256(input);

    expect(result).toBe(expected);
    expect(result).toHaveLength(64);
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });
});

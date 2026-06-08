/** @jest-environment node */
// Tests for lib/exif/parser.ts
// Node 20 provides TextEncoder, crypto.subtle, and File globally.
//
// IMPORTANT: The factory has NO .default wrapper. When jest intercepts a CJS
// module for a dynamic import(), Node.js adds the .default layer automatically.
// Adding .default in the factory causes double-nesting and breaks the mock.

jest.mock("exifr", () => ({
  gps:   jest.fn(),
  parse: jest.fn(),
}));

import { buildProofHash, extractExif } from "@/lib/exif/parser";

const exifrMock = jest.requireMock("exifr") as { gps: jest.Mock; parse: jest.Mock };
const mockGps   = exifrMock.gps;
const mockParse = exifrMock.parse;

function fakeFile(name = "test.jpg"): File {
  return new File(["fake image bytes"], name, { type: "image/jpeg" });
}

// ── buildProofHash ────────────────────────────────────────────────────────────

describe("buildProofHash", () => {
  it("returns a 64-character hex string (SHA-256)", async () => {
    const hash = await buildProofHash("abc123", { lat: null, lng: null, capturedAt: null });
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic — same inputs produce the same hash", async () => {
    const exif = { lat: -1.2921, lng: 36.8219, capturedAt: new Date("2025-06-01T10:00:00Z") };
    expect(await buildProofHash("evidenceXYZ", exif)).toBe(await buildProofHash("evidenceXYZ", exif));
  });

  it("produces a different hash when evidenceHash differs", async () => {
    const exif = { lat: null, lng: null, capturedAt: null };
    expect(await buildProofHash("hash-A", exif)).not.toBe(await buildProofHash("hash-B", exif));
  });

  it("produces a different hash when lat differs", async () => {
    const h1 = await buildProofHash("same", { lat: 0.0, lng: 0.0, capturedAt: null });
    const h2 = await buildProofHash("same", { lat: 1.0, lng: 0.0, capturedAt: null });
    expect(h1).not.toBe(h2);
  });

  it("produces a different hash when lng differs", async () => {
    const h1 = await buildProofHash("same", { lat: 0.0, lng: 0.0, capturedAt: null });
    const h2 = await buildProofHash("same", { lat: 0.0, lng: 1.0, capturedAt: null });
    expect(h1).not.toBe(h2);
  });

  it("produces a different hash when capturedAt differs", async () => {
    const h1 = await buildProofHash("e", { lat: null, lng: null, capturedAt: new Date("2025-01-15T00:00:00Z") });
    const h2 = await buildProofHash("e", { lat: null, lng: null, capturedAt: new Date("2025-01-16T00:00:00Z") });
    expect(h1).not.toBe(h2);
  });

  it("uses 7 decimal places — 1e-7 difference produces different hash", async () => {
    const h1 = await buildProofHash("e", { lat: 1.0000001, lng: 0, capturedAt: null });
    const h2 = await buildProofHash("e", { lat: 1.0000002, lng: 0, capturedAt: null });
    expect(h1).not.toBe(h2);
  });

  it("encodes null coordinates identically for repeated calls", async () => {
    const h1 = await buildProofHash("x", { lat: null, lng: null, capturedAt: null });
    const h2 = await buildProofHash("x", { lat: null, lng: null, capturedAt: null });
    expect(h1).toBe(h2);
  });
});

// ── extractExif — GPS and tags present ───────────────────────────────────────

describe("extractExif — GPS and tags present", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGps.mockResolvedValue({ latitude: -1.2921, longitude: 36.8219 });
    mockParse.mockResolvedValue({
      DateTimeOriginal: new Date("2025-06-01T08:00:00.000Z"),
      Make:  "Apple",
      Model: "iPhone 15 Pro",
    });
  });

  it("returns GPS coordinates when present", async () => {
    const result = await extractExif(fakeFile());
    expect(result.lat).toBeCloseTo(-1.2921);
    expect(result.lng).toBeCloseTo(36.8219);
    expect(result.gpsPresent).toBe(true);
  });

  it("returns the device string with make + model combined", async () => {
    const result = await extractExif(fakeFile());
    expect(result.device).toBe("Apple iPhone 15 Pro");
  });

  it("does not duplicate make when model already starts with it", async () => {
    mockParse.mockResolvedValue({ Make: "Apple", Model: "Apple Watch Series 9" });
    const result = await extractExif(fakeFile());
    expect(result.device).toBe("Apple Watch Series 9");
  });

  it("returns capturedAt as a Date object", async () => {
    const result = await extractExif(fakeFile());
    expect(result.capturedAt).toBeInstanceOf(Date);
    expect(result.capturedAt?.toISOString()).toBe("2025-06-01T08:00:00.000Z");
  });

  it("sets present to true when GPS and tags are available", async () => {
    const result = await extractExif(fakeFile());
    expect(result.present).toBe(true);
  });

  it("sets ageWarning to false for a photo taken now", async () => {
    mockParse.mockResolvedValue({ DateTimeOriginal: new Date() });
    const result = await extractExif(fakeFile());
    expect(result.ageWarning).toBe(false);
  });

  it("sets ageWarning to true for a photo older than 7 days", async () => {
    const old = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    mockParse.mockResolvedValue({ DateTimeOriginal: old });
    const result = await extractExif(fakeFile());
    expect(result.ageWarning).toBe(true);
  });
});

// ── extractExif — EXIF date string parsing ────────────────────────────────────

describe("extractExif — EXIF date string parsing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGps.mockResolvedValue(null);
  });

  it("parses EXIF date string in YYYY:MM:DD HH:MM:SS format", async () => {
    mockParse.mockResolvedValue({ DateTimeOriginal: "2025:03:15 12:30:00" });
    const result = await extractExif(fakeFile());
    expect(result.capturedAt).toBeInstanceOf(Date);
    expect(result.capturedAt?.getFullYear()).toBe(2025);
    expect(result.capturedAt?.getMonth()).toBe(2); // March = index 2
    expect(result.capturedAt?.getDate()).toBe(15);
  });

  it("falls back to DateTime tag when DateTimeOriginal is absent", async () => {
    mockParse.mockResolvedValue({ DateTime: "2025:04:20 09:00:00" });
    const result = await extractExif(fakeFile());
    expect(result.capturedAt).toBeInstanceOf(Date);
    expect(result.capturedAt?.getFullYear()).toBe(2025);
  });
});

// ── extractExif — missing metadata ────────────────────────────────────────────

describe("extractExif — missing metadata", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGps.mockResolvedValue(null);
    mockParse.mockResolvedValue(null);
  });

  it("returns all nulls when no EXIF data is present", async () => {
    const result = await extractExif(fakeFile());
    expect(result.lat).toBeNull();
    expect(result.lng).toBeNull();
    expect(result.capturedAt).toBeNull();
    expect(result.device).toBeNull();
  });

  it("sets present to false when no EXIF data found", async () => {
    expect((await extractExif(fakeFile())).present).toBe(false);
  });

  it("sets gpsPresent to false when GPS is missing", async () => {
    expect((await extractExif(fakeFile())).gpsPresent).toBe(false);
  });

  it("sets ageWarning to false when capturedAt is null", async () => {
    expect((await extractExif(fakeFile())).ageWarning).toBe(false);
  });
});

// ── extractExif — device string edge cases ────────────────────────────────────

describe("extractExif — device string edge cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGps.mockResolvedValue(null);
  });

  it("uses model alone when make is absent", async () => {
    mockParse.mockResolvedValue({ Model: "Pixel 8" });
    expect((await extractExif(fakeFile())).device).toBe("Pixel 8");
  });

  it("uses make alone when model is absent", async () => {
    mockParse.mockResolvedValue({ Make: "Samsung" });
    expect((await extractExif(fakeFile())).device).toBe("Samsung");
  });

  it("returns null device when both make and model are absent", async () => {
    mockParse.mockResolvedValue({});
    expect((await extractExif(fakeFile())).device).toBeNull();
  });

  it("trims whitespace from make and model", async () => {
    mockParse.mockResolvedValue({ Make: "  Google  ", Model: "  Pixel 7a  " });
    expect((await extractExif(fakeFile())).device).toBe("Google Pixel 7a");
  });
});

// ── extractExif — error resilience ──────────────────────────────────────────

describe("extractExif — error resilience", () => {
  it("returns all-null result when exifr.parse rejects", async () => {
    jest.clearAllMocks();
    mockGps.mockResolvedValue(null);
    mockParse.mockRejectedValue(new Error("parse failed"));
    const result = await extractExif(fakeFile());
    expect(result.lat).toBeNull();
    expect(result.device).toBeNull();
    expect(result.present).toBe(false);
  });

  it("returns empty result when exifr.gps throws synchronously (outer catch)", async () => {
    jest.clearAllMocks();
    mockGps.mockImplementation(() => { throw new Error("fatal crash"); });
    mockParse.mockResolvedValue(null);
    const result = await extractExif(fakeFile());
    expect(result.present).toBe(false);
    expect(result.lat).toBeNull();
  });
});

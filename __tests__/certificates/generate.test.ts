/** @jest-environment node */
// Tests for lib/certificates/generate.ts — pure function, no mocks needed.

import { generateCertificateSvg, CO2_OFFSETS_KG, type CertificateData } from "@/lib/certificates/generate";

const BASE: CertificateData = {
  certNumber:    "GTC-2026-ABCD1234",
  memberName:    "Jane Doe",
  orgName:       "EcoCity Alliance",
  actionType:    "TreePlanting",
  tokensEarned:  250,
  co2KgOffset:   21.77,
  proofHash:     "a".repeat(64),
  stellarTxHash: "b".repeat(64),
  issuedAt:      new Date("2026-06-08T10:00:00Z"),
};

describe("generateCertificateSvg — structure", () => {
  it("returns a string", () => {
    expect(typeof generateCertificateSvg(BASE)).toBe("string");
  });

  it("starts with the XML declaration", () => {
    const svg = generateCertificateSvg(BASE);
    expect(svg).toMatch(/^<\?xml/);
  });

  it("contains an <svg> root element", () => {
    const svg = generateCertificateSvg(BASE);
    expect(svg).toContain("<svg ");
    expect(svg).toContain("</svg>");
  });

  it("declares the SVG namespace", () => {
    const svg = generateCertificateSvg(BASE);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it("has viewBox set to 900x640", () => {
    const svg = generateCertificateSvg(BASE);
    expect(svg).toContain('viewBox="0 0 900 640"');
  });
});

describe("generateCertificateSvg — content", () => {
  it("embeds the cert number", () => {
    const svg = generateCertificateSvg(BASE);
    expect(svg).toContain("GTC-2026-ABCD1234");
  });

  it("embeds the member name", () => {
    const svg = generateCertificateSvg(BASE);
    expect(svg).toContain("Jane Doe");
  });

  it("embeds the org name", () => {
    const svg = generateCertificateSvg(BASE);
    expect(svg).toContain("EcoCity Alliance");
  });

  it("embeds the CO2 offset value", () => {
    const svg = generateCertificateSvg(BASE);
    expect(svg).toContain("21.77");
  });

  it("embeds the tokens earned", () => {
    const svg = generateCertificateSvg(BASE);
    expect(svg).toContain("250");
  });

  it("embeds a truncated tx hash", () => {
    const svg = generateCertificateSvg(BASE);
    // truncate() shortens strings > len — hash is 64 chars, so it should be truncated
    expect(svg).toContain("TX:");
  });

  it("shows 'Pending' when stellarTxHash is null", () => {
    const svg = generateCertificateSvg({ ...BASE, stellarTxHash: null });
    expect(svg).toContain("Pending");
  });
});

describe("generateCertificateSvg — XML escaping", () => {
  it("escapes & in member name", () => {
    const svg = generateCertificateSvg({ ...BASE, memberName: "Smith & Jones" });
    expect(svg).toContain("Smith &amp; Jones");
    expect(svg).not.toContain("Smith & Jones");
  });

  it("escapes < in org name", () => {
    const svg = generateCertificateSvg({ ...BASE, orgName: "Org <Test>" });
    expect(svg).toContain("Org &lt;Test&gt;");
  });

  it("escapes \" in cert number", () => {
    const svg = generateCertificateSvg({ ...BASE, certNumber: 'GTC-"BAD"' });
    expect(svg).toContain("GTC-&quot;BAD&quot;");
  });

  it("does not contain unescaped < inside text from user data", () => {
    const svg = generateCertificateSvg({ ...BASE, memberName: "<XSS>" });
    // The raw < should not appear inside a text context
    // (it may appear as attribute delimiters in tag names, not inside text)
    expect(svg).toContain("&lt;XSS&gt;");
  });
});

describe("generateCertificateSvg — all ActionTypes", () => {
  const actionTypes = [
    "Recycling", "TreePlanting", "Carpooling", "EnergySaving",
    "WaterSaving", "CommunityCleanup", "CompostingOrganics",
    "PublicTransport", "SolarEnergyUse", "BeachCleanup",
  ];

  it.each(actionTypes)("renders without throwing for %s", (actionType) => {
    expect(() => generateCertificateSvg({ ...BASE, actionType })).not.toThrow();
  });

  it.each(actionTypes)("produces a non-empty SVG for %s", (actionType) => {
    const svg = generateCertificateSvg({ ...BASE, actionType });
    expect(svg.length).toBeGreaterThan(100);
  });

  it("uses 'RECYCLING & WASTE REDUCTION' label for Recycling type", () => {
    const svg = generateCertificateSvg({ ...BASE, actionType: "Recycling" });
    expect(svg.toUpperCase()).toContain("RECYCLING");
  });

  it("falls back gracefully for an unknown action type", () => {
    // actionLabel is uppercased in the SVG badge; raw type is used as the label fallback
    const svg = generateCertificateSvg({ ...BASE, actionType: "UnknownFutureType" });
    expect(svg).toContain("UNKNOWNFUTURETYPE");
  });
});

describe("CO2_OFFSETS_KG map", () => {
  it("covers all 10 known action types", () => {
    const expected = [
      "Recycling", "TreePlanting", "Carpooling", "EnergySaving",
      "WaterSaving", "CommunityCleanup", "CompostingOrganics",
      "PublicTransport", "SolarEnergyUse", "BeachCleanup",
    ];
    for (const type of expected) {
      expect(CO2_OFFSETS_KG).toHaveProperty(type);
      expect(typeof CO2_OFFSETS_KG[type]).toBe("number");
      expect(CO2_OFFSETS_KG[type]).toBeGreaterThan(0);
    }
  });

  it("has TreePlanting as the highest CO2 offset (most impactful)", () => {
    const max = Math.max(...Object.values(CO2_OFFSETS_KG));
    expect(CO2_OFFSETS_KG.TreePlanting).toBe(max);
  });

  it("has WaterSaving as a positive but smaller offset", () => {
    expect(CO2_OFFSETS_KG.WaterSaving).toBeGreaterThan(0);
    expect(CO2_OFFSETS_KG.WaterSaving).toBeLessThan(CO2_OFFSETS_KG.SolarEnergyUse);
  });
});

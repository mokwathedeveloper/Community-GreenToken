// Unit tests — pricingData.ts helpers
// Owner: RockieRaheem

import { PLANS, ENTERPRISE_PLAN, annualSavings, monthlyFromAnnual } from "@/lib/data/pricingData";

describe("pricingData", () => {
  describe("PLANS", () => {
    it("has exactly 3 plans (FREE, STARTER, PRO)", () => {
      expect(PLANS).toHaveLength(3);
      expect(PLANS.map((p) => p.id)).toEqual(["free", "starter", "pro"]);
    });

    it("FREE plan has price 0", () => {
      const free = PLANS.find((p) => p.id === "free")!;
      expect(free.price.monthly).toBe(0);
      expect(free.price.annual).toBe(0);
      expect(free.href).toBe("/org/setup");
    });

    it("PRO plan is highlighted", () => {
      const pro = PLANS.find((p) => p.id === "pro")!;
      expect(pro.highlight).toBe(true);
      expect(pro.badge).toBeDefined();
    });

    it("STARTER and PRO have priceId for Stripe", () => {
      const starter = PLANS.find((p) => p.id === "starter")!;
      const pro     = PLANS.find((p) => p.id === "pro")!;
      expect(starter.priceId).toBeDefined();
      expect(pro.priceId).toBeDefined();
    });
  });

  describe("ENTERPRISE_PLAN", () => {
    it("has null price (custom)", () => {
      expect(ENTERPRISE_PLAN.price.monthly).toBeNull();
      expect(ENTERPRISE_PLAN.price.annual).toBeNull();
    });

    it("has Contact Us CTA", () => {
      expect(ENTERPRISE_PLAN.cta).toBe("Contact Us");
    });
  });

  describe("annualSavings()", () => {
    it("calculates correct savings for PRO plan", () => {
      const pro     = PLANS.find((p) => p.id === "pro")!;
      const savings = annualSavings(pro);
      // 199 * 12 - 1990 = 2388 - 1990 = 398
      expect(savings).toBe(398);
    });

    it("returns 0 for FREE plan", () => {
      const free = PLANS.find((p) => p.id === "free")!;
      expect(annualSavings(free)).toBe(0);
    });

    it("returns 0 for ENTERPRISE (null prices)", () => {
      expect(annualSavings(ENTERPRISE_PLAN)).toBe(0);
    });
  });

  describe("monthlyFromAnnual()", () => {
    it("divides annual by 12 for PRO", () => {
      const pro = PLANS.find((p) => p.id === "pro")!;
      // 1990 / 12 = 165.83... → rounds to 166
      expect(monthlyFromAnnual(pro)).toBe(166);
    });

    it("returns 0 for FREE plan", () => {
      const free = PLANS.find((p) => p.id === "free")!;
      expect(monthlyFromAnnual(free)).toBe(0);
    });
  });
});

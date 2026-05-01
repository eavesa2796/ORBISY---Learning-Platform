import { describe, expect, it } from "vitest";
import { buildDefaultTierFormsFromSettings } from "./builder-defaults";

describe("buildDefaultTierFormsFromSettings", () => {
  it("uses settings defaults for labor, financing, warranty, permit, and tax", () => {
    const tiers = buildDefaultTierFormsFromSettings({
      defaultLaborCost: 1650,
      defaultFinancingApr: 7.25,
      defaultFinancingMonths: 96,
      defaultWarrantyGood: "8-year parts",
      defaultWarrantyBetter: "10-year parts + 1-year labor",
      defaultWarrantyBest: "12-year parts + 10-year labor",
      permitFeeDefault: 175,
      taxRatePercent: 8.5,
      companyProposalFooter: "Footer",
      proposalDisclaimer: "Disclaimer",
    });

    expect(tiers).toHaveLength(3);
    expect(tiers[0].laborCost).toBe("1650");
    expect(tiers[1].financingApr).toBe("7.25");
    expect(tiers[2].financingMonths).toBe("96");
    expect(tiers[0].warrantyLabel).toBe("8-year parts");
    expect(tiers[1].warrantyLabel).toBe("10-year parts + 1-year labor");
    expect(tiers[2].warrantyLabel).toBe("12-year parts + 10-year labor");
    expect(tiers[0].permitFee).toBe("175");
    expect(tiers[0].taxRatePercent).toBe("8.5");
  });
});

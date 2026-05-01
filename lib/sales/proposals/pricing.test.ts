import { describe, expect, it } from "vitest";
import { calculateProposalOptionPricing } from "./pricing";

describe("calculateProposalOptionPricing", () => {
  it("calculates cost-plus-margin pricing with add-ons, discounts, rebates, permit, and tax", () => {
    const result = calculateProposalOptionPricing({
      equipmentCost: 5000,
      laborCost: 1500,
      permitFee: 200,
      taxRatePercent: 8,
      pricingMode: "COST_PLUS_MARGIN",
      marginPercent: 40,
      financingApr: 8.99,
      financingMonths: 120,
      addons: [
        { type: "ADDON", amount: 500 },
        { type: "DISCOUNT", amount: 300 },
        { type: "REBATE", amount: 700 },
      ],
    });

    expect(result.totalCost).toBe(7200);
    expect(result.preDiscountPrice).toBe(10080);
    expect(result.discountsTotal).toBe(300);
    expect(result.rebatesTotal).toBe(700);
    expect(result.preTaxCustomerPrice).toBe(9080);
    expect(result.taxAmount).toBe(726.4);
    expect(result.finalCustomerPrice).toBe(9806.4);
    expect(result.grossMarginAmount).toBe(1880);
    expect(result.grossMarginPercent).toBeCloseTo(20.7, 2);
    expect(result.monthlyPaymentEstimate).not.toBeNull();
  });

  it("uses fixed sell price when pricing mode is FIXED_SELL_PRICE", () => {
    const result = calculateProposalOptionPricing({
      equipmentCost: 4200,
      laborCost: 900,
      pricingMode: "FIXED_SELL_PRICE",
      sellPrice: 8900,
      addons: [
        { type: "ADDON", amount: 200 },
        { type: "DISCOUNT", amount: 100 },
      ],
    });

    expect(result.totalCost).toBe(5300);
    expect(result.preDiscountPrice).toBe(8900);
    expect(result.finalCustomerPrice).toBe(8800);
    expect(result.grossMarginAmount).toBe(3500);
    expect(result.monthlyPaymentEstimate).toBeNull();
  });

  it("does not allow negative final customer price", () => {
    const result = calculateProposalOptionPricing({
      equipmentCost: 1000,
      laborCost: 200,
      pricingMode: "FIXED_SELL_PRICE",
      sellPrice: 500,
      addons: [
        { type: "DISCOUNT", amount: 600 },
        { type: "REBATE", amount: 100 },
      ],
    });

    expect(result.finalCustomerPrice).toBe(0);
    expect(result.grossMarginAmount).toBe(-1200);
    expect(result.grossMarginPercent).toBe(0);
  });

  it("keeps gross margin based on pre-tax revenue", () => {
    const result = calculateProposalOptionPricing({
      equipmentCost: 4000,
      laborCost: 1000,
      permitFee: 300,
      taxRatePercent: 10,
      pricingMode: "FIXED_SELL_PRICE",
      sellPrice: 8000,
      addons: [{ type: "DISCOUNT", amount: 500 }],
    });

    expect(result.preTaxCustomerPrice).toBe(7500);
    expect(result.taxAmount).toBe(750);
    expect(result.finalCustomerPrice).toBe(8250);
    expect(result.totalCost).toBe(5300);
    expect(result.grossMarginAmount).toBe(2200);
    expect(result.grossMarginPercent).toBeCloseTo(29.33, 2);
  });
});

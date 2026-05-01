import { describe, expect, it } from "vitest";
import { serializePublicProposalForPrint } from "./public-print";

describe("public proposal print serialization", () => {
  it("emphasizes selected option for accepted proposals", () => {
    const result = serializePublicProposalForPrint({
      id: "proposal_1",
      publicToken: "token_1",
      title: "HVAC Proposal",
      notes: null,
      companyProposalFooter: "Footer",
      proposalDisclaimer: "Disclaimer",
      status: "ACCEPTED",
      sentAt: "2026-05-01T10:00:00.000Z",
      viewedAt: "2026-05-01T12:00:00.000Z",
      acceptedAt: "2026-05-01T14:00:00.000Z",
      selectedOptionId: "opt_2",
      company: { name: "Acme HVAC" },
      contact: { fullName: "Taylor", email: "taylor@example.com", phone: null },
      options: [
        {
          id: "opt_1",
          tier: "GOOD",
          title: "Good",
          summary: null,
          warrantyLabel: "10-year",
          financingApr: 8.99,
          financingMonths: 120,
          monthlyPaymentEstimate: 150,
          equipmentSnapshot: {
            brand: "Carrier",
            modelNumber: "ABC",
            equipmentType: "HEAT_PUMP",
          },
          permitFee: 0,
          taxRatePercent: 0,
          taxAmount: 0,
          preTaxCustomerPrice: 8500,
          addonsTotal: 100,
          discountsTotal: 50,
          rebatesTotal: 200,
          finalCustomerPrice: 8500,
          addonLines: [],
        },
        {
          id: "opt_2",
          tier: "BETTER",
          title: "Better",
          summary: null,
          warrantyLabel: "12-year",
          financingApr: 7.99,
          financingMonths: 120,
          monthlyPaymentEstimate: 190,
          equipmentSnapshot: {
            brand: "Carrier",
            modelNumber: "DEF",
            equipmentType: "HEAT_PUMP",
          },
          permitFee: 300,
          taxRatePercent: 8,
          taxAmount: 896,
          preTaxCustomerPrice: 11200,
          addonsTotal: 200,
          discountsTotal: 75,
          rebatesTotal: 300,
          finalCustomerPrice: 11200,
          addonLines: [],
        },
      ],
    });

    expect(result.isAccepted).toBe(true);
    expect(result.sortedOptions[1].isSelected).toBe(true);
    expect(result.sortedOptions[1].equipmentLabel).toBe(
      "Carrier DEF HEAT_PUMP",
    );
    expect(
      result.sortedOptions[1].priceBreakdown.basePriceBeforeAdjustments,
    ).toBe(11075);
    expect(result.sortedOptions[1].priceBreakdown.permitFee).toBe(300);
    expect(result.sortedOptions[1].priceBreakdown.taxAmount).toBe(896);
  });

  it("keeps all options for non-accepted proposals", () => {
    const result = serializePublicProposalForPrint({
      id: "proposal_2",
      publicToken: "token_2",
      title: "HVAC Proposal",
      notes: "Seasonal promo",
      companyProposalFooter: "Footer",
      proposalDisclaimer: "Disclaimer",
      status: "VIEWED",
      sentAt: "2026-05-01T10:00:00.000Z",
      viewedAt: "2026-05-01T12:00:00.000Z",
      acceptedAt: null,
      selectedOptionId: null,
      company: { name: "Northwind Heating" },
      contact: { fullName: null, email: "owner@example.com", phone: null },
      options: [
        {
          id: "opt_3",
          tier: "BEST",
          title: "Best",
          summary: null,
          warrantyLabel: null,
          financingApr: null,
          financingMonths: null,
          monthlyPaymentEstimate: null,
          equipmentSnapshot: null,
          permitFee: 0,
          taxRatePercent: 0,
          taxAmount: 0,
          preTaxCustomerPrice: 14000,
          addonsTotal: 0,
          discountsTotal: 0,
          rebatesTotal: 0,
          finalCustomerPrice: 14000,
          addonLines: [],
        },
      ],
    });

    expect(result.isAccepted).toBe(false);
    expect(result.sortedOptions).toHaveLength(1);
    expect(result.sortedOptions[0].isSelected).toBe(false);
  });
});

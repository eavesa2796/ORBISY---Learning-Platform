import { describe, expect, it } from "vitest";
import { serializeInternalAcceptedProposalSummary } from "./accepted-summary";

describe("accepted proposal summary serialization", () => {
  it("serializes selected option breakdown and timeline for internal handoff", () => {
    const result = serializeInternalAcceptedProposalSummary(
      {
        id: "proposal_accepted_1",
        publicToken: "token_accepted_1",
        title: "Comfort Upgrade",
        notes: "Install by end of month",
        status: "ACCEPTED",
        acceptedAt: new Date("2026-05-01T14:00:00.000Z"),
        opportunity: { id: "opp_1", title: "Main Floor Replacement" },
        company: { id: "company_1", name: "Acme HVAC", slug: "acme-hvac" },
        contact: {
          id: "contact_1",
          fullName: "Jordan Homeowner",
          email: "jordan@example.com",
          phone: "555-1200",
        },
        selectedOption: {
          id: "option_1",
          tier: "BETTER",
          title: "Better Efficiency",
          summary: "Variable speed system",
          equipmentSnapshot: {
            brand: "Carrier",
            modelNumber: "25VNA4",
            equipmentType: "HEAT_PUMP",
          },
          warrantyLabel: "10-year parts + 2-year labor",
          financingApr: 7.99,
          financingMonths: 120,
          monthlyPaymentEstimate: 196.52,
          equipmentCost: 7100,
          laborCost: 1800,
          addonsTotal: 450,
          discountsTotal: 250,
          rebatesTotal: 300,
          totalCost: 9100,
          grossMarginAmount: 2500,
          grossMarginPercent: 27.5,
          finalCustomerPrice: 11600,
          addonLines: [
            { id: "line_1", type: "ADDON", label: "Smart thermostat", amount: 250 },
            { id: "line_2", type: "DISCOUNT", label: "Spring promo", amount: 250 },
          ],
        },
        events: [
          {
            id: "evt_1",
            eventType: "SENT",
            occurredAt: new Date("2026-04-28T10:00:00.000Z"),
            metadata: { source: "internal" },
          },
          {
            id: "evt_2",
            eventType: "ACCEPTED",
            occurredAt: new Date("2026-05-01T14:00:00.000Z"),
            metadata: { optionId: "option_1" },
          },
        ],
      },
      "https://orbisy.example.com",
    );

    expect(result.publicUrl).toBe("https://orbisy.example.com/proposal/token_accepted_1");
    expect(result.selectedOption?.tier).toBe("BETTER");
    expect(result.selectedOption?.equipmentLabel).toBe("Carrier 25VNA4 HEAT_PUMP");
    expect(result.selectedOption?.finalCustomerPrice).toBe(11600);
    expect(result.selectedOption?.monthlyPaymentEstimate).toBe(196.52);
    expect(result.timeline).toHaveLength(2);
    expect(result.timeline[1].eventType).toBe("ACCEPTED");
  });

  it("returns null selected option summary when no selected option exists", () => {
    const result = serializeInternalAcceptedProposalSummary(
      {
        id: "proposal_accepted_2",
        publicToken: "token_accepted_2",
        title: "Comfort Upgrade",
        notes: null,
        status: "ACCEPTED",
        acceptedAt: new Date("2026-05-01T14:00:00.000Z"),
        opportunity: { id: "opp_2", title: "Basement Replacement" },
        company: { id: "company_2", name: "Northwind Heating", slug: "northwind-heating" },
        contact: null,
        selectedOption: null,
        events: [],
      },
      "https://orbisy.example.com",
    );

    expect(result.selectedOption).toBeNull();
    expect(result.timeline).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import {
  buildInternalPublicProposalUrl,
  serializeInternalProposal,
} from "./internal-list";

const NOW = new Date("2026-05-01T16:00:00.000Z");

function buildBaseProposal(
  partial: Partial<Parameters<typeof serializeInternalProposal>[0]> = {},
): Parameters<typeof serializeInternalProposal>[0] {
  return {
    id: "proposal_base",
    opportunityId: "opp_base",
    publicToken: "token_base",
    title: "Replacement Proposal",
    status: "SENT",
    createdAt: new Date("2026-05-01T10:00:00.000Z"),
    sentAt: new Date("2026-04-25T11:00:00.000Z"),
    viewedAt: null,
    acceptedAt: null,
    declinedAt: null,
    opportunity: { id: "opp_base", title: "HVAC Upgrade" },
    company: { id: "company_base", name: "Acme HVAC", slug: "acme-hvac" },
    contact: null,
    selectedOption: null,
    events: [],
    options: [],
    ...partial,
  };
}

describe("internal proposal list serialization", () => {
  it("includes history status fields and public link", () => {
    const result = serializeInternalProposal(
      buildBaseProposal({
        id: "proposal_1",
        opportunityId: "opp_1",
        publicToken: "token_1",
        status: "ACCEPTED",
        sentAt: new Date("2026-05-01T11:00:00.000Z"),
        viewedAt: new Date("2026-05-01T12:00:00.000Z"),
        acceptedAt: new Date("2026-05-01T13:00:00.000Z"),
        opportunity: { id: "opp_1", title: "4-ton Heat Pump Replacement" },
        company: { id: "company_1", name: "Acme HVAC", slug: "acme-hvac" },
        contact: { id: "contact_1", fullName: "Taylor Homeowner", email: "taylor@example.com" },
        selectedOption: { id: "option_2", tier: "BETTER", title: "Better Option" },
        events: [
          {
            eventType: "EMAIL_SENT",
            occurredAt: new Date("2026-05-01T14:00:00.000Z"),
          },
          {
            eventType: "FOLLOW_UP_SENT",
            occurredAt: new Date("2026-05-01T15:00:00.000Z"),
          },
        ],
        options: [
          {
            id: "option_2",
            tier: "BETTER",
            title: "Better Option",
            finalCustomerPrice: 12850,
            grossMarginPercent: 32.5,
          },
        ],
      }),
      "https://orbisy.example.com",
      { now: NOW, followUpDays: 2 },
    );

    expect(result.status).toBe("ACCEPTED");
    expect(result.sentAt?.toISOString()).toBe("2026-05-01T11:00:00.000Z");
    expect(result.viewedAt?.toISOString()).toBe("2026-05-01T12:00:00.000Z");
    expect(result.acceptedAt?.toISOString()).toBe("2026-05-01T13:00:00.000Z");
    expect(result.selectedOption?.tier).toBe("BETTER");
    expect(result.lastEmailEventType).toBe("FOLLOW_UP_SENT");
    expect(result.lastEmailSentAt?.toISOString()).toBe("2026-05-01T15:00:00.000Z");
    expect(result.emailSendCount).toBe(2);
    expect(result.needsFollowUp).toBe(false);
    expect(result.publicUrl).toBe(
      buildInternalPublicProposalUrl("https://orbisy.example.com", "token_1"),
    );
  });

  it("SENT proposal with no email after threshold needs follow-up", () => {
    const result = serializeInternalProposal(
      buildBaseProposal({
        id: "proposal_2",
        opportunityId: "opp_2",
        publicToken: "token_2",
        sentAt: new Date("2026-04-28T08:00:00.000Z"),
        opportunity: { id: "opp_2", title: "Dual Fuel Upgrade" },
        company: { id: "company_2", name: "Northwind Heating", slug: "northwind-heating" },
      }),
      "https://orbisy.example.com",
      { now: NOW, followUpDays: 2 },
    );

    expect(result.needsFollowUp).toBe(true);
    expect(result.followUpReason).toBe("Proposal sent but no email has been sent yet.");
    expect(result.daysSinceLastTouch).toBe(3);
  });

  it("VIEWED proposal with old initial email needs follow-up", () => {
    const result = serializeInternalProposal(
      buildBaseProposal({
        id: "proposal_3",
        status: "VIEWED",
        viewedAt: new Date("2026-04-30T10:00:00.000Z"),
        events: [
          {
            eventType: "EMAIL_SENT",
            occurredAt: new Date("2026-04-28T08:00:00.000Z"),
          },
        ],
      }),
      "https://orbisy.example.com",
      { now: NOW, followUpDays: 2 },
    );

    expect(result.needsFollowUp).toBe(true);
    expect(result.followUpReason).toBe("Last proposal email is older than follow-up threshold.");
    expect(result.daysSinceLastTouch).toBe(3);
  });

  it("recently emailed proposal does not need follow-up", () => {
    const result = serializeInternalProposal(
      buildBaseProposal({
        id: "proposal_4",
        status: "SENT",
        events: [
          {
            eventType: "EMAIL_SENT",
            occurredAt: new Date("2026-04-30T18:00:00.000Z"),
          },
        ],
      }),
      "https://orbisy.example.com",
      { now: NOW, followUpDays: 2 },
    );

    expect(result.needsFollowUp).toBe(false);
    expect(result.followUpReason).toBeNull();
    expect(result.daysSinceLastTouch).toBe(0);
  });

  it("ACCEPTED and DECLINED proposals never need follow-up", () => {
    const accepted = serializeInternalProposal(
      buildBaseProposal({ status: "ACCEPTED", acceptedAt: new Date("2026-04-29T10:00:00.000Z") }),
      "https://orbisy.example.com",
      { now: NOW, followUpDays: 2 },
    );
    const declined = serializeInternalProposal(
      buildBaseProposal({ status: "DECLINED", declinedAt: new Date("2026-04-29T10:00:00.000Z") }),
      "https://orbisy.example.com",
      { now: NOW, followUpDays: 2 },
    );

    expect(accepted.needsFollowUp).toBe(false);
    expect(accepted.daysSinceLastTouch).toBeNull();
    expect(declined.needsFollowUp).toBe(false);
    expect(declined.daysSinceLastTouch).toBeNull();
  });
});
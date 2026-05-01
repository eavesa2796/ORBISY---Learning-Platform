import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  sendEmailMock,
  requireInternalUserMock,
  authErrorToHttpMock,
  salesProposalFindUniqueMock,
  outreachUnsubscribeFindUniqueMock,
  salesProposalEventFindFirstMock,
  salesProposalEventCreateMock,
} = vi.hoisted(() => ({
  sendEmailMock: vi.fn(),
  requireInternalUserMock: vi.fn(),
  authErrorToHttpMock: vi.fn(),
  salesProposalFindUniqueMock: vi.fn(),
  outreachUnsubscribeFindUniqueMock: vi.fn(),
  salesProposalEventFindFirstMock: vi.fn(),
  salesProposalEventCreateMock: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: sendEmailMock,
    },
  })),
}));

vi.mock("@/lib/session", () => ({
  requireInternalUser: requireInternalUserMock,
  authErrorToHttp: authErrorToHttpMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    salesProposal: {
      findUnique: salesProposalFindUniqueMock,
    },
    outreachUnsubscribe: {
      findUnique: outreachUnsubscribeFindUniqueMock,
    },
    salesProposalEvent: {
      findFirst: salesProposalEventFindFirstMock,
      create: salesProposalEventCreateMock,
    },
  },
}));

import { POST } from "./route";

describe("POST /api/sales-machine/proposals/[id]/send-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "test-key";
    process.env.CONTACT_FROM = "sales@orbisy.com";
    process.env.NEXT_PUBLIC_URL = "https://app.orbisy.com";

    requireInternalUserMock.mockResolvedValue({ userId: "user_1" });
    authErrorToHttpMock.mockReturnValue(null);
    outreachUnsubscribeFindUniqueMock.mockResolvedValue(null);
    salesProposalEventFindFirstMock.mockResolvedValue(null);
    sendEmailMock.mockResolvedValue({ data: { id: "re_123" }, error: null });
    salesProposalEventCreateMock.mockResolvedValue({ id: "event_1" });
  });

  it("cannot email DRAFT proposal", async () => {
    salesProposalFindUniqueMock.mockResolvedValue({
      id: "proposal_1",
      status: "DRAFT",
      publicToken: "token_1",
      company: { id: "company_1", name: "Acme", slug: "acme" },
      opportunity: { id: "opp_1", title: "Replacement" },
      contact: { id: "contact_1", fullName: "Taylor", email: "taylor@example.com" },
    });

    const response = await POST(new Request("https://app.orbisy.com/api/test", { method: "POST" }), {
      params: Promise.resolve({ id: "proposal_1" }),
    });

    expect(response.status).toBe(409);
    expect(sendEmailMock).not.toHaveBeenCalled();
    expect(salesProposalEventCreateMock).not.toHaveBeenCalled();
  });

  it("cannot email proposal with no contact email", async () => {
    salesProposalFindUniqueMock.mockResolvedValue({
      id: "proposal_1",
      status: "SENT",
      publicToken: "token_1",
      company: { id: "company_1", name: "Acme", slug: "acme" },
      opportunity: { id: "opp_1", title: "Replacement" },
      contact: { id: "contact_1", fullName: "Taylor", email: null },
    });

    const response = await POST(new Request("https://app.orbisy.com/api/test", { method: "POST" }), {
      params: Promise.resolve({ id: "proposal_1" }),
    });

    expect(response.status).toBe(422);
    expect(sendEmailMock).not.toHaveBeenCalled();
    expect(salesProposalEventCreateMock).not.toHaveBeenCalled();
  });

  it("creates ProposalEvent after successful send and uses correct public URL", async () => {
    salesProposalFindUniqueMock.mockResolvedValue({
      id: "proposal_1",
      status: "SENT",
      publicToken: "token_abc",
      company: { id: "company_1", name: "Acme HVAC", slug: "acme-hvac" },
      opportunity: { id: "opp_1", title: "4-ton Heat Pump Replacement" },
      contact: { id: "contact_1", fullName: "Taylor Homeowner", email: "taylor@example.com" },
    });

    const response = await POST(new Request("https://app.orbisy.com/api/test", { method: "POST" }), {
      params: Promise.resolve({ id: "proposal_1" }),
    });

    expect(response.status).toBe(200);
    expect(sendEmailMock).toHaveBeenCalledTimes(1);

    const sendInput = sendEmailMock.mock.calls[0][0];
    expect(sendInput.to).toBe("taylor@example.com");
    expect(sendInput.text).toContain("https://app.orbisy.com/proposal/token_abc");
    expect(sendInput.text).toContain("4-ton Heat Pump Replacement");
    expect(sendInput.text).toContain("Acme HVAC");

    expect(salesProposalEventCreateMock).toHaveBeenCalledTimes(1);
    const createdEvent = salesProposalEventCreateMock.mock.calls[0][0];
    expect(createdEvent.data.eventType).toBe("EMAIL_SENT");
    expect(createdEvent.data.metadata.publicUrl).toBe("https://app.orbisy.com/proposal/token_abc");
  });
});

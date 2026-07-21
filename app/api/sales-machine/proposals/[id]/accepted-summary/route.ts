import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authErrorToHttp, requireInternalUser } from "@/lib/session";
import { serializeInternalAcceptedProposalSummary } from "@/lib/sales/proposals/accepted-summary";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireInternalUser();
  } catch (error) {
    const auth = authErrorToHttp(error);
    if (auth) {
      return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
    }
  }

  const { id } = await params;

  try {
    const proposal = await prisma.salesProposal.findUnique({
      where: { id },
      include: {
        opportunity: { select: { id: true, title: true } },
        company: { select: { id: true, name: true, slug: true } },
        contact: { select: { id: true, fullName: true, email: true, phone: true } },
        selectedOption: {
          include: {
            addonLines: {
              orderBy: [{ type: "asc" }, { createdAt: "asc" }],
            },
          },
        },
        events: {
          orderBy: { occurredAt: "asc" },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json({ ok: false, error: "Proposal not found" }, { status: 404 });
    }

    if (proposal.status !== "ACCEPTED") {
      return NextResponse.json(
        { ok: false, error: "Only accepted proposals have an internal handoff summary" },
        { status: 409 },
      );
    }

    return NextResponse.json({
      ok: true,
      summary: serializeInternalAcceptedProposalSummary(
        {
          id: proposal.id,
          publicToken: proposal.publicToken,
          title: proposal.title,
          notes: proposal.notes,
          status: proposal.status,
          acceptedAt: proposal.acceptedAt,
          opportunity: proposal.opportunity,
          company: proposal.company,
          contact: proposal.contact,
          selectedOption: proposal.selectedOption,
          events: proposal.events,
        },
        new URL(request.url).origin,
      ),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}

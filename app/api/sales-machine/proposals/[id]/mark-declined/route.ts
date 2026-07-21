import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authErrorToHttp, requireInternalUser } from "@/lib/session";
import { assertProposalStatusTransition } from "@/lib/sales/proposals/status";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
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
    const result = await prisma.$transaction(async (tx) => {
      const proposal = await tx.salesProposal.findUnique({
        where: { id },
        select: { id: true, status: true, declinedAt: true },
      });

      if (!proposal) {
        return { type: "not_found" as const };
      }

      if (proposal.status === "ACCEPTED") {
        return { type: "accepted" as const };
      }

      if (proposal.status === "DECLINED") {
        return { type: "ok" as const, status: proposal.status, declinedAt: proposal.declinedAt };
      }

      assertProposalStatusTransition(proposal.status, "DECLINED");
      const now = new Date();

      const updated = await tx.salesProposal.update({
        where: { id: proposal.id },
        data: {
          status: "DECLINED",
          declinedAt: proposal.declinedAt ?? now,
        },
        select: { status: true, declinedAt: true },
      });

      await tx.salesProposalEvent.create({
        data: {
          proposalId: proposal.id,
          eventType: "DECLINED",
          metadata: { source: "internal_mark_declined" },
        },
      });

      return { type: "ok" as const, status: updated.status, declinedAt: updated.declinedAt };
    });

    if (result.type === "not_found") {
      return NextResponse.json({ ok: false, error: "Proposal not found" }, { status: 404 });
    }

    if (result.type === "accepted") {
      return NextResponse.json(
        { ok: false, error: "Accepted proposal cannot be marked declined" },
        { status: 409 },
      );
    }

    return NextResponse.json({ ok: true, proposal: result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}
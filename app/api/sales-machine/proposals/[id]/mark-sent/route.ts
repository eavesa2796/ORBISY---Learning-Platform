import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authErrorToHttp, requireInternalUser } from "@/lib/session";
import { prepareMarkProposalSent } from "@/lib/sales/proposals/workflow";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
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
        select: {
          id: true,
          publicToken: true,
          status: true,
          sentAt: true,
        },
      });

      if (!proposal) {
        return { type: "not_found" as const };
      }

      if (proposal.status !== "DRAFT") {
        return { type: "invalid_status" as const, status: proposal.status };
      }

      const prepared = prepareMarkProposalSent(proposal, request.nextUrl.origin);

      const updated = await tx.salesProposal.update({
        where: { id: proposal.id },
        data: prepared.update,
        select: {
          id: true,
          publicToken: true,
          status: true,
          sentAt: true,
        },
      });

      await tx.salesProposalEvent.create({
        data: {
          proposalId: proposal.id,
          eventType: prepared.event.eventType,
          metadata: prepared.event.metadata,
        },
      });

      return {
        type: "ok" as const,
        proposal: updated,
        publicUrl: prepared.publicUrl,
      };
    });

    if (result.type === "not_found") {
      return NextResponse.json({ ok: false, error: "Proposal not found" }, { status: 404 });
    }

    if (result.type === "invalid_status") {
      return NextResponse.json(
        { ok: false, error: `Only draft proposals can be marked sent (current: ${result.status})` },
        { status: 409 },
      );
    }

    return NextResponse.json({
      ok: true,
      proposal: result.proposal,
      publicUrl: result.publicUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}
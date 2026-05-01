import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authErrorToHttp, requireInternalUser } from "@/lib/session";

export const runtime = "nodejs";

type UpdateOpportunityPayload = {
  title?: string;
  stage?:
    | "NEW"
    | "QUALIFIED"
    | "PROPOSAL_DRAFTED"
    | "PROPOSAL_SENT"
    | "WON"
    | "LOST";
  contactId?: string | null;
  estimatedJobValue?: number | null;
  targetInstallDate?: string | null;
  notes?: string | null;
};

export async function PATCH(
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
    const existing = await prisma.salesOpportunity.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Opportunity not found" }, { status: 404 });
    }

    const body = (await request.json()) as UpdateOpportunityPayload;

    if (body.contactId) {
      const contact = await prisma.salesContact.findFirst({
        where: { id: body.contactId, companyId: existing.companyId },
      });
      if (!contact) {
        return NextResponse.json(
          { ok: false, error: "contactId does not belong to opportunity company" },
          { status: 400 },
        );
      }
    }

    const updated = await prisma.salesOpportunity.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title.trim() } : {}),
        ...(body.stage !== undefined ? { stage: body.stage } : {}),
        ...(body.contactId !== undefined ? { contactId: body.contactId } : {}),
        ...(body.estimatedJobValue !== undefined
          ? { estimatedJobValue: body.estimatedJobValue }
          : {}),
        ...(body.targetInstallDate !== undefined
          ? {
              targetInstallDate: body.targetInstallDate
                ? new Date(body.targetInstallDate)
                : null,
            }
          : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
      },
      include: {
        company: { select: { id: true, name: true, slug: true } },
        contact: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    });

    return NextResponse.json({
      ok: true,
      opportunity: {
        id: updated.id,
        title: updated.title,
        stage: updated.stage,
        estimatedJobValue: updated.estimatedJobValue ? Number(updated.estimatedJobValue) : null,
        targetInstallDate: updated.targetInstallDate,
        notes: updated.notes,
        updatedAt: updated.updatedAt,
        company: updated.company,
        contact: updated.contact,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}

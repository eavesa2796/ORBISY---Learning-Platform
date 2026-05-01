import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authErrorToHttp, requireInternalUser } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireInternalUser();
  } catch (error) {
    const auth = authErrorToHttp(error);
    if (auth) {
      return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
    }
  }

  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId") || undefined;
    const stage = searchParams.get("stage") || undefined;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);

    const opportunities = await prisma.salesOpportunity.findMany({
      where: {
        ...(companyId ? { companyId } : {}),
        ...(stage ? { stage: stage as any } : {}),
      },
      include: {
        company: { select: { id: true, name: true, slug: true } },
        contact: { select: { id: true, fullName: true, email: true, phone: true } },
        _count: { select: { proposals: true } },
      },
      orderBy: [{ updatedAt: "desc" }],
      take: limit,
    });

    return NextResponse.json({
      ok: true,
      count: opportunities.length,
      opportunities: opportunities.map((o) => ({
        id: o.id,
        title: o.title,
        stage: o.stage,
        estimatedJobValue: o.estimatedJobValue ? Number(o.estimatedJobValue) : null,
        targetInstallDate: o.targetInstallDate,
        notes: o.notes,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
        company: o.company,
        contact: o.contact,
        proposalCount: o._count.proposals,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}

type CreateOpportunityPayload = {
  companyId: string;
  contactId?: string;
  title: string;
  estimatedJobValue?: number;
  targetInstallDate?: string;
  notes?: string;
};

export async function POST(request: NextRequest) {
  try {
    await requireInternalUser();
  } catch (error) {
    const auth = authErrorToHttp(error);
    if (auth) {
      return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
    }
  }

  try {
    const body = (await request.json()) as CreateOpportunityPayload;

    if (!body.companyId || !body.title?.trim()) {
      return NextResponse.json(
        { ok: false, error: "companyId and title are required" },
        { status: 400 },
      );
    }

    const company = await prisma.salesCompany.findUnique({ where: { id: body.companyId } });
    if (!company) {
      return NextResponse.json({ ok: false, error: "Company not found" }, { status: 404 });
    }

    if (body.contactId) {
      const contact = await prisma.salesContact.findFirst({
        where: { id: body.contactId, companyId: body.companyId },
      });
      if (!contact) {
        return NextResponse.json(
          { ok: false, error: "contactId does not belong to companyId" },
          { status: 400 },
        );
      }
    }

    const created = await prisma.salesOpportunity.create({
      data: {
        companyId: body.companyId,
        contactId: body.contactId,
        title: body.title.trim(),
        estimatedJobValue:
          typeof body.estimatedJobValue === "number" && Number.isFinite(body.estimatedJobValue)
            ? body.estimatedJobValue
            : undefined,
        targetInstallDate: body.targetInstallDate ? new Date(body.targetInstallDate) : undefined,
        notes: body.notes?.trim() || undefined,
      },
      include: {
        company: { select: { id: true, name: true, slug: true } },
        contact: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    });

    return NextResponse.json({
      ok: true,
      opportunity: {
        id: created.id,
        title: created.title,
        stage: created.stage,
        estimatedJobValue: created.estimatedJobValue ? Number(created.estimatedJobValue) : null,
        targetInstallDate: created.targetInstallDate,
        notes: created.notes,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
        company: created.company,
        contact: created.contact,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { retrieveKnowledge } from "@/lib/sales/rag";
import { authErrorToHttp, requireInternalUser } from "@/lib/session";

export const runtime = "nodejs";

type DraftPayload = {
  companyId: string;
  contactId?: string;
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
    const body = (await request.json()) as DraftPayload;

    if (!body.companyId) {
      return NextResponse.json(
        { ok: false, error: "companyId is required" },
        { status: 400 },
      );
    }

    const company = await prisma.salesCompany.findUnique({
      where: { id: body.companyId },
      include: {
        contacts: true,
        audits: { orderBy: { createdAt: "desc" }, take: 1 },
        scores: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { evidence: true },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { ok: false, error: "Company not found" },
        { status: 404 },
      );
    }

    const contact = body.contactId
      ? company.contacts.find((c) => c.id === body.contactId)
      : company.contacts.find((c) => c.isPrimary) || company.contacts[0];

    const latestScore = company.scores[0];
    const topEvidence = latestScore
      ? latestScore.evidence
          .sort((a, b) => Math.abs(b.points) - Math.abs(a.points))
          .slice(0, 3)
      : [];

    const retrievalQuery = [
      "hvac lead follow-up",
      "missed-call text-back",
      company.city,
      company.state,
      topEvidence.map((e) => e.label).join(" "),
    ]
      .filter(Boolean)
      .join(" ");

    const chunks = await retrieveKnowledge({
      query: retrievalQuery,
      tags: ["sales", "hvac"],
      limit: 4,
    });

    const painBullets = topEvidence.length
      ? topEvidence
          .map((item) => `- ${item.label.replace(/^No\s+/i, "No ")}`)
          .join("\n")
      : "- No missed-call text-back\n- No instant lead response promise\n- Weak estimate follow-up process";

    const ownerName = contact?.fullName || "there";
    const subject = `Quick HVAC lead follow-up issue I noticed at ${company.name}`;

    const bodyText = `Hey ${ownerName},

I was looking at ${company.name} and noticed a few things that may be costing booked HVAC jobs:

${painBullets}

I build a simple revenue recovery system for HVAC companies that catches missed calls, replies to web leads instantly, follows up on estimates, and tracks what turns into booked jobs.

If useful, I can send a quick 3-point audit for ${company.name} based on what I found.

Best,
ORBISY`;

    const draft = await prisma.salesOutreachMessage.create({
      data: {
        companyId: company.id,
        contactId: contact?.id,
        status: "DRAFT",
        subject,
        body: bodyText,
        personalization: {
          score: latestScore?.totalScore ?? null,
          city: company.city,
          state: company.state,
          evidence: topEvidence.map((e) => ({
            label: e.label,
            points: e.points,
            detail: e.detail,
          })),
        },
        retrievedChunkIds: chunks.map((c) => c.id),
      },
    });

    return NextResponse.json({
      ok: true,
      draft: {
        id: draft.id,
        subject: draft.subject,
        body: draft.body,
        status: draft.status,
      },
      rag: {
        usedChunks: chunks.map((c) => ({
          id: c.id,
          title: c.documentTitle,
          score: c.score,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unexpected error",
      },
      { status: 500 },
    );
  }
}

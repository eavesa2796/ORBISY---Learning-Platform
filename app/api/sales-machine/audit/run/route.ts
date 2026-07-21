/**
 * POST /api/sales-machine/audit/run
 *
 * Crawls the website for a SalesCompany, extracts evidence-backed signals,
 * writes a SalesWebsiteAudit + SalesAuditEvidence rows, then re-scores the
 * lead using the new evidence so the deal thesis and buying likelihood update.
 *
 * Body: { companyId: string } or { slug: string }
 * Returns the updated audit + score summary.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractAudit } from "@/lib/sales/audit-extractor";
import { scoreLead, type ScoringInput } from "@/lib/sales/scoring";
import { authErrorToHttp, requireInternalUser } from "@/lib/session";

export const runtime = "nodejs";

// Vercel / Node timeout budget is 60 s on the hobby plan; crawling 3 pages
// with a 10 s per-page timeout fits comfortably within that.
export const maxDuration = 55;

export async function POST(request: NextRequest) {
  try {
    await requireInternalUser();
  } catch (error) {
    const auth = authErrorToHttp(error);
    if (auth) {
      return NextResponse.json({ error: auth.message }, { status: auth.status });
    }
  }

  try {
    const body = (await request.json()) as {
      companyId?: string;
      slug?: string;
    };

    if (!body.companyId && !body.slug) {
      return NextResponse.json(
        { error: "Provide companyId or slug" },
        { status: 400 },
      );
    }

    // ── Resolve company ─────────────────────────────────────────────────────
    const company = body.companyId
      ? await prisma.salesCompany.findUnique({
          where: { id: body.companyId },
          include: { scores: { orderBy: { createdAt: "desc" }, take: 1 } },
        })
      : await prisma.salesCompany.findFirst({
          where: { slug: { equals: body.slug } },
          include: { scores: { orderBy: { createdAt: "desc" }, take: 1 } },
        });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (!company.website) {
      return NextResponse.json(
        { error: "Company has no website URL — cannot run audit" },
        { status: 422 },
      );
    }

    // ── Run website crawler ─────────────────────────────────────────────────
    const auditResult = await extractAudit(company.website);

    // ── Persist SalesWebsiteAudit + SalesAuditEvidence ───────────────────────
    const audit = await prisma.salesWebsiteAudit.create({
      data: {
        companyId: company.id,
        auditVersion: "v2",
        auditedUrl: auditResult.auditedUrl,
        crawlStatus: auditResult.crawlStatus,
        crawlError: auditResult.crawlError,
        auditedAt: new Date(),
        detectedTools: auditResult.detectedTools,
        hasOnlineBooking: auditResult.hasOnlineBooking,
        hasEmergencyCta: auditResult.hasEmergencyCta,
        hasMissedCallTextBack: auditResult.hasMissedCallTextBack,
        hasFastResponsePromise: auditResult.hasFastResponsePromise,
        hasFinancingCta: auditResult.hasFinancingCta,
        hasAfterHoursCapture: auditResult.hasAfterHoursCapture,
        hasChatOrTextOption: auditResult.hasChatOrTextOption,
        hasStrongReviewProcess: auditResult.hasStrongReviewProcess,
        hasClearEstimateFlow: auditResult.hasClearEstimateFlow,
      },
    });

    if (auditResult.evidence.length > 0) {
      await prisma.salesAuditEvidence.createMany({
        data: auditResult.evidence.map((e) => ({
          auditId: audit.id,
          code: e.code,
          label: e.label,
          observed: e.observed,
          severity: e.severity,
          confidence: e.confidence,
          sourceUrl: e.sourceUrl,
          snippet: e.snippet,
        })),
      });
    }

    // ── Re-score with new evidence ──────────────────────────────────────────
    const prevScore = company.scores[0];
    const category = (company.category ?? "").toLowerCase();

    const scoringInput: ScoringInput = {
      isHvacOnly:
        category.includes("hvac") ||
        category.includes("air") ||
        category.includes("heat") ||
        category.includes("cool"),
      isResidentialService: true,
      isLocalRegional: true,
      isHugeFranchise: false,
      reviewCount: company.reviewCount ?? 0,
      hasPhoneNumber: !!company.phone,
      hasWebsite: !!company.website,
      hasActiveBusinessProfile: true,
      signals: auditResult.signals,
    };

    const score = scoreLead(scoringInput);

    // Create a new score record (preserves audit trail)
    const newScore = await prisma.salesLeadScore.create({
      data: {
        companyId: company.id,
        icpFit: score.icpFit,
        revenuePotential: score.revenuePotential,
        painSignals: score.painSignals,
        contactability: score.contactability,
        disqualifiers: score.disqualifiers,
        totalScore: score.totalScore,
        buyingLikelihood: score.buyingLikelihood,
        dealThesis: score.dealThesis,
        thesisConfidence: score.thesisConfidence,
        explanation: score.explanation,
        modelVersion: "v2",
      },
    });

    if (score.evidence.length > 0) {
      await prisma.salesScoreEvidence.createMany({
        data: score.evidence.map((e) => ({
          scoreId: newScore.id,
          code: e.code,
          label: e.label,
          points: e.points,
          detail: e.detail,
        })),
      });
    }

    // Update qualification status
    await prisma.salesCompany.update({
      where: { id: company.id },
      data: {
        isQualified: score.isQualified,
        disqualifiedReason: score.isQualified
          ? null
          : "Score below threshold or failed ICP fit after website audit",
      },
    });

    return NextResponse.json({
      ok: true,
      companyId: company.id,
      companyName: company.name,
      auditId: audit.id,
      crawlStatus: auditResult.crawlStatus,
      pagesChecked: auditResult.pagesChecked,
      detectedTools: auditResult.detectedTools,
      evidenceCount: auditResult.evidence.length,
      score: {
        total: score.totalScore,
        buyingLikelihood: score.buyingLikelihood,
        qualified: score.isQualified,
        dealThesis: score.dealThesis,
        thesisConfidence: score.thesisConfidence,
        previousTotal: prevScore?.totalScore ?? null,
        delta: prevScore ? score.totalScore - prevScore.totalScore : null,
      },
      topEvidence: auditResult.evidence
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 6)
        .map((e) => ({
          code: e.code,
          label: e.label,
          observed: e.observed,
          confidence: e.confidence,
          snippet: e.snippet,
        })),
    });
  } catch (err) {
    console.error("[audit/run]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}

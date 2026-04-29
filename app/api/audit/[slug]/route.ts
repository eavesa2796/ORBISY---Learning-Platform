import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type EvidenceIssueRule = {
  code: string;
  issueWhenObserved: boolean;
  title: string;
  impact: string;
  recommendedFix: string;
};

const ISSUE_RULES: EvidenceIssueRule[] = [
  {
    code: "hasMissedCallTextBack",
    issueWhenObserved: false,
    title: "No missed-call text-back system",
    impact: "~3-5 booked jobs/month lost from unanswered calls",
    recommendedFix:
      "Enable missed-call text-back with <60 second response and routing to booking.",
  },
  {
    code: "hasOnlineBookingFlow",
    issueWhenObserved: false,
    title: "No online booking flow",
    impact: "~$2,000-$4,000/month in after-hours demand leakage",
    recommendedFix:
      "Add a one-click online booking or quote flow on homepage and service pages.",
  },
  {
    code: "hasAfterHoursCapture",
    issueWhenObserved: false,
    title: "No after-hours lead capture",
    impact: "Up to 30% of inbound demand missed evenings/weekends",
    recommendedFix:
      "Install automated after-hours SMS + booking handoff with next-day callback.",
  },
  {
    code: "hasClearEstimateFlow",
    issueWhenObserved: false,
    title: "Weak estimate follow-up process",
    impact: "20-40% of estimate leads fail to convert",
    recommendedFix:
      "Launch 3-touch estimate follow-up sequence (SMS + email + callback).",
  },
  {
    code: "hasSlowOrConfusingForms",
    issueWhenObserved: true,
    title: "High-friction contact form",
    impact: "Form completion and conversion rates drop on mobile visitors",
    recommendedFix: "Reduce required fields to 3-4 and shorten time-to-submit.",
  },
  {
    code: "hasPoorMobileUx",
    issueWhenObserved: true,
    title: "Poor mobile UX signals",
    impact: "Lower call and form conversion from mobile traffic",
    recommendedFix:
      "Fix viewport/responsive layout and prioritize tap-to-call CTAs.",
  },
  {
    code: "hasChatOrTextOption",
    issueWhenObserved: false,
    title: "No chat or text option",
    impact: "Text-first prospects drop before contact",
    recommendedFix:
      "Add click-to-text and chat entry points on high-intent pages.",
  },
  {
    code: "hasFastResponsePromise",
    issueWhenObserved: false,
    title: "No fast-response promise",
    impact: "Lower trust and lower contact conversion",
    recommendedFix:
      "Publish a specific response SLA (e.g. 'reply in under 5 minutes').",
  },
];

function severityWeight(severity: string): number {
  if (severity === "high") return 3;
  if (severity === "medium") return 2;
  return 1;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const company = await prisma.salesCompany.findFirst({
      where: { slug: { equals: slug } },
      include: {
        audits: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            evidence: {
              orderBy: [{ confidence: "desc" }, { createdAt: "desc" }],
            },
          },
        },
        scores: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    const audit = company.audits[0];
    const score = company.scores[0];

    const issues = (audit?.evidence ?? [])
      .map((ev) => {
        const rule = ISSUE_RULES.find((r) => r.code === ev.code);
        if (!rule) return null;
        if (ev.observed !== rule.issueWhenObserved) return null;

        return {
          code: ev.code,
          title: rule.title,
          proof: {
            sourceUrl: ev.sourceUrl || company.website || null,
            snippet: ev.snippet || "No snippet captured for this signal.",
            screenshotUrl: ev.screenshotUrl || null,
            confidence: ev.confidence,
          },
          impact: rule.impact,
          recommendedFix: rule.recommendedFix,
          priorityScore: severityWeight(ev.severity) * 100 + ev.confidence,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 3)
      .map((item, index) => ({
        priority: index + 1,
        code: item.code,
        title: item.title,
        proof: item.proof,
        impact: item.impact,
        recommendedFix: item.recommendedFix,
      }));

    const missedRevenue =
      issues.length >= 3
        ? "$8,000-$15,000/month"
        : issues.length >= 2
          ? "$4,000-$8,000/month"
          : "$2,000-$4,000/month";

    return NextResponse.json({
      company: {
        id: company.id,
        slug: company.slug,
        name: company.name,
        website: company.website,
        phone: company.phone,
        city: company.city,
        state: company.state,
        rating: company.rating,
        reviewCount: company.reviewCount,
      },
      score: score
        ? {
            total: score.totalScore,
            qualified: company.isQualified,
            explanation: score.explanation,
          }
        : null,
      audit: audit
        ? {
            auditedAt: audit.auditedAt,
            auditedUrl: audit.auditedUrl,
            crawlStatus: audit.crawlStatus,
          }
        : null,
      priorityIssues: issues,
      missedRevenue,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[audit slug]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const company = await prisma.salesCompany.findUnique({
      where: { slug },
      include: {
        audits: { orderBy: { createdAt: "desc" }, take: 1 },
        scores: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { evidence: { orderBy: { points: "asc" }, take: 6 } },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    const audit = company.audits[0];
    const score = company.scores[0];

    // Derive lead leaks from audit flags + score evidence
    const leaks: Array<{ title: string; description: string; impact: string }> =
      [];

    if (audit) {
      if (!audit.hasMissedCallTextBack) {
        leaks.push({
          title: "No missed-call text-back",
          description:
            "When a potential customer calls and no one answers, they move on to the next HVAC company. A text-back catches them before that happens.",
          impact: "~3-5 lost jobs/month on average",
        });
      }
      if (!audit.hasOnlineBooking) {
        leaks.push({
          title: "No instant booking or quote option",
          description:
            "Customers searching at 9pm for emergency HVAC help can't book with you online — but they can with your competitors.",
          impact: "~$2,000–$4,000 in missed after-hours revenue/month",
        });
      }
      if (!audit.hasClearEstimateFlow) {
        leaks.push({
          title: "Weak estimate follow-up",
          description:
            "Estimates that don't get an automatic follow-up sequence lose 40–60% of closes that could have been saved with a simple nudge.",
          impact: "~20–40% of estimate leads not converting",
        });
      }
      if (!audit.hasAfterHoursCapture) {
        leaks.push({
          title: "No after-hours lead capture",
          description:
            "Most HVAC leads come in evenings and weekends. Without automated capture, these go straight to voicemail and then a competitor.",
          impact: "Up to 30% of total monthly leads lost",
        });
      }
      if (!audit.hasStrongReviewProcess) {
        leaks.push({
          title: "No review generation process",
          description:
            "HVAC buyers trust reviews more than ads. Without a process to ask happy customers, your star count stays low while competitors pull ahead.",
          impact: "Lower click-through on Google Maps by ~25%",
        });
      }
    }

    // Supplement from score evidence (negative signals)
    if (score && leaks.length < 3) {
      for (const ev of score.evidence) {
        if (ev.points < 0 && leaks.length < 5) {
          leaks.push({
            title: ev.label,
            description: ev.detail || "This gap is costing you booked jobs.",
            impact: "Revenue impact: moderate to high",
          });
        }
      }
    }

    // Cap at 5 leaks for display
    const topLeaks = leaks.slice(0, 5);

    // Estimated annual missed revenue (rough heuristic)
    const missedRevenue =
      topLeaks.length >= 4
        ? "$8,000–$15,000/month"
        : topLeaks.length >= 2
          ? "$4,000–$8,000/month"
          : "$2,000–$4,000/month";

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
      leaks: topLeaks,
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

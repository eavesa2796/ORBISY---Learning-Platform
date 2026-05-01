import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authErrorToHttp, requireInternalUser } from "@/lib/session";
import {
  getProposalFollowUpDays,
  getProposalFollowUpState,
} from "@/lib/sales/proposals/internal-list";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireInternalUser();
  } catch (error) {
    const auth = authErrorToHttp(error);
    if (auth) {
      return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
    }
  }

  try {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    const [
      totalCompanies,
      qualifiedCompanies,
      totalMessages,
      repliedMessages,
      bookedMessages,
      bouncedMessages,
      sentThisWeek,
      statusCounts,
      buyingLikelihoodAgg,
      hotLeads,
      followUpProposals,
      acceptedThisMonth,
    ] = await Promise.all([
      prisma.salesCompany.count(),
      prisma.salesCompany.count({ where: { isQualified: true } }),
      prisma.salesOutreachMessage.count(),
      prisma.salesOutreachMessage.count({ where: { status: "REPLIED" } }),
      prisma.salesOutreachMessage.count({ where: { status: "READY" } }),
      prisma.salesOutreachMessage.count({ where: { status: "BOUNCED" } }),
      prisma.salesOutreachMessage.count({
        where: { status: "SENT", sentAt: { gte: weekAgo } },
      }),
      prisma.salesOutreachMessage.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      // Avg buying likelihood from latest score per company
      prisma.salesLeadScore.aggregate({ _avg: { buyingLikelihood: true } }),
      // Hot leads: buyingLikelihood >= 70, most recent score
      prisma.salesLeadScore.count({ where: { buyingLikelihood: { gte: 70 } } }),
      prisma.salesProposal.findMany({
        where: {
          status: { in: ["SENT", "VIEWED"] },
        },
        select: {
          status: true,
          sentAt: true,
          events: {
            where: {
              eventType: { in: ["EMAIL_SENT", "FOLLOW_UP_SENT"] },
            },
            select: {
              eventType: true,
              occurredAt: true,
            },
            orderBy: { occurredAt: "desc" },
          },
        },
      }),
      prisma.salesProposal.findMany({
        where: {
          status: "ACCEPTED",
          acceptedAt: {
            gte: monthStart,
            lt: nextMonthStart,
          },
        },
        select: {
          id: true,
          selectedOption: {
            select: {
              finalCustomerPrice: true,
            },
          },
        },
      }),
    ]);

    const followUpDays = getProposalFollowUpDays();
    const proposalsNeedingFollowUp = followUpProposals.filter((proposal) =>
      getProposalFollowUpState(proposal, { now, followUpDays }).needsFollowUp,
    ).length;
    const acceptedProposalsThisMonth = acceptedThisMonth.length;
    const estimatedAcceptedRevenueThisMonth = Math.round(
      acceptedThisMonth.reduce((sum, proposal) => {
        return sum + (proposal.selectedOption ? Number(proposal.selectedOption.finalCustomerPrice) : 0);
      }, 0),
    );

    const byStatus = statusCounts.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = row._count._all;
      return acc;
    }, {});

    const replyRate =
      totalMessages > 0
        ? Math.round((repliedMessages / totalMessages) * 100)
        : 0;
    const bounceRate =
      totalMessages > 0
        ? Math.round((bouncedMessages / totalMessages) * 100)
        : 0;
    const avgBuyingLikelihood = Math.round(
      buyingLikelihoodAgg._avg.buyingLikelihood ?? 0,
    );

    return NextResponse.json({
      ok: true,
      metrics: {
        totalCompanies,
        qualifiedCompanies,
        totalMessages,
        repliedMessages,
        readyMessages: bookedMessages,
        bouncedMessages,
        sentThisWeek,
        replyRate,
        bounceRate,
        avgBuyingLikelihood,
        hotLeads,
        proposalsNeedingFollowUp,
        acceptedProposalsThisMonth,
        estimatedAcceptedRevenueThisMonth,
        byStatus,
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

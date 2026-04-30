import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);

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
    ]);

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

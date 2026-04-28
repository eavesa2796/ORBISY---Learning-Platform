import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [
      totalCompanies,
      qualifiedCompanies,
      totalMessages,
      repliedMessages,
      bookedMessages,
      statusCounts,
    ] = await Promise.all([
      prisma.salesCompany.count(),
      prisma.salesCompany.count({ where: { isQualified: true } }),
      prisma.salesOutreachMessage.count(),
      prisma.salesOutreachMessage.count({ where: { status: "REPLIED" } }),
      prisma.salesOutreachMessage.count({ where: { status: "READY" } }),
      prisma.salesOutreachMessage.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);

    const byStatus = statusCounts.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = row._count._all;
      return acc;
    }, {});

    return NextResponse.json({
      ok: true,
      metrics: {
        totalCompanies,
        qualifiedCompanies,
        totalMessages,
        repliedMessages,
        readyMessages: bookedMessages,
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

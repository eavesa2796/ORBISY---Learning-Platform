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
    const status = searchParams.get("status") || undefined;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    const messages = await prisma.salesOutreachMessage.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        company: { select: { id: true, name: true, slug: true } },
        contact: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      ok: true,
      count: messages.length,
      messages: messages.map((m) => ({
        id: m.id,
        status: m.status,
        subject: m.subject,
        bodyPreview: m.body.slice(0, 180),
        createdAt: m.createdAt,
        sentAt: m.sentAt,
        repliedAt: m.repliedAt,
        company: m.company,
        contact: m.contact,
      })),
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

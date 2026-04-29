import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type ResendBouncePayload = {
  type?: string;
  data?: {
    to?: string[] | string;
    bounce?: {
      type?: string;
      reason?: string;
    };
    reason?: string;
  };
};

function parseEmail(raw: string): string | null {
  const match = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0].toLowerCase() : null;
}

function getRecipientEmail(data?: ResendBouncePayload["data"]): string | null {
  if (!data?.to) return null;

  const raw = Array.isArray(data.to) ? data.to[0] : data.to;
  if (!raw) return null;
  return parseEmail(raw);
}

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.OUTREACH_WEBHOOK_SECRET;
    if (secret) {
      const incoming = request.headers.get("x-orbisy-webhook-secret");
      if (incoming !== secret) {
        return NextResponse.json(
          { error: "Unauthorized webhook" },
          { status: 401 },
        );
      }
    }

    const payload = (await request.json()) as ResendBouncePayload;
    const eventType = (payload.type || "").toLowerCase();

    if (!eventType.includes("bounce")) {
      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: "Not a bounce event",
      });
    }

    const recipient = getRecipientEmail(payload.data);
    if (!recipient) {
      return NextResponse.json(
        { ok: true, ignored: true, reason: "No recipient email in payload" },
        { status: 202 },
      );
    }

    const bounceType =
      payload.data?.bounce?.type?.toLowerCase() ||
      (eventType.includes("hard") ? "hard" : "soft");
    const bounceReason =
      payload.data?.bounce?.reason ||
      payload.data?.reason ||
      "Provider-reported bounce";

    const latestSent = await prisma.salesOutreachMessage.findFirst({
      where: {
        contact: {
          email: { equals: recipient, mode: "insensitive" },
        },
        status: { in: ["SENT", "REPLIED", "BOUNCED"] },
      },
      orderBy: [{ sentAt: "desc" }, { createdAt: "desc" }],
      include: {
        contact: true,
      },
    });

    if (!latestSent) {
      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: "No sent message found",
      });
    }

    const hardBounce = bounceType === "hard";

    await prisma.salesOutreachMessage.update({
      where: { id: latestSent.id },
      data: {
        status: hardBounce ? "STOPPED" : "BOUNCED",
        bounceType,
        bounceReason,
      },
    });

    if (hardBounce) {
      await prisma.outreachUnsubscribe.upsert({
        where: { email: recipient },
        update: {},
        create: { email: recipient },
      });
    }

    return NextResponse.json({
      ok: true,
      messageId: latestSent.id,
      recipient,
      bounceType,
      suppressed: hardBounce,
    });
  } catch (err) {
    console.error("[outreach/webhooks/resend]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}

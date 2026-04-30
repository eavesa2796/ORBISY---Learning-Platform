/**
 * POST /api/sales-machine/outreach/webhooks/inbound-reply
 *
 * Receives inbound email reply events (e.g. from Resend "email.reply" webhook
 * or a forwarding service that POSTs {to, from, subject, text}).
 *
 * Validates the Resend webhook signature (RESEND_WEBHOOK_SECRET), then:
 *  1. Finds the most recent SENT/REPLIED message for the sender's email.
 *  2. Classifies the reply intent (BOOK_REQUEST / POSITIVE / NEUTRAL / NEGATIVE / UNSUBSCRIBE).
 *  3. Updates the message: status → REPLIED, replyIntent, replySnippet, repliedAt.
 *  4. On UNSUBSCRIBE: adds to suppression list, marks message STOPPED.
 *  5. On BOOK_REQUEST / POSITIVE: no auto-action (operator reviews in command center).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac, timingSafeEqual } from "crypto";
import { classifyReplyIntent } from "@/lib/sales/reply-intent";

export const runtime = "nodejs";

type InboundReplyPayload = {
  type?: string;
  data?: {
    from?: string;
    to?: string | string[];
    subject?: string;
    text?: string;
    html?: string;
  };
};

function parseEmail(raw: string): string | null {
  const match = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0].toLowerCase() : null;
}

function verifySignature(
  signature: string | null,
  body: Buffer,
  secret: string,
): boolean {
  if (!signature || !signature.startsWith("t=")) return false;
  const parts = signature.split(",");
  const timestamp = parts[0]?.replace("t=", "");
  const received = parts[1]?.replace("v1=", "");
  if (!timestamp || !received) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${body.toString()}`)
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(received), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.RESEND_WEBHOOK_SECRET;
    const body = Buffer.from(await request.arrayBuffer());

    if (secret) {
      const sig = request.headers.get("x-resend-signature");
      if (!verifySignature(sig, body, secret)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const payload = JSON.parse(body.toString()) as InboundReplyPayload;
    const eventType = (payload.type || "").toLowerCase();

    // Accept email.reply or inbound.email events; skip others
    if (!eventType.includes("reply") && !eventType.includes("inbound")) {
      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: "Not a reply event",
      });
    }

    const fromRaw = payload.data?.from ?? "";
    const senderEmail = parseEmail(fromRaw);
    if (!senderEmail) {
      return NextResponse.json(
        { ok: true, ignored: true, reason: "No sender email in payload" },
        { status: 202 },
      );
    }

    const replyText =
      payload.data?.text?.trim() ||
      payload.data?.html?.replace(/<[^>]+>/g, " ").trim() ||
      "";

    const { intent, snippet } = classifyReplyIntent(replyText || fromRaw);

    // Find the latest SENT message to this sender's contact
    const latestSent = await prisma.salesOutreachMessage.findFirst({
      where: {
        contact: { email: { equals: senderEmail, mode: "insensitive" } },
        status: { in: ["SENT", "REPLIED"] },
      },
      orderBy: [{ sentAt: "desc" }, { createdAt: "desc" }],
      include: { contact: true },
    });

    if (!latestSent) {
      return NextResponse.json({
        ok: true,
        ignored: true,
        reason: "No matching sent message found for sender",
      });
    }

    if (intent === "UNSUBSCRIBE") {
      // Mark STOPPED and add to suppression list
      await prisma.$transaction([
        prisma.salesOutreachMessage.update({
          where: { id: latestSent.id },
          data: {
            status: "STOPPED",
            repliedAt: new Date(),
            replyIntent: intent,
            replySnippet: snippet || null,
          },
        }),
        prisma.outreachUnsubscribe.upsert({
          where: { email: senderEmail },
          update: {},
          create: { email: senderEmail },
        }),
      ]);
    } else {
      await prisma.salesOutreachMessage.update({
        where: { id: latestSent.id },
        data: {
          status: "REPLIED",
          repliedAt: new Date(),
          replyIntent: intent,
          replySnippet: snippet || null,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      messageId: latestSent.id,
      senderEmail,
      intent,
      suppressed: intent === "UNSUBSCRIBE",
    });
  } catch (err) {
    console.error("[outreach/webhooks/inbound-reply]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}

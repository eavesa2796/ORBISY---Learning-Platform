import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac, timingSafeEqual } from "crypto";
import { authErrorToHttp, requireInternalUser } from "@/lib/session";

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

function verifyResendSignature(
  signature: string | null,
  body: Buffer,
  secret: string,
): boolean {
  if (!signature || !signature.startsWith("t=")) {
    return false;
  }

  const parts = signature.split(",");
  const timestamp = parts[0]?.replace("t=", "");
  const receivedSigPart = parts[1]?.replace("v1=", "");

  if (!timestamp || !receivedSigPart) {
    return false;
  }

  const signedContent = `${timestamp}.${body.toString()}`;
  const expectedSig = createHmac("sha256", secret)
    .update(signedContent)
    .digest("hex");

  try {
    return timingSafeEqual(
      Buffer.from(receivedSigPart),
      Buffer.from(expectedSig),
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.RESEND_WEBHOOK_SECRET;
    const body = Buffer.from(await request.arrayBuffer());
    let authorized = false;

    if (secret) {
      const signature = request.headers.get("x-resend-signature");
      authorized = verifyResendSignature(signature, body, secret);
    }

    if (!authorized) {
      try {
        await requireInternalUser();
        authorized = true;
      } catch (error) {
        const auth = authErrorToHttp(error);
        if (auth) {
          return NextResponse.json({ error: auth.message }, { status: auth.status });
        }
      }
    }

    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 });
    }

    const payload = JSON.parse(body.toString()) as ResendBouncePayload;
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

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateUnsubscribeLink } from "@/lib/outreach/security";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

function buildUnsubscribeFooter(email: string): string {
  const link = generateUnsubscribeLink(email);
  return `\n\n---\nYou received this because your business was identified as a match for ORBISY's HVAC growth system.\nTo stop receiving these emails: ${link}\n\nORBISY · HVAC Revenue Recovery System`;
}

function validateCanSpam(
  subject: string,
  body: string,
  fromEmail: string,
): string[] {
  const violations: string[] = [];
  if (!subject.trim()) violations.push("Subject line is required (CAN-SPAM)");
  if (!body.trim()) violations.push("Email body is required");
  if (!fromEmail.includes("@"))
    violations.push("Valid from address required (CAN-SPAM)");
  if (
    body.toLowerCase().includes("make money fast") ||
    body.toLowerCase().includes("free money")
  ) {
    violations.push("Potentially deceptive content detected");
  }
  return violations;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const fromEmail = process.env.CONTACT_FROM || process.env.RESEND_FROM_EMAIL;
  if (!fromEmail) {
    return NextResponse.json(
      { error: "CONTACT_FROM env var is not configured" },
      { status: 503 },
    );
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured" },
      { status: 503 },
    );
  }

  try {
    const message = await prisma.salesOutreachMessage.findUnique({
      where: { id },
      include: {
        company: true,
        contact: true,
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (message.status !== "APPROVED") {
      return NextResponse.json(
        {
          error: `Cannot send a message with status "${message.status}". Only APPROVED messages can be sent.`,
        },
        { status: 409 },
      );
    }

    const recipientEmail = message.contact?.email;
    if (!recipientEmail) {
      return NextResponse.json(
        {
          error:
            "No email address on the associated contact. Add a contact email before sending.",
        },
        { status: 422 },
      );
    }

    // CAN-SPAM compliance check
    const violations = validateCanSpam(
      message.subject,
      message.body,
      fromEmail,
    );
    if (violations.length > 0) {
      return NextResponse.json(
        { error: "CAN-SPAM compliance failure", violations },
        { status: 422 },
      );
    }

    // Suppression list check (re-uses existing OutreachUnsubscribe table)
    const suppressed = await prisma.outreachUnsubscribe.findUnique({
      where: { email: recipientEmail.toLowerCase() },
    });
    if (suppressed) {
      await prisma.salesOutreachMessage.update({
        where: { id },
        data: { status: "STOPPED" },
      });
      return NextResponse.json(
        {
          error:
            "Recipient is on the suppression list. Message marked STOPPED.",
          suppressed: true,
        },
        { status: 422 },
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const footer = buildUnsubscribeFooter(recipientEmail);
    const fullBody = message.body + footer;

    // Build audit link to attach to the email
    const auditLink = `${baseUrl}/audit/${message.company.slug}`;
    const bodyWithAudit = fullBody.includes("/audit/")
      ? fullBody
      : fullBody.replace(
          "Best,\nORBISY",
          `Best,\nORBISY\n\nP.S. I put together a quick 3-point audit for ${message.company.name} here: ${auditLink}`,
        );

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      replyTo: fromEmail,
      subject: message.subject,
      text: bodyWithAudit,
    });

    if (error) {
      return NextResponse.json(
        { error: `Resend error: ${error.message || JSON.stringify(error)}` },
        { status: 502 },
      );
    }

    const sent = await prisma.salesOutreachMessage.update({
      where: { id },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      messageId: data?.id,
      sentAt: sent.sentAt,
      to: recipientEmail,
    });
  } catch (err) {
    console.error("[send]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authErrorToHttp, requireInternalUser } from "@/lib/session";

export const runtime = "nodejs";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireInternalUser();
  } catch (error) {
    const auth = authErrorToHttp(error);
    if (auth) {
      return NextResponse.json({ error: auth.message }, { status: auth.status });
    }
  }

  const { id } = await params;

  try {
    const message = await prisma.salesOutreachMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (message.status !== "DRAFT") {
      return NextResponse.json(
        {
          error: `Cannot approve a message with status "${message.status}". Only DRAFT messages can be approved.`,
        },
        { status: 409 },
      );
    }

    const updated = await prisma.salesOutreachMessage.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    return NextResponse.json({ ok: true, message: updated });
  } catch (err) {
    console.error("[approve]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { authErrorToHttp, requireInternalUser } from "@/lib/session";
import {
  createProposalTemplate,
  listProposalTemplates,
  type ProposalTemplate,
} from "@/lib/sales/proposals/templates";

export const runtime = "nodejs";

type CreateTemplatePayload = {
  name: string;
  jobType: ProposalTemplate["jobType"];
  description: string;
  isActive?: boolean;
  tiers: ProposalTemplate["tiers"];
};

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
    const includeInactive = new URL(request.url).searchParams.get("includeInactive") === "true";
    const templates = await listProposalTemplates({ includeInactive });
    return NextResponse.json({ ok: true, count: templates.length, templates });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireInternalUser();
  } catch (error) {
    const auth = authErrorToHttp(error);
    if (auth) {
      return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
    }
  }

  try {
    const body = (await request.json()) as CreateTemplatePayload;
    if (!body.name?.trim() || !body.jobType || !Array.isArray(body.tiers)) {
      return NextResponse.json(
        { ok: false, error: "name, jobType, and tiers are required" },
        { status: 400 },
      );
    }

    const created = await createProposalTemplate({
      name: body.name.trim(),
      jobType: body.jobType,
      description: body.description?.trim() || "",
      isActive: body.isActive ?? true,
      tiers: body.tiers,
    });

    return NextResponse.json({ ok: true, template: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}

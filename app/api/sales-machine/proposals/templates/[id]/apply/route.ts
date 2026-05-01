import { NextRequest, NextResponse } from "next/server";
import { authErrorToHttp, requireInternalUser } from "@/lib/session";
import {
  applyTemplateToTierDefaults,
  getProposalTemplateById,
  type TemplateTierOverride,
} from "@/lib/sales/proposals/templates";

export const runtime = "nodejs";

type ApplyTemplatePayload = {
  overrides?: TemplateTierOverride[];
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireInternalUser();
  } catch (error) {
    const auth = authErrorToHttp(error);
    if (auth) {
      return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
    }
  }

  const { id } = await params;

  try {
    const template = await getProposalTemplateById(id);
    if (!template || !template.isActive) {
      return NextResponse.json({ ok: false, error: "Template not found" }, { status: 404 });
    }

    const body = (await request.json().catch(() => ({}))) as ApplyTemplatePayload;
    const appliedTiers = applyTemplateToTierDefaults(template, body.overrides || []);

    return NextResponse.json({
      ok: true,
      template: {
        id: template.id,
        name: template.name,
        jobType: template.jobType,
      },
      draftDefaults: {
        tiers: appliedTiers,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}

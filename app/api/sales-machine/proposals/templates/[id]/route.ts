import { NextRequest, NextResponse } from "next/server";
import { authErrorToHttp, requireInternalUser } from "@/lib/session";
import { deleteProposalTemplate, getProposalTemplateById, updateProposalTemplate } from "@/lib/sales/proposals/templates";

export const runtime = "nodejs";

export async function PUT(
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
    const current = await getProposalTemplateById(id);
    if (!current) {
      return NextResponse.json({ ok: false, error: "Template not found" }, { status: 404 });
    }

    if (current.isBuiltIn) {
      return NextResponse.json(
        { ok: false, error: "Built-in templates cannot be edited" },
        { status: 409 },
      );
    }

    const patch = await request.json();
    const updated = await updateProposalTemplate(id, patch);
    if (!updated) {
      return NextResponse.json({ ok: false, error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, template: updated });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
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
    const current = await getProposalTemplateById(id);
    if (!current) {
      return NextResponse.json({ ok: false, error: "Template not found" }, { status: 404 });
    }
    if (current.isBuiltIn) {
      return NextResponse.json(
        { ok: false, error: "Built-in templates cannot be deleted" },
        { status: 409 },
      );
    }

    const deleted = await deleteProposalTemplate(id);
    if (!deleted) {
      return NextResponse.json({ ok: false, error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}

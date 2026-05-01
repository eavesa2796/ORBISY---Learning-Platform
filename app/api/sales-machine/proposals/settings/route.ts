import { NextResponse } from "next/server";
import { authErrorToHttp, requireInternalUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_PROPOSAL_PRICING_SETTINGS,
  getProposalPricingSettings,
  normalizeProposalPricingSettings,
  type ProposalPricingSettings,
} from "@/lib/sales/proposals/settings";

export const runtime = "nodejs";

type SettingsPatchPayload = Partial<ProposalPricingSettings>;

export async function GET() {
  try {
    await requireInternalUser();
  } catch (error) {
    const auth = authErrorToHttp(error);
    if (auth) {
      return NextResponse.json(
        { ok: false, error: auth.message },
        { status: auth.status },
      );
    }
  }

  try {
    const settings = await getProposalPricingSettings();
    return NextResponse.json({ ok: true, settings });
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

export async function PUT(request: Request) {
  try {
    await requireInternalUser();
  } catch (error) {
    const auth = authErrorToHttp(error);
    if (auth) {
      return NextResponse.json(
        { ok: false, error: auth.message },
        { status: auth.status },
      );
    }
  }

  try {
    const payload = (await request.json()) as SettingsPatchPayload;
    const current = await getProposalPricingSettings();
    const next = normalizeProposalPricingSettings(payload, current);

    const saved = await prisma.salesProposalSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        defaultLaborCost: next.defaultLaborCost,
        defaultFinancingApr: next.defaultFinancingApr,
        defaultFinancingMonths: next.defaultFinancingMonths,
        defaultWarrantyGood: next.defaultWarrantyGood,
        defaultWarrantyBetter: next.defaultWarrantyBetter,
        defaultWarrantyBest: next.defaultWarrantyBest,
        permitFeeDefault: next.permitFeeDefault,
        taxRatePercent: next.taxRatePercent,
        companyProposalFooter: next.companyProposalFooter,
        proposalDisclaimer: next.proposalDisclaimer,
      },
      update: {
        defaultLaborCost: next.defaultLaborCost,
        defaultFinancingApr: next.defaultFinancingApr,
        defaultFinancingMonths: next.defaultFinancingMonths,
        defaultWarrantyGood: next.defaultWarrantyGood,
        defaultWarrantyBetter: next.defaultWarrantyBetter,
        defaultWarrantyBest: next.defaultWarrantyBest,
        permitFeeDefault: next.permitFeeDefault,
        taxRatePercent: next.taxRatePercent,
        companyProposalFooter: next.companyProposalFooter,
        proposalDisclaimer: next.proposalDisclaimer,
      },
    });

    return NextResponse.json({
      ok: true,
      settings: normalizeProposalPricingSettings(
        {
          defaultLaborCost: Number(saved.defaultLaborCost),
          defaultFinancingApr: saved.defaultFinancingApr,
          defaultFinancingMonths: saved.defaultFinancingMonths,
          defaultWarrantyGood: saved.defaultWarrantyGood,
          defaultWarrantyBetter: saved.defaultWarrantyBetter,
          defaultWarrantyBest: saved.defaultWarrantyBest,
          permitFeeDefault: Number(saved.permitFeeDefault),
          taxRatePercent: saved.taxRatePercent,
          companyProposalFooter: saved.companyProposalFooter,
          proposalDisclaimer: saved.proposalDisclaimer,
        },
        DEFAULT_PROPOSAL_PRICING_SETTINGS,
      ),
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

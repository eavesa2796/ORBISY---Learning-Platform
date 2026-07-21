import { prisma } from "@/lib/prisma";
export {
  DEFAULT_PROPOSAL_PRICING_SETTINGS,
  normalizeProposalPricingSettings,
  type ProposalPricingSettings,
} from "./settings-shared";
import {
  DEFAULT_PROPOSAL_PRICING_SETTINGS,
  normalizeProposalPricingSettings,
  type ProposalPricingSettings,
} from "./settings-shared";
export async function getProposalPricingSettings(): Promise<ProposalPricingSettings> {
  const row = await prisma.salesProposalSettings.findUnique({
    where: { id: "default" },
  });

  if (!row) {
    return DEFAULT_PROPOSAL_PRICING_SETTINGS;
  }

  return normalizeProposalPricingSettings({
    defaultLaborCost: Number(row.defaultLaborCost),
    defaultFinancingApr: row.defaultFinancingApr,
    defaultFinancingMonths: row.defaultFinancingMonths,
    defaultWarrantyGood: row.defaultWarrantyGood,
    defaultWarrantyBetter: row.defaultWarrantyBetter,
    defaultWarrantyBest: row.defaultWarrantyBest,
    permitFeeDefault: Number(row.permitFeeDefault),
    taxRatePercent: row.taxRatePercent,
    companyProposalFooter: row.companyProposalFooter,
    proposalDisclaimer: row.proposalDisclaimer,
  });
}

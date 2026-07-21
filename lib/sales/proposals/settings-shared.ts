export type ProposalPricingSettings = {
  defaultLaborCost: number;
  defaultFinancingApr: number;
  defaultFinancingMonths: number;
  defaultWarrantyGood: string;
  defaultWarrantyBetter: string;
  defaultWarrantyBest: string;
  permitFeeDefault: number;
  taxRatePercent: number;
  companyProposalFooter: string;
  proposalDisclaimer: string;
};

export const DEFAULT_PROPOSAL_PRICING_SETTINGS: ProposalPricingSettings = {
  defaultLaborCost: 1500,
  defaultFinancingApr: 8.99,
  defaultFinancingMonths: 120,
  defaultWarrantyGood: "10-year parts",
  defaultWarrantyBetter: "10-year parts + 2-year labor",
  defaultWarrantyBest: "10-year parts + 10-year labor",
  permitFeeDefault: 0,
  taxRatePercent: 0,
  companyProposalFooter:
    "Thank you for considering ORBISY for your HVAC project.",
  proposalDisclaimer:
    "Pricing and incentives are valid for 30 days unless otherwise noted. Final installation scope may require on-site verification. Financing is subject to lender approval.",
};

function clampNonNegativeNumber(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.max(0, value);
}

function normalizeNonEmptyString(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export function normalizeProposalPricingSettings(
  input: Partial<ProposalPricingSettings> | undefined,
  fallback: ProposalPricingSettings = DEFAULT_PROPOSAL_PRICING_SETTINGS,
): ProposalPricingSettings {
  return {
    defaultLaborCost: clampNonNegativeNumber(
      input?.defaultLaborCost,
      fallback.defaultLaborCost,
    ),
    defaultFinancingApr: clampNonNegativeNumber(
      input?.defaultFinancingApr,
      fallback.defaultFinancingApr,
    ),
    defaultFinancingMonths: Math.max(
      0,
      Math.round(
        clampNonNegativeNumber(
          input?.defaultFinancingMonths,
          fallback.defaultFinancingMonths,
        ),
      ),
    ),
    defaultWarrantyGood: normalizeNonEmptyString(
      input?.defaultWarrantyGood,
      fallback.defaultWarrantyGood,
    ),
    defaultWarrantyBetter: normalizeNonEmptyString(
      input?.defaultWarrantyBetter,
      fallback.defaultWarrantyBetter,
    ),
    defaultWarrantyBest: normalizeNonEmptyString(
      input?.defaultWarrantyBest,
      fallback.defaultWarrantyBest,
    ),
    permitFeeDefault: clampNonNegativeNumber(
      input?.permitFeeDefault,
      fallback.permitFeeDefault,
    ),
    taxRatePercent: clampNonNegativeNumber(
      input?.taxRatePercent,
      fallback.taxRatePercent,
    ),
    companyProposalFooter: normalizeNonEmptyString(
      input?.companyProposalFooter,
      fallback.companyProposalFooter,
    ),
    proposalDisclaimer: normalizeNonEmptyString(
      input?.proposalDisclaimer,
      fallback.proposalDisclaimer,
    ),
  };
}

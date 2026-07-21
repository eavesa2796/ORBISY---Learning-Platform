export type PricingMode = "FIXED_SELL_PRICE" | "COST_PLUS_MARGIN";
export type AddonType = "ADDON" | "DISCOUNT" | "REBATE";

export type ProposalAddonInput = {
  type: AddonType;
  amount: number;
};

export type CalculateProposalOptionInput = {
  equipmentCost: number;
  laborCost: number;
  permitFee?: number;
  taxRatePercent?: number;
  pricingMode: PricingMode;
  marginPercent?: number;
  sellPrice?: number;
  financingApr?: number;
  financingMonths?: number;
  addons?: ProposalAddonInput[];
};

export type ProposalOptionPricing = {
  equipmentCost: number;
  laborCost: number;
  permitFee: number;
  taxRatePercent: number;
  taxAmount: number;
  addonsTotal: number;
  discountsTotal: number;
  rebatesTotal: number;
  totalCost: number;
  preDiscountPrice: number;
  preTaxCustomerPrice: number;
  finalCustomerPrice: number;
  grossMarginAmount: number;
  grossMarginPercent: number;
  monthlyPaymentEstimate: number | null;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function sanitizeMoney(value: number | undefined): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value ?? 0);
}

function estimateMonthlyPayment(
  principal: number,
  apr?: number,
  months?: number,
): number | null {
  const n = months ?? 0;
  if (principal <= 0 || n <= 0) return null;

  const annualRate = apr ?? 0;
  if (annualRate <= 0) {
    return round2(principal / n);
  }

  const r = annualRate / 100 / 12;
  const pow = Math.pow(1 + r, n);
  const payment = (principal * r * pow) / (pow - 1);
  return round2(payment);
}

export function calculateProposalOptionPricing(
  input: CalculateProposalOptionInput,
): ProposalOptionPricing {
  const equipmentCost = sanitizeMoney(input.equipmentCost);
  const laborCost = sanitizeMoney(input.laborCost);
  const permitFee = sanitizeMoney(input.permitFee);
  const taxRatePercent = sanitizeMoney(input.taxRatePercent);
  const marginPercent = Math.max(0, input.marginPercent ?? 0);
  const addons = input.addons ?? [];

  const addonsTotal = round2(
    addons
      .filter((line) => line.type === "ADDON")
      .reduce((sum, line) => sum + sanitizeMoney(line.amount), 0),
  );
  const discountsTotal = round2(
    addons
      .filter((line) => line.type === "DISCOUNT")
      .reduce((sum, line) => sum + sanitizeMoney(line.amount), 0),
  );
  const rebatesTotal = round2(
    addons
      .filter((line) => line.type === "REBATE")
      .reduce((sum, line) => sum + sanitizeMoney(line.amount), 0),
  );

  const totalCost = round2(equipmentCost + laborCost + addonsTotal + permitFee);

  const preDiscountPrice =
    input.pricingMode === "FIXED_SELL_PRICE"
      ? round2(sanitizeMoney(input.sellPrice))
      : round2(totalCost * (1 + marginPercent / 100));

  const preTaxCustomerPrice = round2(
    Math.max(0, preDiscountPrice - discountsTotal - rebatesTotal),
  );
  const taxAmount = round2(preTaxCustomerPrice * (taxRatePercent / 100));
  const finalCustomerPrice = round2(preTaxCustomerPrice + taxAmount);

  // Margin is intentionally measured against pre-tax customer revenue.
  const grossMarginAmount = round2(preTaxCustomerPrice - totalCost);
  const grossMarginPercent =
    preTaxCustomerPrice > 0
      ? round2((grossMarginAmount / preTaxCustomerPrice) * 100)
      : 0;

  return {
    equipmentCost,
    laborCost,
    permitFee,
    taxRatePercent,
    taxAmount,
    addonsTotal,
    discountsTotal,
    rebatesTotal,
    totalCost,
    preDiscountPrice,
    preTaxCustomerPrice,
    finalCustomerPrice,
    grossMarginAmount,
    grossMarginPercent,
    monthlyPaymentEstimate: estimateMonthlyPayment(
      finalCustomerPrice,
      input.financingApr,
      input.financingMonths,
    ),
  };
}

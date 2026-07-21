import { buildInternalPublicProposalUrl } from "@/lib/sales/proposals/internal-list";

type DecimalLike = { toString(): string } | number;

export type AcceptedSummaryRecord = {
  id: string;
  publicToken: string;
  title: string;
  notes: string | null;
  status: "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "DECLINED";
  acceptedAt: Date | null;
  opportunity: { id: string; title: string };
  company: { id: string; name: string; slug: string };
  contact: {
    id: string;
    fullName: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  selectedOption: {
    id: string;
    tier: "GOOD" | "BETTER" | "BEST";
    title: string;
    summary: string | null;
    equipmentSnapshot: unknown;
    warrantyLabel: string | null;
    financingApr: number | null;
    financingMonths: number | null;
    monthlyPaymentEstimate: DecimalLike | null;
    equipmentCost: DecimalLike;
    laborCost: DecimalLike;
    addonsTotal: DecimalLike;
    discountsTotal: DecimalLike;
    rebatesTotal: DecimalLike;
    totalCost: DecimalLike;
    grossMarginAmount: DecimalLike;
    grossMarginPercent: number;
    finalCustomerPrice: DecimalLike;
    addonLines: Array<{
      id: string;
      type: "ADDON" | "DISCOUNT" | "REBATE";
      label: string;
      amount: DecimalLike;
    }>;
  } | null;
  events: Array<{
    id: string;
    eventType: string;
    occurredAt: Date;
    metadata: unknown;
  }>;
};

function toNumber(value: DecimalLike | null | undefined) {
  if (value === null || value === undefined) return null;
  return Number(value);
}

function equipmentLabel(snapshot: unknown) {
  if (!snapshot || typeof snapshot !== "object") return null;
  const raw = snapshot as Record<string, unknown>;
  const brand = typeof raw.brand === "string" ? raw.brand.trim() : "";
  const model = typeof raw.modelNumber === "string" ? raw.modelNumber.trim() : "";
  const equipmentType = typeof raw.equipmentType === "string" ? raw.equipmentType.trim() : "";
  const label = [brand, model, equipmentType].filter(Boolean).join(" ");
  return label || null;
}

export function serializeInternalAcceptedProposalSummary(
  proposal: AcceptedSummaryRecord,
  origin: string,
) {
  const selected = proposal.selectedOption;

  return {
    id: proposal.id,
    publicToken: proposal.publicToken,
    publicUrl: buildInternalPublicProposalUrl(origin, proposal.publicToken),
    title: proposal.title,
    notes: proposal.notes,
    status: proposal.status,
    acceptedAt: proposal.acceptedAt,
    opportunity: proposal.opportunity,
    company: proposal.company,
    contact: proposal.contact,
    selectedOption: selected
      ? {
          id: selected.id,
          tier: selected.tier,
          title: selected.title,
          summary: selected.summary,
          equipmentSnapshot: selected.equipmentSnapshot,
          equipmentLabel: equipmentLabel(selected.equipmentSnapshot),
          warrantyLabel: selected.warrantyLabel,
          financingApr: selected.financingApr,
          financingMonths: selected.financingMonths,
          monthlyPaymentEstimate: toNumber(selected.monthlyPaymentEstimate),
          equipmentCost: Number(selected.equipmentCost),
          laborCost: Number(selected.laborCost),
          addonsTotal: Number(selected.addonsTotal),
          discountsTotal: Number(selected.discountsTotal),
          rebatesTotal: Number(selected.rebatesTotal),
          totalCost: Number(selected.totalCost),
          grossMarginAmount: Number(selected.grossMarginAmount),
          grossMarginPercent: selected.grossMarginPercent,
          finalCustomerPrice: Number(selected.finalCustomerPrice),
          addonLines: selected.addonLines.map((line) => ({
            id: line.id,
            type: line.type,
            label: line.label,
            amount: Number(line.amount),
          })),
        }
      : null,
    timeline: proposal.events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      occurredAt: event.occurredAt,
      metadata: event.metadata,
    })),
  };
}

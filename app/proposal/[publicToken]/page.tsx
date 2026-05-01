"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  serializePublicProposalForPrint,
  type PublicPrintProposalInput,
} from "@/lib/sales/proposals/public-print";

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function percent(value: number) {
  return `${value.toFixed(2).replace(/\.00$/, "")}%`;
}

export default function PublicProposalPage() {
  const params = useParams<{ publicToken: string }>();
  const searchParams = useSearchParams();
  const publicToken = params.publicToken;
  const isPrintMode = searchParams.get("print") === "1";

  const [loading, setLoading] = useState(true);
  const [acceptingOptionId, setAcceptingOptionId] = useState<string | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [proposal, setProposal] = useState<PublicPrintProposalInput | null>(
    null,
  );

  useEffect(() => {
    if (!publicToken) return;

    const fetchProposal = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await fetch(`/api/proposals/${publicToken}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Unable to load proposal");
        setProposal(json.proposal);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unexpected error",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [publicToken]);

  const printModel = useMemo(() => {
    if (!proposal) return null;
    return serializePublicProposalForPrint(proposal);
  }, [proposal]);

  async function acceptOption(optionId: string) {
    if (!proposal || proposal.status === "DECLINED") return;

    setAcceptingOptionId(optionId);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/proposals/${proposal.publicToken}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to accept option");

      setProposal((prev) =>
        prev
          ? {
              ...prev,
              status: json.proposal.status,
              selectedOptionId: json.proposal.selectedOptionId,
            }
          : prev,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unexpected error",
      );
    } finally {
      setAcceptingOptionId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-[linear-gradient(180deg,#e9f4ff,#f6f9fc)]">
        <p className="max-w-6xl mx-auto text-slate-600">Loading proposal...</p>
      </div>
    );
  }

  if (errorMessage || !proposal) {
    return (
      <div className="min-h-screen p-8 bg-[linear-gradient(180deg,#e9f4ff,#f6f9fc)]">
        <div className="max-w-4xl mx-auto rounded-xl border border-slate-300 bg-white p-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Proposal unavailable
          </h1>
          <p className="mt-2 text-slate-600">
            {errorMessage || "This proposal could not be loaded."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isPrintMode
          ? "proposal-print-root bg-white p-2 md:p-4"
          : "bg-[radial-gradient(circle_at_top_right,#dbeafe,#f8fafc_55%)] p-6 md:p-10"
      }`}
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-2xl border border-slate-300 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                HVAC Replacement Proposal
              </p>
              <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-slate-900">
                {proposal.title}
              </h1>
            </div>
            <div className="text-right text-sm text-slate-600">
              <p className="font-semibold text-slate-900">
                {proposal.company?.name || "ORBISY"}
              </p>
              <p>Prepared by ORBISY Sales Team</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-700 md:grid-cols-2">
            <p>
              Customer:{" "}
              {proposal.contact?.fullName ||
                proposal.contact?.email ||
                "Homeowner"}
            </p>
            <p>Company: {proposal.company?.name || "-"}</p>
            <p>Contact email: {proposal.contact?.email || "-"}</p>
            <p>Contact phone: {proposal.contact?.phone || "-"}</p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-700 md:grid-cols-2">
            <p>Status: {proposal.status}</p>
            <p>
              Accepted at:{" "}
              {proposal.acceptedAt
                ? new Date(proposal.acceptedAt).toLocaleString()
                : "-"}
            </p>
          </div>
          {proposal.notes && (
            <p className="mt-4 text-slate-700">{proposal.notes}</p>
          )}

          <div className="no-print mt-4 flex flex-wrap gap-3">
            <a
              href={`/proposal/${proposal.publicToken}?print=1`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Open Print View
            </a>
            <button
              onClick={() => window.print()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Print / Save PDF
            </button>
          </div>
        </header>

        {errorMessage && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {errorMessage}
          </div>
        )}

        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {printModel?.sortedOptions.map((option) => {
            const canAccept =
              proposal.status !== "ACCEPTED" && proposal.status !== "DECLINED";

            return (
              <article
                key={option.id}
                className={`proposal-print-card rounded-2xl border p-5 md:p-6 transition ${
                  option.isSelected
                    ? "border-emerald-400 bg-emerald-50/60"
                    : option.tier === "BETTER"
                      ? "border-blue-500 bg-blue-50/70"
                      : "border-slate-300 bg-white"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {option.tier}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  {option.title}
                </h2>
                {option.summary && (
                  <p className="mt-2 text-sm text-slate-600">
                    {option.summary}
                  </p>
                )}

                <p className="mt-4 text-3xl font-bold text-slate-900">
                  {currency(option.finalCustomerPrice)}
                </p>
                {option.monthlyPaymentEstimate && (
                  <p className="mt-1 text-sm text-slate-600">
                    Approx. {currency(option.monthlyPaymentEstimate)}/mo
                    {option.financingMonths
                      ? ` for ${option.financingMonths} months`
                      : ""}
                  </p>
                )}

                {option.equipmentSnapshot && (
                  <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                    <p className="font-medium text-slate-900">Equipment</p>
                    <p>{option.equipmentLabel || "-"}</p>
                    {option.equipmentSnapshot.efficiencyRating && (
                      <p>
                        Efficiency: {option.equipmentSnapshot.efficiencyRating}
                      </p>
                    )}
                  </div>
                )}

                {option.warrantyLabel && (
                  <p className="mt-3 text-sm text-slate-700">
                    Warranty: {option.warrantyLabel}
                  </p>
                )}

                {option.addonLines.length > 0 && (
                  <div className="mt-3 space-y-1 text-sm text-slate-600">
                    {option.addonLines.map((line) => (
                      <div
                        key={line.id}
                        className="flex items-center justify-between"
                      >
                        <span>{line.label}</span>
                        <span>
                          {line.type === "DISCOUNT" || line.type === "REBATE"
                            ? "-"
                            : ""}
                          {currency(line.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                  <p className="font-medium text-slate-900">Price Breakdown</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Base package</span>
                      <span>
                        {currency(
                          option.priceBreakdown.basePriceBeforeAdjustments,
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Add-ons</span>
                      <span>{currency(option.priceBreakdown.addonsTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Discounts</span>
                      <span>
                        -{currency(option.priceBreakdown.discountsTotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Rebates</span>
                      <span>
                        -{currency(option.priceBreakdown.rebatesTotal)}
                      </span>
                    </div>
                    {option.priceBreakdown.permitFee > 0 && (
                      <div className="flex items-center justify-between">
                        <span>Permit / Fees</span>
                        <span>{currency(option.priceBreakdown.permitFee)}</span>
                      </div>
                    )}
                    {option.priceBreakdown.taxAmount > 0 && (
                      <div className="flex items-center justify-between">
                        <span>
                          Tax ({percent(option.priceBreakdown.taxRatePercent)})
                        </span>
                        <span>{currency(option.priceBreakdown.taxAmount)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>Final Price</span>
                      <span>
                        {currency(option.priceBreakdown.finalCustomerPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {option.isSelected ? (
                  <div className="mt-5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                    Accepted option
                  </div>
                ) : !isPrintMode && proposal.status !== "ACCEPTED" ? (
                  <button
                    onClick={() => acceptOption(option.id)}
                    disabled={!canAccept || acceptingOptionId === option.id}
                    className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {acceptingOptionId === option.id
                      ? "Accepting..."
                      : "Accept this option"}
                  </button>
                ) : null}
              </article>
            );
          })}
        </section>

        <footer className="rounded-xl border border-slate-300 bg-white p-4 text-xs text-slate-600">
          {proposal.proposalDisclaimer && <p>{proposal.proposalDisclaimer}</p>}
          {proposal.companyProposalFooter && (
            <p className="mt-2">{proposal.companyProposalFooter}</p>
          )}
        </footer>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";

type SummaryResponse = {
  metrics: {
    totalCompanies: number;
    qualifiedCompanies: number;
    totalMessages: number;
    repliedMessages: number;
    readyMessages: number;
    byStatus: Record<string, number>;
  };
};

type RankedLead = {
  companyId: string;
  companyName: string;
  score: number;
  qualified: boolean;
};

export default function ConsolePage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryResponse["metrics"] | null>(
    null,
  );
  const [topLeads, setTopLeads] = useState<RankedLead[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [summaryRes, leadsRes] = await Promise.all([
        fetch("/api/sales-machine/outreach/summary"),
        fetch("/api/sales-machine/leads/ranked?minScore=0&limit=8"),
      ]);

      const summaryJson = await summaryRes.json();
      const leadsJson = await leadsRes.json();

      if (summaryRes.ok) setSummary(summaryJson.metrics);
      if (leadsRes.ok) setTopLeads(leadsJson.leads || []);
    } finally {
      setLoading(false);
    }
  }

  const conversion = useMemo(() => {
    if (!summary || summary.totalMessages === 0) return 0;
    return Math.round((summary.readyMessages / summary.totalMessages) * 100);
  }, [summary]);

  if (loading) {
    return (
      <p className="text-[color:var(--muted)]">Loading command center...</p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[color:var(--text)]">
            Command Center
          </h1>
          <p className="text-[color:var(--muted)] mt-2">
            One-screen operating view for lead generation, outreach, and booked
            calls.
          </p>
        </div>
        <a
          href="/console/pipeline"
          className="rounded-xl border border-transparent bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-5 py-3 font-semibold text-[#001] hover:opacity-90"
        >
          Open Pipeline
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <MetricCard title="Prospects" value={summary?.totalCompanies ?? 0} />
        <MetricCard
          title="Qualified"
          value={summary?.qualifiedCompanies ?? 0}
        />
        <MetricCard title="Outreach Sent" value={summary?.totalMessages ?? 0} />
        <MetricCard title="Replies" value={summary?.repliedMessages ?? 0} />
        <MetricCard title="Ready" value={summary?.readyMessages ?? 0} />
      </div>

      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] p-6">
        <h2 className="text-xl font-semibold text-[color:var(--text)]">
          Current funnel efficiency
        </h2>
        <p className="text-[color:var(--muted)] mt-2">
          Booked rate from total outreach:{" "}
          <span className="text-[color:var(--accent)] font-bold">
            {conversion}%
          </span>
          Ready rate from total outreach:{" "}
          <span className="text-[color:var(--accent)] font-bold">
            {conversion}%
          </span>
        </p>
        <p className="text-sm text-[color:var(--muted)] mt-2">
          Focus target: push reply rate and booking rate with better
          personalization + tighter follow-up.
        </p>
      </div>

      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] p-6">
        <h2 className="text-xl font-semibold text-[color:var(--text)] mb-4">
          Top scored prospects
        </h2>
        {topLeads.length === 0 ? (
          <p className="text-[color:var(--muted)]">
            No prospects imported yet.
          </p>
        ) : (
          <div className="space-y-3">
            {topLeads.map((lead) => (
              <div
                key={lead.companyId}
                className="flex items-center justify-between rounded-lg border border-[color:var(--border)] bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-[color:var(--text)]">
                    {lead.companyName}
                  </p>
                  <p className="text-xs text-[color:var(--muted)]">
                    {lead.qualified ? "Qualified" : "Needs review"}
                  </p>
                </div>
                <p className="font-bold text-[color:var(--accent)]">
                  {lead.score}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] p-5">
      <p className="text-sm text-[color:var(--muted)]">{title}</p>
      <p className="text-3xl font-bold text-[color:var(--text)] mt-2">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

import { Metadata } from "next";
import { notFound } from "next/navigation";
import CalendlyButton from "@/components/CalendlyButton";

export const runtime = "nodejs";

type Leak = {
  title: string;
  description: string;
  impact: string;
};

type AuditData = {
  company: {
    id: string;
    slug: string;
    name: string;
    website?: string | null;
    phone?: string | null;
    city?: string | null;
    state?: string | null;
    rating?: number | null;
    reviewCount?: number | null;
  };
  score: {
    total: number;
    qualified: boolean;
    explanation: string;
  } | null;
  leaks: Leak[];
  missedRevenue: string;
  generatedAt: string;
};

async function getAudit(slug: string): Promise<AuditData | null> {
  const baseUrl =
    process.env.NEXT_PUBLIC_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const res = await fetch(`${baseUrl}/api/audit/${slug}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) return null;
  return res.json() as Promise<AuditData>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const audit = await getAudit(slug);

  if (!audit) {
    return { title: "Audit Not Found | ORBISY" };
  }

  return {
    title: `${audit.company.name} — Free HVAC Revenue Audit | ORBISY`,
    description: `We found ${audit.leaks.length} revenue leak${audit.leaks.length !== 1 ? "s" : ""} at ${audit.company.name} costing an estimated ${audit.missedRevenue} in missed HVAC jobs.`,
  };
}

export default async function AuditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const audit = await getAudit(slug);

  if (!audit) notFound();

  const { company, leaks, missedRevenue } = audit;
  const location = [company.city, company.state].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <span className="text-xl font-bold tracking-tight text-[#FF6B35]">
          ORBISY
        </span>
        <span className="text-sm text-white/50">Free HVAC Revenue Audit</span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-12">
          <p className="text-[#FF6B35] text-sm font-semibold uppercase tracking-widest mb-3">
            Personalized Audit
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            {company.name} is losing an estimated{" "}
            <span className="text-[#FF6B35]">{missedRevenue}</span> in missed
            HVAC jobs.
          </h1>
          <p className="text-lg text-white/60">
            We scanned <strong className="text-white">{company.name}</strong>
            {location ? ` in ${location}` : ""} and found{" "}
            <strong className="text-white">
              {leaks.length} revenue leak{leaks.length !== 1 ? "s" : ""}
            </strong>{" "}
            you can plug this week without hiring more staff.
          </p>
          {company.website && (
            <p className="mt-2 text-sm text-white/40">
              Audited site:{" "}
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white/70 transition-colors"
              >
                {company.website.replace(/^https?:\/\//, "")}
              </a>
            </p>
          )}
        </div>

        {/* Lead Leaks */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-6">
            {leaks.length} Revenue Leaks Found
          </h2>
          <div className="space-y-5">
            {leaks.map((leak, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{leak.title}</h3>
                    <p className="text-white/60 text-sm mb-3">
                      {leak.description}
                    </p>
                    <span className="inline-block rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-1 font-medium">
                      {leak.impact}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What ORBISY installs */}
        <section className="mb-14 rounded-xl border border-[#FF6B35]/30 bg-[#FF6B35]/5 p-8">
          <h2 className="text-2xl font-bold mb-4">
            What ORBISY installs to plug these leaks
          </h2>
          <ul className="space-y-3 text-white/70">
            {[
              "Missed-call text-back — replies in 60 seconds so no lead slips away",
              "Instant lead response — web form leads get a text within 90 seconds",
              "Estimate follow-up sequences — automated nudges that close 20–40% more",
              "After-hours capture — books leads while you sleep",
              "Review request automation — grows your Google star count on autopilot",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[#FF6B35] mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Social proof / ratings */}
        {company.rating && company.reviewCount ? (
          <section className="mb-14 text-center">
            <p className="text-white/50 text-sm mb-1">Current Google profile</p>
            <p className="text-3xl font-bold text-[#FF6B35]">
              {company.rating.toFixed(1)} ★
            </p>
            <p className="text-white/40 text-sm">
              {company.reviewCount} review{company.reviewCount !== 1 ? "s" : ""}
            </p>
            <p className="mt-3 text-white/60 text-sm">
              Most HVAC companies with a strong review process reach 4.7+ within
              90 days.
            </p>
          </section>
        ) : null}

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Want us to fix this for {company.name}?
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto">
            Book a free 20-minute call. We'll walk through exactly what we'd
            install, what it costs, and what ROI to expect in 30 days.
          </p>
          <CalendlyButton className="inline-block rounded-xl bg-[#FF6B35] px-8 py-4 text-lg font-bold text-white hover:bg-[#e55a24] transition-colors">
            Book My Free Audit Call
          </CalendlyButton>
          <p className="mt-4 text-xs text-white/30">
            No credit card. No obligation. HVAC companies only.
          </p>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-white/30 text-sm">
        <p>© {new Date().getFullYear()} ORBISY. All rights reserved.</p>
        <p className="mt-1">
          This audit was generated automatically based on your public business
          profile.
        </p>
      </footer>
    </div>
  );
}

import { Metadata } from "next";
import Image from "next/image";
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
    <div className="min-h-screen text-[color:var(--text)] antialiased bg-[linear-gradient(180deg,var(--bg),#0a0f1b_40%,#090d17)]">
      {/* Header */}
      <header className="border-b border-[color:var(--border)] px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <a href="/" className="flex items-center gap-3 no-underline">
          <span className="sr-only">ORBISY</span>
          <Image
            src="/orbisy-logo.png"
            alt="ORBISY"
            width={220}
            height={68}
            priority
            className="h-12 w-auto"
          />
        </a>
        <span className="text-sm text-[color:var(--muted)]">
          Free HVAC Revenue Audit
        </span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-12">
          <p className="text-[color:var(--accent)] text-sm font-semibold uppercase tracking-widest mb-3">
            Personalized Audit
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            {company.name} is losing an estimated{" "}
            <span className="text-[color:var(--accent)]">{missedRevenue}</span>{" "}
            in missed HVAC jobs.
          </h1>
          <p className="text-lg text-[color:var(--muted)]">
            We scanned{" "}
            <strong className="text-[color:var(--text)]">{company.name}</strong>
            {location ? ` in ${location}` : ""} and found{" "}
            <strong className="text-[color:var(--text)]">
              {leaks.length} revenue leak{leaks.length !== 1 ? "s" : ""}
            </strong>{" "}
            you can plug this week without hiring more staff.
          </p>
          {company.website && (
            <p className="mt-2 text-sm text-[color:var(--muted)]/70">
              Audited site:{" "}
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[color:var(--text)] transition-colors"
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
                className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[color:var(--accent)]/20 text-[color:var(--accent)] flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{leak.title}</h3>
                    <p className="text-[color:var(--muted)] text-sm mb-3">
                      {leak.description}
                    </p>
                    <span className="inline-block rounded-full bg-[color:var(--accent)]/10 border border-[color:var(--accent)]/30 text-[color:var(--accent)] text-xs px-3 py-1 font-medium">
                      {leak.impact}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What ORBISY installs */}
        <section className="mb-14 rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] p-8">
          <h2 className="text-2xl font-bold mb-4">
            What ORBISY installs to plug these leaks
          </h2>
          <ul className="space-y-3 text-[color:var(--muted)]">
            {[
              "Missed-call text-back — replies in 60 seconds so no lead slips away",
              "Instant lead response — web form leads get a text within 90 seconds",
              "Estimate follow-up sequences — automated nudges that close 20–40% more",
              "After-hours capture — books leads while you sleep",
              "Review request automation — grows your Google star count on autopilot",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[color:var(--accent)] mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Social proof / ratings */}
        {company.rating && company.reviewCount ? (
          <section className="mb-14 text-center">
            <p className="text-[color:var(--muted)] text-sm mb-1">
              Current Google profile
            </p>
            <p className="text-3xl font-bold text-[color:var(--accent)]">
              {company.rating.toFixed(1)} ★
            </p>
            <p className="text-[color:var(--muted)]/80 text-sm">
              {company.reviewCount} review{company.reviewCount !== 1 ? "s" : ""}
            </p>
            <p className="mt-3 text-[color:var(--muted)] text-sm">
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
          <p className="text-[color:var(--muted)] mb-8 max-w-lg mx-auto">
            Book a free 20-minute call. We'll walk through exactly what we'd
            install, what it costs, and what ROI to expect in 30 days.
          </p>
          <CalendlyButton className="inline-block rounded-xl border border-transparent bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-8 py-4 text-lg font-bold text-[#001] hover:opacity-90 transition-opacity">
            Book My Free Audit Call
          </CalendlyButton>
          <p className="mt-4 text-xs text-[color:var(--muted)]/70">
            No credit card. No obligation. HVAC companies only.
          </p>
        </section>
      </main>

      <footer className="border-t border-[color:var(--border)] py-8 text-center text-[color:var(--muted)]/80 text-sm">
        <p>© {new Date().getFullYear()} ORBISY. All rights reserved.</p>
        <p className="mt-1">
          This audit was generated automatically based on your public business
          profile.
        </p>
      </footer>
    </div>
  );
}

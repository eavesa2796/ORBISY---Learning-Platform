"use client";

import React, { useState } from "react";
import CalendlyButton from "@/components/CalendlyButton";
import Image from "next/image";

const faqItems = [
  {
    q: "How fast can you get the system installed?",
    a: "Most clients are fully live within 3 weeks. Week 1 is the audit, Week 2 is installation, Week 3 is testing and optimization. After that we run monthly improvements.",
  },
  {
    q: "Do I need to replace my phone system or software?",
    a: "No. We work with your existing phone number, website, and tools. There is no software for your team to learn and no disruption to how you run the business today.",
  },
  {
    q: "What if my team is already stretched thin?",
    a: "That is exactly who this is built for. The whole point is to reduce the burden on your office staff, not add to it. The system responds, follows up, and tracks leads automatically.",
  },
  {
    q: "Is this just another software subscription I have to manage?",
    a: "No. ORBISY is a done-for-you service. We set everything up, monitor it, and send you a monthly report. You are not managing software — you are seeing more booked jobs.",
  },
  {
    q: "What makes a company a good fit?",
    a: "Residential HVAC companies with 5–20 technicians doing at least $500k per year in revenue. You are busy, you are growing, and you are losing jobs because calls get missed, estimates go unfollowed, or leads scatter across phones and inboxes.",
  },
  {
    q: "What if I do not see results?",
    a: "If you do not see a measurable increase in booked jobs within 60 days, we work for free until you do. That is our guarantee.",
  },
];

export default function Homepage() {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<null | "ok" | "error">(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setStatus(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      businessName: String(formData.get("businessName") || ""),
      email: String(formData.get("email") || ""),
      message: String(formData.get("message") || ""),
      website: String(formData.get("website") || ""),
    };

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSending(false);

    if (res.ok) {
      setStatus("ok");
      form.reset();
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen text-[color:var(--text)] antialiased bg-[linear-gradient(180deg,var(--bg),#0a0f1b_40%,#090d17)]">
      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav className="mx-auto max-w-[1100px] px-5 pt-5 pb-2">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 no-underline">
            <span className="sr-only">ORBISY</span>
            <Image
              src="/orbisy-logo.png"
              alt="ORBISY"
              width={260}
              height={80}
              priority
              className="h-14 w-auto sm:h-16"
            />
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href="#system"
              className="rounded-full border border-[color:var(--border)] bg-white/5 px-4 py-2 text-sm font-semibold text-[color:var(--text)] hover:bg-white/10 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#packages"
              className="rounded-full border border-[color:var(--border)] bg-white/5 px-4 py-2 text-sm font-semibold text-[color:var(--text)] hover:bg-white/10 transition-colors"
            >
              Packages
            </a>
            <a
              href="/login"
              className="rounded-full border border-[color:var(--border)] bg-white/5 px-4 py-2 text-sm font-semibold text-[color:var(--text)] hover:bg-white/10 transition-colors"
            >
              Login
            </a>
            <CalendlyButton className="cursor-pointer rounded-full border border-transparent bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-5 py-2 text-sm font-bold text-[#001] hover:opacity-90 transition-opacity">
              Book Free Audit
            </CalendlyButton>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-lg border border-[color:var(--border)] bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <span
              className={`block w-5 h-0.5 bg-[color:var(--text)] transition-all ${mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-[color:var(--text)] mt-1 transition-all ${mobileMenuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-[color:var(--text)] mt-1 transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
            />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] p-4 space-y-2">
            <a
              href="#system"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-[color:var(--text)] hover:bg-white/5 font-semibold"
            >
              How It Works
            </a>
            <a
              href="#packages"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-[color:var(--text)] hover:bg-white/5 font-semibold"
            >
              Packages
            </a>
            <a
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-[color:var(--text)] hover:bg-white/5 font-semibold"
            >
              Login
            </a>
            <CalendlyButton className="cursor-pointer w-full block text-center px-4 py-3 rounded-lg bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-[#001] font-bold hover:opacity-90">
              Book Free Audit
            </CalendlyButton>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <header className="mx-auto max-w-[1100px] px-5 pt-12 pb-16 text-center">
        <div className="inline-block rounded-full border border-[color:var(--border)] bg-white/5 px-4 py-1.5 text-xs font-bold tracking-[.14em] uppercase text-[color:var(--muted)] mb-5">
          For Residential HVAC Companies · 5–20 Techs · $500k+ Revenue
        </div>

        <h1 className="text-[clamp(30px,4.5vw,52px)] leading-[1.08] font-extrabold tracking-tight max-w-[18ch] mx-auto">
          Stop Losing HVAC Jobs to{" "}
          <span className="bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] bg-clip-text text-transparent">
            Missed Calls and Slow Follow-Up
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-[64ch] text-lg text-[color:var(--muted)] leading-relaxed">
          ORBISY installs missed-call text-back, instant lead response, estimate
          follow-up, and booking tracking for growing HVAC companies — so you
          book more jobs from the leads you already have.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <CalendlyButton className="cursor-pointer inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-bold text-base bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-[#001] hover:opacity-90 transition-opacity shadow-[0_4px_24px_rgba(101,214,255,0.25)]">
            Book a Free HVAC Revenue Audit →
          </CalendlyButton>
          <a
            href="#system"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-bold text-base border border-[color:var(--border)] bg-white/5 text-[color:var(--text)] hover:bg-white/10 transition-colors"
          >
            See What We Fix
          </a>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-[color:var(--muted)]">
          {["No software to learn", "Live in 3 weeks", "60-day guarantee"].map(
            (t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="text-[color:var(--accent-2)]">✓</span> {t}
              </span>
            ),
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-5 pb-20 space-y-16">
        {/* ── PAIN SECTION ─────────────────────────────────────────── */}
        <section>
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)] p-8 md:p-10">
            <div className="text-xs font-bold tracking-[.14em] uppercase text-[color:var(--muted)] mb-3">
              The Problem
            </div>
            <h2 className="text-[clamp(22px,3.2vw,34px)] font-extrabold leading-tight max-w-[30ch]">
              Most HVAC companies do not need more leads first. They need to
              stop losing the ones they already paid for.
            </h2>
            <p className="mt-4 text-[color:var(--muted)] max-w-[70ch]">
              Every missed call, unanswered web form, and unfinished estimate
              follow-up is a job that goes to your competitor. Not because you
              lack customers — but because revenue is leaking out of your
              process before it ever reaches your dispatcher.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: "📵",
                  title: "Missed calls during peak hours",
                  desc: "Techs are on jobs. Office staff are on other calls. Customers call the next HVAC company. You never know it happened.",
                },
                {
                  icon: "🌙",
                  title: "After-hours requests go cold",
                  desc: "A homeowner's AC breaks at 9pm. They fill out your form or call. Nobody responds until morning — and they've already booked someone else.",
                },
                {
                  icon: "📋",
                  title: "Estimates sent, never followed up",
                  desc: "You send a quote and wait. The customer wanted the job done — they just needed one more touchpoint. Your competitor followed up. You didn't.",
                },
                {
                  icon: "📥",
                  title: "Website leads sit in inboxes",
                  desc: "Web forms go to an email account nobody monitors closely. A lead that came in at noon gets a reply at 4pm — or not at all.",
                },
                {
                  icon: "📊",
                  title: "No visibility from lead to booked job",
                  desc: "You have no clear picture of how many calls came in, how many turned into estimates, or how many turned into work orders.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-[color:var(--border)] bg-white/5 p-5"
                >
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-base mb-1.5">{item.title}</h3>
                  <p className="text-[color:var(--muted)] text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SYSTEM SECTION ───────────────────────────────────────── */}
        <section id="system">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)] p-8 md:p-10">
            <div className="text-xs font-bold tracking-[.14em] uppercase text-[color:var(--muted)] mb-3">
              The System
            </div>
            <h2 className="text-[clamp(22px,3.2vw,34px)] font-extrabold leading-tight">
              The ORBISY HVAC Revenue Recovery System
            </h2>
            <p className="mt-4 text-[color:var(--muted)] max-w-[70ch]">
              ORBISY captures every lead, responds instantly, follows up
              consistently, and tracks every opportunity from first contact to
              booked job — without hiring more office staff.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  num: "01",
                  title: "Missed-Call Text-Back",
                  desc: "When a call goes unanswered, an automatic text goes out within seconds. Customers stay in your pipeline instead of calling the next company on Google.",
                },
                {
                  num: "02",
                  title: "Instant Web Lead Response",
                  desc: "Every form submission on your website gets an immediate reply — SMS or email — confirming receipt and setting the next step. No more cold leads from slow replies.",
                },
                {
                  num: "03",
                  title: "Estimate Follow-Up Sequence",
                  desc: "Quotes that don't close get a structured follow-up over days and weeks — until the customer books, declines, or asks for a call. Nothing falls through.",
                },
                {
                  num: "04",
                  title: "Review Request Automation",
                  desc: "After a completed job, customers automatically get a review request at the right time. More 5-star reviews without your team remembering to ask.",
                },
                {
                  num: "05",
                  title: "Booking Pipeline Dashboard",
                  desc: "One simple view shows calls missed, leads captured, follow-ups sent, and jobs booked. You see exactly where revenue is being recovered — and where it's still leaking.",
                },
                {
                  num: "06",
                  title: "Monthly Performance Report",
                  desc: "Every month you get a clear report: leads in, jobs booked, estimated revenue recovered. No guesswork about whether the system is working.",
                },
              ].map((item) => (
                <div
                  key={item.num}
                  className="rounded-xl border border-[color:var(--border)] bg-white/5 p-5"
                >
                  <div className="text-xs font-bold text-[color:var(--accent)] tracking-[.12em] mb-2">
                    {item.num}
                  </div>
                  <h3 className="font-bold text-base mb-2">{item.title}</h3>
                  <p className="text-[color:var(--muted)] text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-[color:var(--border)] bg-white/[0.03] p-6 flex flex-col md:flex-row md:items-center gap-5">
              <div className="flex-1">
                <h3 className="font-bold text-lg">
                  The result: more booked jobs from leads you already have
                </h3>
                <p className="mt-2 text-[color:var(--muted)] text-sm">
                  Clients typically see a 20–40% increase in booked jobs within
                  60 days — not from spending more on ads, but from stopping the
                  revenue that was already leaking out.
                </p>
              </div>
              <CalendlyButton className="cursor-pointer shrink-0 inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-[#001] hover:opacity-90 transition-opacity whitespace-nowrap">
                Book a Free Audit →
              </CalendlyButton>
            </div>
          </div>
        </section>

        {/* ── PACKAGES ─────────────────────────────────────────────── */}
        <section id="packages">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)] p-8 md:p-10">
            <div className="text-xs font-bold tracking-[.14em] uppercase text-[color:var(--muted)] mb-3">
              Packages
            </div>
            <h2 className="text-[clamp(22px,3.2vw,34px)] font-extrabold leading-tight mb-2">
              One system, three levels of coverage
            </h2>
            <p className="text-[color:var(--muted)] max-w-[60ch]">
              Start where you need to. Every package is done-for-you —
              installed, monitored, and optimized by ORBISY.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  name: "Starter",
                  tagline: "Stop losing leads immediately",
                  cta: "Get Pricing",
                  features: [
                    "Missed-call text-back",
                    "Instant web form reply",
                    "Simple booking dashboard",
                    "Email support",
                  ],
                  highlight: false,
                },
                {
                  name: "Growth",
                  tagline: "Convert and close more jobs",
                  cta: "Get Pricing",
                  features: [
                    "Everything in Starter",
                    "Estimate follow-up sequence",
                    "Review request automation",
                    "Monthly performance report",
                    "Priority support",
                  ],
                  highlight: true,
                },
                {
                  name: "Premium",
                  tagline: "Full revenue recovery system",
                  cta: "Get Pricing",
                  features: [
                    "Everything in Growth",
                    "Landing page / website improvements",
                    "CRM integration",
                    "Call tracking & attribution",
                    "Quarterly strategy review",
                    "Dedicated account manager",
                  ],
                  highlight: false,
                },
              ].map((pkg) => (
                <div
                  key={pkg.name}
                  className={`rounded-xl border p-6 flex flex-col ${
                    pkg.highlight
                      ? "border-[color:var(--accent)] bg-[color:var(--accent)]/5 shadow-[0_0_32px_rgba(101,214,255,0.08)]"
                      : "border-[color:var(--border)] bg-white/5"
                  }`}
                >
                  {pkg.highlight && (
                    <div className="text-[10px] font-bold tracking-[.14em] uppercase text-[color:var(--accent)] mb-3">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-extrabold">{pkg.name}</h3>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">
                    {pkg.tagline}
                  </p>
                  <div className="mt-4 mb-5 border-b border-[color:var(--border)]" />
                  <ul className="space-y-2.5 flex-1">
                    {pkg.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm text-[color:var(--muted)]"
                      >
                        <span className="text-[color:var(--accent-2)] mt-0.5">
                          ✓
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <CalendlyButton
                    className={`cursor-pointer mt-6 w-full inline-flex items-center justify-center rounded-xl px-4 py-3 font-bold text-sm transition-opacity hover:opacity-90 ${
                      pkg.highlight
                        ? "bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-[#001]"
                        : "border border-[color:var(--border)] bg-white/5 text-[color:var(--text)]"
                    }`}
                  >
                    {pkg.cta} →
                  </CalendlyButton>
                </div>
              ))}
            </div>

            <p className="mt-5 text-center text-sm text-[color:var(--muted)]">
              Not sure which fits?{" "}
              <CalendlyButton className="cursor-pointer inline text-[color:var(--accent)] underline underline-offset-2 bg-transparent border-none font-semibold">
                Book a free audit
              </CalendlyButton>{" "}
              and we will recommend the right starting point.
            </p>
          </div>
        </section>

        {/* ── INSTALLATION PROCESS ─────────────────────────────────── */}
        <section id="installation">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)] p-8 md:p-10">
            <div className="text-xs font-bold tracking-[.14em] uppercase text-[color:var(--muted)] mb-3">
              Installation
            </div>
            <h2 className="text-[clamp(22px,3.2vw,34px)] font-extrabold leading-tight mb-2">
              Live in 3 weeks. No disruption to your team.
            </h2>
            <p className="text-[color:var(--muted)] max-w-[64ch]">
              We do the work. Your team keeps dispatching, quoting, and running
              jobs. Here is how it works:
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  week: "Week 1",
                  title: "Audit",
                  desc: "We review your current lead flow: calls, website forms, booking process, follow-up habits, and estimate pipeline. We identify exactly where jobs are being lost.",
                },
                {
                  week: "Week 2",
                  title: "Install",
                  desc: "We install and configure missed-call text-back, web lead response, estimate follow-up sequences, and your dashboard. Nothing for your team to set up.",
                },
                {
                  week: "Week 3",
                  title: "Test & Train",
                  desc: "We run every trigger, test every message, confirm routing, and walk your office staff through the dashboard in one 30-minute call.",
                },
                {
                  week: "Ongoing",
                  title: "Report & Improve",
                  desc: "Monthly performance reports show leads in, jobs booked, and revenue recovered. We continuously optimize based on your data.",
                },
              ].map((step) => (
                <div
                  key={step.week}
                  className="rounded-xl border border-[color:var(--border)] bg-white/5 p-5"
                >
                  <div className="text-xs font-bold text-[color:var(--accent)] tracking-[.12em] uppercase mb-1">
                    {step.week}
                  </div>
                  <h3 className="font-bold text-base mb-2">{step.title}</h3>
                  <p className="text-[color:var(--muted)] text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHO IT'S FOR ─────────────────────────────────────────── */}
        <section id="who">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)] p-8 md:p-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="text-xs font-bold tracking-[.14em] uppercase text-[color:var(--muted)] mb-3">
                  Who It Is For
                </div>
                <h2 className="text-[clamp(22px,3.2vw,34px)] font-extrabold leading-tight">
                  Built for owner-led HVAC companies that are growing fast and
                  losing jobs to slow process
                </h2>
                <p className="mt-4 text-[color:var(--muted)]">
                  You are not too small and you are not too big. You have a
                  solid team, real revenue, and real demand. The problem is not
                  marketing — it is that your lead-to-booking process has gaps
                  your team does not have time to fix manually.
                </p>
                <CalendlyButton className="cursor-pointer mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-[#001] hover:opacity-90 transition-opacity">
                  See If You Qualify →
                </CalendlyButton>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-sm text-[color:var(--muted)] uppercase tracking-widest">
                  Good fit if you…
                </h3>
                {[
                  "Run 5–20 technicians on residential service, installs, or both",
                  "Are doing at least $500k per year in revenue",
                  "Miss calls during busy seasons, lunch hours, or after hours",
                  "Send estimates but follow-up is inconsistent or manual",
                  "Have leads from multiple sources with no unified tracking",
                  "Want more booked jobs without hiring another dispatcher or admin",
                ].map((pt) => (
                  <div
                    key={pt}
                    className="flex items-start gap-3 rounded-xl border border-[color:var(--border)] bg-white/5 px-4 py-3"
                  >
                    <span className="text-[color:var(--accent-2)] font-bold mt-0.5">
                      ✓
                    </span>
                    <span className="text-sm text-[color:var(--muted)]">
                      {pt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <section id="faq">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)] p-8 md:p-10">
            <div className="text-xs font-bold tracking-[.14em] uppercase text-[color:var(--muted)] mb-3">
              FAQ
            </div>
            <h2 className="text-[clamp(22px,3.2vw,34px)] font-extrabold leading-tight mb-8">
              Common questions
            </h2>

            <div className="space-y-3 max-w-[800px]">
              {faqItems.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[color:var(--border)] bg-white/5 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold hover:bg-white/5 transition-colors"
                  >
                    <span>{item.q}</span>
                    <span
                      className={`text-[color:var(--accent)] text-lg transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`}
                    >
                      +
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-[color:var(--muted)] text-sm leading-relaxed border-t border-[color:var(--border)]">
                      <p className="pt-4">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA / CONTACT ────────────────────────────────────────── */}
        <section id="audit">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)] p-8 md:p-10">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="text-xs font-bold tracking-[.14em] uppercase text-[color:var(--muted)] mb-3">
                  Free Revenue Audit
                </div>
                <h2 className="text-[clamp(22px,3.2vw,34px)] font-extrabold leading-tight">
                  Book a Free HVAC Revenue Audit
                </h2>
                <p className="mt-4 text-[color:var(--muted)]">
                  We review your current lead flow — calls, forms, estimates,
                  follow-up — and show you exactly where booked jobs are
                  leaking. You get a clear action plan whether you work with us
                  or not.
                </p>

                <div className="mt-6 space-y-3">
                  {[
                    "30-minute call with an HVAC growth specialist",
                    "Audit of your current lead capture and follow-up process",
                    "Estimate of revenue being lost each month",
                    "Specific action plan to recover booked jobs immediately",
                  ].map((pt) => (
                    <div
                      key={pt}
                      className="flex items-start gap-2 text-sm text-[color:var(--muted)]"
                    >
                      <span className="text-[color:var(--accent-2)] mt-0.5">
                        ✓
                      </span>
                      {pt}
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl border border-[color:var(--border)] bg-white/5 p-4">
                  <p className="font-bold text-sm">Our guarantee</p>
                  <p className="mt-1 text-[color:var(--muted)] text-sm">
                    If you do not see a measurable increase in booked jobs
                    within 60 days, we work for free until you do.
                  </p>
                </div>

                <div className="mt-4 rounded-xl border border-[color:var(--border)] bg-white/5 p-4">
                  <p className="font-bold text-sm">Prefer email or phone?</p>
                  <p className="mt-2 text-sm">
                    <a
                      className="text-[color:var(--accent)]"
                      href="mailto:info@orbisy.com"
                    >
                      info@orbisy.com
                    </a>
                    <span className="text-[color:var(--muted)]">
                      {" "}
                      · (224) 323-6231
                    </span>
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-[color:var(--border)] bg-white/[0.03] p-6">
                <h3 className="text-lg font-bold mb-4">
                  Request your free audit
                </h3>
                <form className="grid gap-4" onSubmit={onSubmit}>
                  {/* honeypot */}
                  <input
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                  />

                  <label className="grid gap-1">
                    <span className="text-sm text-[color:var(--muted)]">
                      Business name
                    </span>
                    <input
                      name="businessName"
                      className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-white/20 text-sm"
                      placeholder="Acme Heating & Cooling"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-sm text-[color:var(--muted)]">
                      Email address
                    </span>
                    <input
                      name="email"
                      type="email"
                      required
                      className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-white/20 text-sm"
                      placeholder="owner@acmehvac.com"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-sm text-[color:var(--muted)]">
                      How do leads currently come in? What happens when a call
                      is missed?
                    </span>
                    <textarea
                      name="message"
                      required
                      className="min-h-[100px] rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2.5 outline-none focus:ring-2 focus:ring-white/20 text-sm"
                      placeholder="Calls come in during the day, some go to voicemail after hours. We send estimates but don't always follow up…"
                    />
                  </label>

                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-bold border border-transparent bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-[#001] disabled:opacity-60 hover:opacity-90 transition-opacity"
                    type="submit"
                    disabled={sending}
                  >
                    {sending ? "Sending…" : "Book My Free HVAC Revenue Audit"}{" "}
                    <span aria-hidden>→</span>
                  </button>

                  {status === "ok" && (
                    <p className="text-sm text-[color:var(--accent-2)]">
                      Sent! You will hear back within one business day.
                    </p>
                  )}
                  {status === "error" && (
                    <p className="text-sm text-red-300">
                      Something went wrong. Try again or email us directly.
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="mx-auto max-w-[1100px] px-5 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[color:var(--muted)] border-t border-[color:var(--border)] pt-8 mt-4">
        <div className="flex items-center gap-3">
          <Image
            src="/orbisy-logo.png"
            alt="ORBISY"
            width={100}
            height={32}
            className="h-7 w-auto opacity-70"
          />
          <span>© {new Date().getFullYear()} ORBISY. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="mailto:info@orbisy.com"
            className="hover:text-[color:var(--text)] transition-colors"
          >
            info@orbisy.com
          </a>
          <a
            href="/login"
            className="hover:text-[color:var(--text)] transition-colors"
          >
            Login
          </a>
        </div>
      </footer>
    </div>
  );
}

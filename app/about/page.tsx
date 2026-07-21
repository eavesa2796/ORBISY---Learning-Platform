import SiteNav from "@/components/SiteNav";

export default function AboutPage() {
  return (
    <main className="shell">
      <SiteNav />

      <section className="page-card card">
        <p className="label">About</p>
        <h1>Why I built this learning platform</h1>
        <p>
          I want one place where I can learn frontend, backend, and databases
          together by building projects end-to-end. This site is that lab.
        </p>
        <p>
          The stack is intentional: React for UI, FastAPI for Python backend,
          and PostgreSQL for relational data modeling and SQL practice.
        </p>
      </section>
    </main>
  );
}

import SiteNav from "@/components/SiteNav";

export default function AboutPage() {
  return (
    <main className="shell">
      <SiteNav />

      <section className="page-card card">
        <p className="label">About</p>
        <h1>Why this React learning app exists</h1>
        <p>
          I wanted one focused place to become genuinely strong in React instead
          of jumping between random tutorials.
        </p>
        <p>
          The goal is simple: master fundamentals, memorize what matters, and
          ship practice projects that prove real understanding.
        </p>
      </section>
    </main>
  );
}

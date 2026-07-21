import SiteFooter from "@/components/academy/SiteFooter";
import SiteHeader from "@/components/academy/SiteHeader";

const subjects = [
  {
    topic: "System Design",
    status: "In Progress",
    note: "Practicing tradeoff analysis and scalable architecture patterns.",
  },
  {
    topic: "TypeScript",
    status: "Deepening",
    note: "Focusing on advanced typing and safer domain modeling.",
  },
  {
    topic: "Testing",
    status: "Weekly Practice",
    note: "Writing integration tests for critical user journeys.",
  },
];

export default function LearningPage() {
  return (
    <>
      <SiteHeader />
      <main className="site-shell" style={{ padding: "2.4rem 0 1rem" }}>
        <section className="glass-card" style={{ padding: "1.6rem" }}>
          <p className="pill">Learning Log</p>
          <h1 className="section-title" style={{ marginTop: "0.8rem" }}>
            What I am learning right now and how I apply it.
          </h1>
          <p className="section-subtitle">
            Each topic includes a practical outcome, not just study time.
          </p>
        </section>

        <section style={{ marginTop: "1rem", display: "grid", gap: "0.8rem" }}>
          {subjects.map((subject) => (
            <article
              key={subject.topic}
              className="glass-card"
              style={{ padding: "1rem" }}
            >
              <p
                style={{
                  margin: 0,
                  color: "var(--accent-alt)",
                  fontWeight: 700,
                }}
              >
                {subject.status}
              </p>
              <h2 style={{ margin: "0.45rem 0 0", fontSize: "1.12rem" }}>
                {subject.topic}
              </h2>
              <p style={{ margin: "0.45rem 0 0", color: "var(--muted)" }}>
                {subject.note}
              </p>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

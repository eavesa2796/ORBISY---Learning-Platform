import SiteFooter from "@/components/academy/SiteFooter";
import SiteHeader from "@/components/academy/SiteHeader";

const checkpoints = [
  {
    period: "Q1",
    summary: "Built consistency habits",
    details: [
      "Coded five days per week",
      "Practiced algorithm fundamentals",
      "Wrote short technical notes daily",
    ],
  },
  {
    period: "Q2",
    summary: "Moved from practice to production",
    details: [
      "Shipped full-stack side projects",
      "Learned API and database design",
      "Improved testing and debugging workflow",
    ],
  },
  {
    period: "Q3 Goal",
    summary: "Build products with clear outcomes",
    details: [
      "Launch one project with real users",
      "Collect feedback and iterate weekly",
      "Document decisions and tradeoffs publicly",
    ],
  },
];

export default function JourneyPage() {
  return (
    <>
      <SiteHeader />
      <main className="site-shell" style={{ padding: "2.4rem 0 1rem" }}>
        <section className="glass-card" style={{ padding: "1.6rem" }}>
          <p className="pill">Journey</p>
          <h1 className="section-title" style={{ marginTop: "0.8rem" }}>
            A transparent timeline of my growth as a developer.
          </h1>
          <p className="section-subtitle">
            This page tracks what I practice, what I ship, and what I improve
            next.
          </p>
        </section>

        <section
          style={{
            marginTop: "1rem",
            display: "grid",
            gap: "0.8rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          {checkpoints.map((item) => (
            <article
              key={item.period}
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
                {item.period}
              </p>
              <h2 style={{ margin: "0.5rem 0 0", fontSize: "1.12rem" }}>
                {item.summary}
              </h2>
              <ul
                style={{
                  margin: "0.65rem 0 0",
                  paddingLeft: "1.1rem",
                  lineHeight: 1.6,
                }}
              >
                {item.details.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

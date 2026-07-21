import SiteFooter from "@/components/academy/SiteFooter";
import SiteHeader from "@/components/academy/SiteHeader";

const projects = [
  {
    name: "Outreach Dashboard",
    stage: "Shipped",
    summary: "Built a dashboard with lead tracking and campaign insights.",
    learned: "Improved API design and state management decisions.",
  },
  {
    name: "Proposal Workflow",
    stage: "Improving",
    summary: "Created proposal creation, sharing, and acceptance flow.",
    learned: "Learned how to structure complex user flows clearly.",
  },
  {
    name: "Learning Platform Prototype",
    stage: "In Build",
    summary: "Designing an app for guided coding growth and reflection.",
    learned: "Practicing rapid iteration with user-centered feedback loops.",
  },
];

export default function ProjectsPage() {
  return (
    <>
      <SiteHeader />
      <main className="site-shell" style={{ padding: "2.4rem 0 1rem" }}>
        <section className="glass-card" style={{ padding: "1.6rem" }}>
          <p className="pill">Projects</p>
          <h1 className="section-title" style={{ marginTop: "0.8rem" }}>
            Projects that show my growth in execution.
          </h1>
          <p className="section-subtitle">
            I track what was built, what worked, and what I would improve next.
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
          {projects.map((project) => (
            <article
              key={project.name}
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
                {project.stage}
              </p>
              <h2 style={{ margin: "0.45rem 0 0", fontSize: "1.12rem" }}>
                {project.name}
              </h2>
              <p style={{ margin: "0.45rem 0 0", color: "var(--muted)" }}>
                {project.summary}
              </p>
              <p style={{ margin: "0.65rem 0 0", fontWeight: 600 }}>
                Learning: {project.learned}
              </p>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

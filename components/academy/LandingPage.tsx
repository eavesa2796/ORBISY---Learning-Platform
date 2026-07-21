import Link from "next/link";
import SiteFooter from "@/components/academy/SiteFooter";
import SiteHeader from "@/components/academy/SiteHeader";

const currentFocus = [
  "Ship one meaningful project every month",
  "Master TypeScript and full-stack architecture",
  "Publish weekly reflections on wins and mistakes",
];

const recentMilestones = [
  {
    label: "April",
    title: "Built a complete auth flow",
    detail: "Implemented login, signup, sessions, and role-based guards.",
  },
  {
    label: "May",
    title: "Designed better API patterns",
    detail: "Refactored routes for cleaner validation and safer responses.",
  },
  {
    label: "June",
    title: "Shipped first public demo",
    detail: "Published a working project and gathered real user feedback.",
  },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />

      <main className="site-shell" style={{ padding: "2.5rem 0 0.5rem" }}>
        <section className="glass-card" style={{ padding: "2rem" }}>
          <p className="pill stagger-1">Personal Growth Website</p>
          <h1
            className="stagger-2"
            style={{
              margin: "1rem 0 0",
              fontSize: "clamp(2rem, 6vw, 4.4rem)",
              lineHeight: 0.98,
              letterSpacing: "-0.04em",
            }}
          >
            I am documenting my journey to become an exceptional developer.
          </h1>

          <p
            className="stagger-3"
            style={{
              maxWidth: "64ch",
              margin: "1rem 0 0",
              color: "var(--muted)",
            }}
          >
            This is my public build journal: what I am learning, what I am
            building, and how I am improving each week. I use it to stay
            accountable, share my process, and track measurable progress.
          </p>

          <div
            className="stagger-4"
            style={{
              marginTop: "1.2rem",
              display: "flex",
              gap: "0.65rem",
              flexWrap: "wrap",
            }}
          >
            <Link href="/journey" className="primary-btn">
              Explore My Journey
            </Link>
            <Link href="/projects" className="secondary-btn">
              See Projects
            </Link>
          </div>
        </section>

        <section style={{ marginTop: "1.4rem", display: "grid", gap: "1rem" }}>
          <article className="glass-card" style={{ padding: "1.2rem" }}>
            <h2 className="section-title">Current Focus</h2>
            <ul
              style={{
                margin: "0.9rem 0 0",
                paddingLeft: "1.2rem",
                lineHeight: 1.7,
              }}
            >
              {currentFocus.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="glass-card" style={{ padding: "1.2rem" }}>
            <h2 className="section-title">Recent Milestones</h2>
            <p className="section-subtitle">
              A simple timeline of work completed and skills gained.
            </p>
            <div
              style={{
                marginTop: "1rem",
                display: "grid",
                gap: "0.85rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              {recentMilestones.map((milestone) => (
                <div
                  key={milestone.title}
                  className="glass-card"
                  style={{ padding: "0.95rem" }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "var(--accent-alt)",
                      fontWeight: 700,
                      letterSpacing: "0.02em",
                      textTransform: "uppercase",
                      fontSize: "0.78rem",
                    }}
                  >
                    {milestone.label}
                  </p>
                  <h3 style={{ margin: "0.5rem 0 0", fontSize: "1.1rem" }}>
                    {milestone.title}
                  </h3>
                  <p style={{ margin: "0.45rem 0 0", color: "var(--muted)" }}>
                    {milestone.detail}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-card" style={{ padding: "1.2rem" }}>
            <h2 className="section-title">Learning Snapshot</h2>
            <p className="section-subtitle">
              One concept I am currently applying in real projects.
            </p>

            <pre
              style={{
                marginTop: "1rem",
                padding: "1rem",
                borderRadius: "14px",
                background: "#1f1d1a",
                color: "#f9f7f2",
                overflowX: "auto",
                border: "1px solid rgba(249, 247, 242, 0.14)",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: "0.86rem",
                lineHeight: 1.5,
              }}
            >
              {`type WeeklyLesson = {
  topic: string;
  confidence: number;
  challenge: string;
};

export function nextPriority(lessons: WeeklyLesson[]) {
  return lessons
    .filter((lesson) => lesson.confidence < 7)
    .sort((a, b) => a.confidence - b.confidence)[0];
}`}
            </pre>
          </article>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

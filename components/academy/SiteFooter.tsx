import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-shell glass-card" style={{ padding: "1.2rem" }}>
        <div className="site-footer-grid">
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: "var(--text)" }}>
              Anthony Lab
            </p>
            <p style={{ margin: "0.45rem 0 0" }}>
              A personal archive of projects, experiments, and lessons learned.
            </p>
          </div>

          <div>
            <p style={{ margin: 0, fontWeight: 700, color: "var(--text)" }}>
              Explore
            </p>
            <p style={{ margin: "0.45rem 0 0" }}>
              <Link href="/journey">Journey</Link> |{" "}
              <Link href="/learning">Learning</Link> |{" "}
              <Link href="/projects">Projects</Link>
            </p>
          </div>

          <div>
            <p style={{ margin: 0, fontWeight: 700, color: "var(--text)" }}>
              Focus
            </p>
            <p style={{ margin: "0.45rem 0 0" }}>
              Show consistent progress, share real work, and keep improving.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

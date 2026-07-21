import Link from "next/link";
import BackendStatus from "@/components/BackendStatus";
import SiteNav from "@/components/SiteNav";

const starterTracks = [
  {
    name: "React",
    target: "Build interactive UIs with modern component patterns.",
  },
  {
    name: "Python",
    target: "Ship a backend API with clean business logic.",
  },
  {
    name: "SQL",
    target: "Design reliable schemas and write production queries.",
  },
];

export default function Home() {
  return (
    <main className="shell">
      <SiteNav />

      <section className="hero card">
        <p className="label">Full-Stack Learning Platform</p>
        <h1>Train React, Python, and SQL by building real systems.</h1>
        <p>
          This platform is my hands-on lab. Every lesson maps to code, database
          changes, and measurable progress.
        </p>
        <BackendStatus />
        <div className="actions">
          <Link href="/learning" className="btn primary">
            Start Learning
          </Link>
          <Link href="/dashboard" className="btn ghost">
            View Dashboard
          </Link>
        </div>
      </section>

      <section className="page-card card">
        <p className="label">Starter Tracks</p>
        <h2 className="section-head">What I am learning first</h2>
        <div className="grid-three">
          {starterTracks.map((track) => (
            <article key={track.name} className="mini-card">
              <h3>{track.name}</h3>
              <p>{track.target}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

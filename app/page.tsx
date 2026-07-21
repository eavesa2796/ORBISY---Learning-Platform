import Link from "next/link";

export default function Home() {
  return (
    <main className="shell">
      <nav className="topbar card">
        <p className="brand">Anthony Build Log</p>
        <div className="links">
          <Link href="/learning">Learning</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </nav>

      <section className="hero card">
        <p className="label">Starting Fresh</p>
        <h1>Building in public, one week at a time.</h1>
        <p>
          This site is my clean slate. I use it to track what I learn, what I
          build, and how I improve.
        </p>
        <div className="actions">
          <Link href="/learning" className="btn primary">
            View Learning Log
          </Link>
          <Link href="/projects" className="btn ghost">
            Explore Projects
          </Link>
        </div>
      </section>
    </main>
  );
}

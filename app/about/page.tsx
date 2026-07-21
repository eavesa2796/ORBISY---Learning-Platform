import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="shell">
      <nav className="topbar card">
        <p className="brand">Anthony Build Log</p>
        <div className="links">
          <Link href="/">Home</Link>
          <Link href="/learning">Learning</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </nav>

      <section className="page-card card">
        <p className="label">About</p>
        <h1>Why this site exists</h1>
        <p>
          I built this website as a public log for my development journey. My
          goal is to become an elite builder by shipping consistently, learning
          from mistakes, and documenting the process.
        </p>
      </section>
    </main>
  );
}

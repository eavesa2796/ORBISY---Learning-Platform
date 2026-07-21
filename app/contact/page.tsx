import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="shell">
      <nav className="topbar card">
        <p className="brand">Anthony Build Log</p>
        <div className="links">
          <Link href="/">Home</Link>
          <Link href="/learning">Learning</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/about">About</Link>
        </div>
      </nav>

      <section className="page-card card">
        <p className="label">Contact</p>
        <h1>Get in touch</h1>
        <p>
          You can reach me for collaboration, feedback, or opportunities at
          hello@anthonybuildlog.dev.
        </p>
      </section>
    </main>
  );
}

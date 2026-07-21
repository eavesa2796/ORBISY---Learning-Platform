import Link from "next/link";

const topics = [
  "TypeScript architecture",
  "System design for small products",
  "Testing user-critical flows",
  "Shipping and iteration speed",
];

export default function LearningPage() {
  return (
    <main className="shell">
      <nav className="topbar card">
        <p className="brand">Anthony Build Log</p>
        <div className="links">
          <Link href="/">Home</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </nav>

      <section className="page-card card">
        <p className="label">Learning</p>
        <h1>Current focus areas</h1>
        <ul>
          {topics.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

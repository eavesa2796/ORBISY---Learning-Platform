import Link from "next/link";

const projects = [
  {
    name: "Build Journal",
    note: "A public tracker for goals, lessons, and shipping consistency.",
  },
  {
    name: "Workflow Sandbox",
    note: "A personal app where I test new UI and API patterns quickly.",
  },
  {
    name: "Learning Lab",
    note: "Small experiments to deeply understand one concept at a time.",
  },
];

export default function ProjectsPage() {
  return (
    <main className="shell">
      <nav className="topbar card">
        <p className="brand">Anthony Build Log</p>
        <div className="links">
          <Link href="/">Home</Link>
          <Link href="/learning">Learning</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </nav>

      <section className="page-card card">
        <p className="label">Projects</p>
        <h1>What I am building</h1>
        <ul>
          {projects.map((project) => (
            <li key={project.name}>
              <strong>{project.name}:</strong> {project.note}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

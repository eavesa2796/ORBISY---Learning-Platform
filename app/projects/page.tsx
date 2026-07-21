import SiteNav from "@/components/SiteNav";

const projects = [
  {
    name: "Learning Platform Core",
    note: "Tracks, lessons, and progress API backed by PostgreSQL.",
  },
  {
    name: "Habit & Streak Engine",
    note: "Daily study check-ins, streak tracking, and consistency metrics.",
  },
  {
    name: "SQL Query Playground",
    note: "Curated query exercises with real dataset patterns.",
  },
];

export default function ProjectsPage() {
  return (
    <main className="shell">
      <SiteNav />

      <section className="page-card card">
        <p className="label">Projects</p>
        <h1>Full-stack projects I will ship</h1>
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

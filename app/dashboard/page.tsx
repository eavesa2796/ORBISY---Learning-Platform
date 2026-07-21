import SiteNav from "@/components/SiteNav";

const progressRows = [
  { track: "React Fundamentals", completed: 6, total: 12 },
  { track: "Hooks + Effects", completed: 3, total: 10 },
  { track: "Project Practice", completed: 2, total: 8 },
];

const weeklyChecklist = [
  "Review JSX and component composition",
  "Build one mini component from scratch",
  "Refactor one previous project section",
  "Practice one async API fetch flow",
  "Write short notes on one concept confusion",
];

export default function DashboardPage() {
  return (
    <main className="shell">
      <SiteNav />

      <section className="page-card card">
        <p className="label">Dashboard</p>
        <h1>React progress overview</h1>
        <div className="grid-three">
          {progressRows.map((row) => {
            const pct = Math.round((row.completed / row.total) * 100);
            return (
              <article key={row.track} className="mini-card">
                <h2>{row.track}</h2>
                <p>
                  {row.completed} / {row.total} lessons completed
                </p>
                <div className="meter">
                  <span style={{ width: `${pct}%` }} />
                </div>
                <p className="meter-label">{pct}% complete</p>
              </article>
            );
          })}
        </div>

        <h2 className="section-head">This week checklist</h2>
        <ul>
          {weeklyChecklist.map((task) => (
            <li key={task}>{task}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

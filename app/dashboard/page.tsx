import SiteNav from "@/components/SiteNav";

const progressRows = [
  { track: "React", completed: 4, total: 20 },
  { track: "Python", completed: 3, total: 18 },
  { track: "SQL", completed: 2, total: 15 },
];

export default function DashboardPage() {
  return (
    <main className="shell">
      <SiteNav />

      <section className="page-card card">
        <p className="label">Dashboard</p>
        <h1>Progress overview</h1>
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
      </section>
    </main>
  );
}

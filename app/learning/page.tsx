import SiteNav from "@/components/SiteNav";

const tracks = [
  {
    name: "React",
    lessons: [
      "Components, props, and state",
      "Routing and data fetching",
      "Reusable UI patterns and accessibility",
    ],
  },
  {
    name: "Python",
    lessons: [
      "FastAPI routes and validation",
      "Service layer and dependency injection",
      "Testing with pytest",
    ],
  },
  {
    name: "SQL",
    lessons: [
      "Schema design and normalization",
      "Joins and aggregation queries",
      "Indexes and query optimization basics",
    ],
  },
];

export default function LearningPage() {
  return (
    <main className="shell">
      <SiteNav />

      <section className="page-card card">
        <p className="label">Learning</p>
        <h1>Learning tracks and lesson map</h1>
        <div className="grid-three">
          {tracks.map((track) => (
            <article key={track.name} className="mini-card">
              <h2>{track.name}</h2>
              <ul>
                {track.lessons.map((lesson) => (
                  <li key={lesson}>{lesson}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

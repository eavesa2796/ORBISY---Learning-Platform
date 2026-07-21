import SiteNav from "@/components/SiteNav";

const reactCore = [
  {
    name: "JSX + Components",
    lessons: [
      "How JSX compiles",
      "Props pattern and composition",
      "Reusable presentational components",
    ],
  },
  {
    name: "State + Events",
    lessons: [
      "useState mental model",
      "Event handlers and forms",
      "Derived state vs duplicated state",
    ],
  },
  {
    name: "Effects + Data Fetching",
    lessons: [
      "When to use useEffect",
      "Dependency arrays and stale closures",
      "Loading, error, and empty UI states",
    ],
  },
  {
    name: "Performance Basics",
    lessons: [
      "Key prop and list rendering",
      "Memoization with useMemo/useCallback",
      "React DevTools profiling intro",
    ],
  },
];

const weeklyFlow = [
  "Week 1: Components, JSX, props, and state",
  "Week 2: Forms, lifting state, and reusable patterns",
  "Week 3: Effects, async fetch, and state transitions",
  "Week 4: Build one complete app and refactor it",
];

export default function LearningPage() {
  return (
    <main className="shell">
      <SiteNav />

      <section className="page-card card">
        <p className="label">Learning</p>
        <h1>React roadmap and lesson order</h1>
        <div className="grid-three">
          {reactCore.map((track) => (
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

        <h2 className="section-head">First 4 weeks</h2>
        <ul>
          {weeklyFlow.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

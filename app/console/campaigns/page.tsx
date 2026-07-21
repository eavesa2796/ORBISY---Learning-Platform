export default function PlaybooksPage() {
  const playbooks = [
    {
      name: "Missed Call Recovery",
      objective: "Convert missed calls into booked jobs within 5 minutes.",
      angle:
        "You are already paying for leads. This system captures the ones you miss.",
    },
    {
      name: "Estimate Follow-Up",
      objective: "Recover stale estimates with a 7-day follow-up sequence.",
      angle: "Most companies lose 20-40% of quoted jobs due to zero follow-up.",
    },
    {
      name: "After-Hours Booking",
      objective: "Capture emergency demand while office phones are offline.",
      angle: "Night/weekend leads should not go to your competitor first.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[color:var(--text)]">
            Playbooks
          </h1>
          <p className="text-[color:var(--muted)] mt-2">
            Your reusable outreach positioning by pain signal.
          </p>
        </div>
        <a
          href="/console/pipeline"
          className="rounded-xl border border-transparent bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-5 py-3 font-semibold text-[#001] hover:opacity-90"
        >
          Draft Outreach
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {playbooks.map((item) => (
          <div
            key={item.name}
            className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] p-5"
          >
            <h2 className="text-xl font-semibold text-[color:var(--text)]">
              {item.name}
            </h2>
            <p className="text-sm text-[color:var(--muted)] mt-2">
              {item.objective}
            </p>
            <p className="text-sm text-[color:var(--muted)] mt-2">
              <span className="font-semibold text-[color:var(--text)]">
                Angle:
              </span>{" "}
              {item.angle}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] p-5">
        <h3 className="font-semibold text-[color:var(--text)]">
          Recommended next step
        </h3>
        <p className="text-sm text-[color:var(--muted)] mt-2">
          Keep this page as your single source of messaging. Every draft in
          Pipeline should map to one of these 3 playbooks.
        </p>
      </div>
    </div>
  );
}

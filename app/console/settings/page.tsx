export default function SystemPage() {
  const envVars = [
    "DATABASE_URL",
    "GOOGLE_PLACES_API_KEY",
    "RESEND_API_KEY",
    "CONTACT_FROM",
    "NEXT_PUBLIC_URL",
    "NEXT_PUBLIC_CALENDLY_URL",
  ];

  const checkpoints = [
    "Google Places import returns scored leads",
    "Audit pages resolve via /audit/[slug]",
    "Draft -> approve -> send workflow succeeds",
    "Suppression list blocks unsubscribed recipients",
    "Daily outreach KPI review in Command Center",
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-[color:var(--text)]">System</h1>
        <p className="text-[color:var(--muted)] mt-2">
          The only settings and operations checklist needed to run ORBISY as a
          lean sales machine.
        </p>
      </div>

      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] p-6">
        <h2 className="text-xl font-semibold text-[color:var(--text)] mb-4">
          Required environment variables
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {envVars.map((item) => (
            <div
              key={item}
              className="rounded-lg border border-[color:var(--border)] bg-white/5 px-3 py-2 font-mono text-sm text-[color:var(--text)]"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] p-6">
        <h2 className="text-xl font-semibold text-[color:var(--text)] mb-4">
          Daily operator checklist
        </h2>
        <ul className="space-y-2 text-[color:var(--muted)]">
          {checkpoints.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-[color:var(--accent)]">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] p-6">
        <h2 className="text-xl font-semibold text-[color:var(--text)] mb-3">
          Runbook commands
        </h2>
        <div className="space-y-3">
          <pre className="rounded-lg border border-[color:var(--border)] bg-white/5 p-3 text-xs text-[color:var(--text)] overflow-x-auto">
            npm run build
          </pre>
          <pre className="rounded-lg border border-[color:var(--border)] bg-white/5 p-3 text-xs text-[color:var(--text)] overflow-x-auto">
            npx prisma generate
          </pre>
          <pre className="rounded-lg border border-[color:var(--border)] bg-white/5 p-3 text-xs text-[color:var(--text)] overflow-x-auto">
            npx prisma migrate deploy
          </pre>
        </div>
      </div>
    </div>
  );
}

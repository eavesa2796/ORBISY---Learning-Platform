"use client";

import { useEffect, useMemo, useState } from "react";

type Message = {
  id: string;
  status: string;
  subject: string;
  bodyPreview: string;
  createdAt: string;
  sentAt?: string | null;
  repliedAt?: string | null;
  company: { id: string; name: string; slug: string };
  contact?: {
    id: string;
    fullName?: string | null;
    email?: string | null;
  } | null;
};

export default function RepliesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("REPLIED");

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  async function fetchMessages() {
    try {
      setLoading(true);
      const query = statusFilter
        ? `?status=${statusFilter}&limit=50`
        : "?limit=50";
      const res = await fetch(`/api/sales-machine/outreach/messages${query}`);
      const data = await res.json();
      if (res.ok) setMessages(data.messages || []);
    } finally {
      setLoading(false);
    }
  }

  const statuses = useMemo(
    () => ["REPLIED", "READY", "SENT", "APPROVED", "DRAFT", "STOPPED"],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[color:var(--text)]">
            Replies
          </h1>
          <p className="text-[color:var(--muted)] mt-2">
            Monitor outreach outcomes and jump into high-intent conversations
            fast.
          </p>
        </div>
        <a
          href="/console/pipeline"
          className="rounded-xl border border-transparent bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-5 py-3 font-semibold text-[#001] hover:opacity-90"
        >
          Back To Pipeline
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full border px-3 py-1 text-sm ${
              statusFilter === status
                ? "border-[color:var(--accent)] text-[color:var(--accent)] bg-[color:var(--accent)]/10"
                : "border-[color:var(--border)] text-[color:var(--muted)]"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[color:var(--muted)]">Loading messages...</p>
      ) : messages.length === 0 ? (
        <p className="text-[color:var(--muted)]">
          No messages found for this status.
        </p>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-[color:var(--text)]">
                    {msg.company.name}
                  </p>
                  <p className="text-sm text-[color:var(--muted)]">
                    {msg.subject}
                  </p>
                </div>
                <span className="rounded-full border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/10 px-3 py-1 text-xs text-[color:var(--accent)]">
                  {msg.status}
                </span>
              </div>
              <p className="text-sm text-[color:var(--muted)] mt-3">
                {msg.bodyPreview}...
              </p>
              <p className="text-xs text-[color:var(--muted)] mt-2">
                Contact: {msg.contact?.fullName || "Unknown"}{" "}
                {msg.contact?.email ? `(${msg.contact.email})` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

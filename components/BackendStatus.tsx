"use client";

import { useEffect, useState } from "react";

type Status = {
  ok: boolean;
  message: string;
};

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function BackendStatus() {
  const [status, setStatus] = useState<Status>({
    ok: false,
    message: "Checking backend...",
  });

  useEffect(() => {
    let ignore = false;

    async function checkHealth() {
      try {
        const response = await fetch(`${apiBase}/health`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Health endpoint returned ${response.status}`);
        }

        const body = (await response.json()) as { status?: string };
        if (!ignore) {
          setStatus({ ok: true, message: body.status ?? "healthy" });
        }
      } catch {
        if (!ignore) {
          setStatus({
            ok: false,
            message:
              "Backend not reachable. Start it with docker compose up or run FastAPI locally.",
          });
        }
      }
    }

    checkHealth();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <p className={status.ok ? "status status-ok" : "status status-warn"}>
      API Status: {status.message}
    </p>
  );
}

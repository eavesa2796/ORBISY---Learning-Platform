"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/shared/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";
import { useMastery } from "@/hooks/use-mastery";

export default function MasteredPage() {
  const { masteredTopics } = useMastery();
  const [subjectFilter, setSubjectFilter] = useState<
    "all" | "react" | "python" | "full-stack"
  >("all");

  const visibleTopics = useMemo(
    () =>
      masteredTopics.filter((topic) =>
        subjectFilter === "all" ? true : topic.subject === subjectFilter,
      ),
    [masteredTopics, subjectFilter],
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <SectionHeading
          title="Mastered"
          description="Topics with high confidence so you can protect strengths while building new layers."
          actions={
            <select
              value={subjectFilter}
              onChange={(event) =>
                setSubjectFilter(
                  event.target.value as
                    | "all"
                    | "react"
                    | "python"
                    | "full-stack",
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="react">React</option>
              <option value="python">Python</option>
              <option value="full-stack">Full-Stack</option>
            </select>
          }
        />

        <SurfaceCard title="Strong Topics" subtitle="Confidence 4 or 5">
          <div className="grid gap-3 sm:grid-cols-2">
            {visibleTopics.map((topic) => (
              <div
                key={topic.topicId}
                className="rounded-xl border border-emerald-200 bg-emerald-50 p-3"
              >
                <p className="text-sm font-semibold text-emerald-900">
                  {topic.topicId}
                </p>
                <p className="text-xs text-emerald-700">
                  {topic.subject} • module {topic.moduleId}
                </p>
                <p className="text-xs text-emerald-700">
                  Confidence {topic.confidence} • Reviews {topic.reviewsCount}
                </p>
              </div>
            ))}
            {visibleTopics.length === 0 ? (
              <p className="text-sm text-slate-600">
                No mastered topics yet. Keep practicing and rating confidence.
              </p>
            ) : null}
          </div>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}

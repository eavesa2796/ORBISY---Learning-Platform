"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/shared/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";
import { useMastery } from "@/hooks/use-mastery";
import { useProgress } from "@/hooks/use-progress";

export default function NeedsImprovementPage() {
  const { needsImprovementTopics } = useMastery();
  const { setTopicConfidence } = useProgress();
  const [subjectFilter, setSubjectFilter] = useState<
    "react" | "python" | "full-stack"
  >("react");

  const visibleTopics = useMemo(
    () =>
      needsImprovementTopics.filter((topic) => topic.subject === subjectFilter),
    [needsImprovementTopics, subjectFilter],
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <SectionHeading
          title="Needs Improvement"
          description="Target low-confidence topics first to unlock faster progress."
          actions={
            <select
              value={subjectFilter}
              onChange={(event) =>
                setSubjectFilter(
                  event.target.value as "react" | "python" | "full-stack",
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="react">React</option>
              <option value="python">Python</option>
              <option value="full-stack">Full-Stack</option>
            </select>
          }
        />

        <SurfaceCard title="Low Confidence Topics" subtitle="Confidence 1 or 2">
          <div className="space-y-3">
            {visibleTopics.map((topic) => (
              <div
                key={topic.topicId}
                className="flex flex-col gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-rose-900">
                    {topic.topicId}
                  </p>
                  <p className="text-xs text-rose-700">
                    {topic.subject} • module {topic.moduleId} • confidence{" "}
                    {topic.confidence}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setTopicConfidence(
                      topic.topicId,
                      Math.min(topic.confidence + 1, 5),
                    )
                  }
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                >
                  Improve +1
                </button>
              </div>
            ))}
            {visibleTopics.length === 0 ? (
              <p className="text-sm text-slate-600">
                No weak topics detected. Great consistency.
              </p>
            ) : null}
          </div>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}

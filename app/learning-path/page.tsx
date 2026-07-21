"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/shared/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";
import { useLessons } from "@/hooks/use-lessons";
import { useProgress } from "@/hooks/use-progress";

export default function LearningPathPage() {
  const { byModule } = useLessons();
  const { progress, startLesson, markLessonComplete } = useProgress();
  const [tab, setTab] = useState<"react" | "python">("react");

  useEffect(() => {
    const hasCurrentTab = byModule.some((item) => item.module.subject === tab);
    if (!hasCurrentTab) {
      const fallback = byModule[0]?.module.subject;
      if (fallback === "react" || fallback === "python") {
        setTab(fallback);
      }
    }
  }, [byModule, tab]);

  const visibleByModule = useMemo(
    () => byModule.filter((item) => item.module.subject === tab),
    [byModule, tab],
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <SectionHeading
          title="Learning Paths"
          description="Switch between React and Python tracks, then progress module by module."
          actions={
            <div className="inline-flex gap-2 rounded-xl border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setTab("react")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  tab === "react" ? "bg-slate-900 text-white" : "text-slate-600"
                }`}
              >
                React Path
              </button>
              <button
                type="button"
                onClick={() => setTab("python")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  tab === "python"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600"
                }`}
              >
                Python Path
              </button>
            </div>
          }
        />

        <div className="space-y-4">
          {visibleByModule.map(({ module, lessons }) => (
            <SurfaceCard
              key={module.id}
              title={module.title}
              subtitle={module.description}
            >
              <div className="space-y-2">
                {lessons.map((lesson) => {
                  const isCompleted = progress.completedLessonIds.includes(
                    lesson.id,
                  );
                  const isInProgress = progress.inProgressLessonIds.includes(
                    lesson.id,
                  );

                  return (
                    <div
                      key={lesson.id}
                      className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {lesson.title}
                        </p>
                        <p className="text-xs text-slate-600">
                          {lesson.difficulty} • {lesson.estimatedMinutes} min
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isCompleted ? (
                          <button
                            type="button"
                            onClick={() => startLesson(lesson.id)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            {isInProgress ? "Continue" : "Start"}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => markLessonComplete(lesson.id)}
                          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
                        >
                          {isCompleted ? "Completed" : "Complete"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SurfaceCard>
          ))}
          {visibleByModule.length === 0 ? (
            <SurfaceCard title="No modules available">
              <p className="text-sm text-slate-600">
                No modules are available for this track under the current
                subject filter.
              </p>
            </SurfaceCard>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}

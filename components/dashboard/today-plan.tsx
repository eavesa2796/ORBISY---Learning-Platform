"use client";

import { CheckCircle2, PlayCircle } from "lucide-react";
import { useLessons } from "@/hooks/use-lessons";
import { useProgress } from "@/hooks/use-progress";
import { SurfaceCard } from "@/components/ui/surface-card";

export function TodayPlan() {
  const { todayPlanLessons } = useLessons();
  const { markLessonComplete, startLesson, progress } = useProgress();

  return (
    <SurfaceCard
      title="Today's Plan"
      subtitle="One focused block at a time. Start, complete, and keep momentum."
    >
      <div className="space-y-3">
        {todayPlanLessons.map((lesson) => {
          const isComplete = progress.completedLessonIds.includes(lesson.id);
          return (
            <article
              key={lesson.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:bg-slate-100"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {lesson.title}
                  </p>
                  <p className="text-xs text-slate-600">
                    {lesson.difficulty} • {lesson.estimatedMinutes} min
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!isComplete ? (
                    <button
                      type="button"
                      onClick={() => startLesson(lesson.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <PlayCircle className="h-4 w-4" />
                      Start
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => markLessonComplete(lesson.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isComplete ? "Completed" : "Complete"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </SurfaceCard>
  );
}

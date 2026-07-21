"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/shared/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";
import { useLessons } from "@/hooks/use-lessons";
import { useProgress } from "@/hooks/use-progress";

export default function LessonsPage() {
  const { lessons, modules, completeLesson, startLesson } = useLessons();
  const { progress } = useProgress();
  const [query, setQuery] = useState("");

  const filteredLessons = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return lessons;
    return lessons.filter((lesson) =>
      lesson.title.toLowerCase().includes(normalized),
    );
  }, [lessons, query]);

  return (
    <AppShell>
      <div className="space-y-6">
        <SectionHeading
          title="Lessons"
          description="Search, start, and complete lessons. Use this as your daily execution board."
          actions={
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search lessons"
              className="w-56 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-900/20 focus:ring"
            />
          }
        />

        <SurfaceCard>
          <div className="grid gap-3">
            {filteredLessons.map((lesson) => {
              const module = modules.find(
                (item) => item.id === lesson.moduleId,
              );
              const isCompleted = progress.completedLessonIds.includes(
                lesson.id,
              );
              const isInProgress = progress.inProgressLessonIds.includes(
                lesson.id,
              );

              return (
                <article
                  key={lesson.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {lesson.title}
                      </p>
                      <p className="text-xs text-slate-600">
                        {module?.title ?? "Module"} • {lesson.difficulty} •{" "}
                        {lesson.estimatedMinutes} min
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/lessons/${lesson.id}`}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
                      >
                        Open
                      </Link>
                      {!isCompleted ? (
                        <button
                          type="button"
                          onClick={() => startLesson(lesson.id)}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
                        >
                          {isInProgress ? "Continue" : "Start"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => completeLesson(lesson.id)}
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                      >
                        {isCompleted ? "Completed" : "Complete"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}

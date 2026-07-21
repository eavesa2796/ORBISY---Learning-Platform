"use client";

import { Flame, Target, Trophy } from "lucide-react";
import { useAppStore } from "@/store/app-store";

export function TopHeader() {
  const { state, learningPath } = useAppStore();
  const subjectLabel =
    state.settings.selectedSubject === "all"
      ? "All Subjects"
      : state.settings.selectedSubject === "react"
        ? "React"
        : state.settings.selectedSubject === "python"
          ? "Python"
          : "Full-Stack";

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Personal Learning Platform • {subjectLabel}
          </p>
          <h2 className="text-lg font-semibold text-slate-900">
            Welcome back, {state.profile.name}. Keep the streak alive.
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-amber-800">
            <Flame className="h-4 w-4" />
            {learningPath.dashboard.currentStreakDays}-day streak
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-sky-800">
            <Target className="h-4 w-4" />
            {learningPath.dashboard.overallProgressPercent}% progress
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
            <Trophy className="h-4 w-4" />
            {learningPath.dashboard.masteryPercent}% mastery
          </div>
        </div>
      </div>
    </header>
  );
}

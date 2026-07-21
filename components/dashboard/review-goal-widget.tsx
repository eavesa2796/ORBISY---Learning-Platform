"use client";

import Link from "next/link";
import { Gauge, Repeat2 } from "lucide-react";
import { SurfaceCard } from "@/components/ui/surface-card";
import { useFlashcards } from "@/hooks/use-flashcards";

export function ReviewGoalWidget() {
  const {
    dueCards,
    reviewedTodayCount,
    dailyReviewGoal,
    goalCompletionPercent,
    remainingToday,
  } = useFlashcards();

  return (
    <SurfaceCard
      title="Daily Review Goal"
      subtitle="Keep retrieval practice consistent for long-term retention"
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
              Reviewed Today
            </p>
            <p className="mt-1 flex items-center gap-2 text-xl font-semibold text-slate-900">
              <Repeat2 className="h-4 w-4 text-slate-500" />
              {reviewedTodayCount}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
              Goal
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {dailyReviewGoal}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
              Due Now
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {dueCards.length}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
            <span className="inline-flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" />
              Goal Progress
            </span>
            <span>{goalCompletionPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-teal-600 transition-all"
              style={{ width: `${goalCompletionPercent}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {remainingToday === 0
              ? "Goal complete. Optional extra reviews will strengthen recall."
              : `${remainingToday} more card${remainingToday === 1 ? "" : "s"} to hit today\'s goal.`}
          </p>
        </div>

        <Link
          href="/practice"
          className="inline-flex rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
        >
          Open Practice Queue
        </Link>
      </div>
    </SurfaceCard>
  );
}

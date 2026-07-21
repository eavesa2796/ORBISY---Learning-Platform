"use client";

import { AppShell } from "@/components/layout/app-shell";
import { InsightFeed } from "@/components/dashboard/insight-feed";
import { MasteryBreakdownChart } from "@/components/dashboard/mastery-breakdown-chart";
import { ModuleProgressList } from "@/components/dashboard/module-progress-list";
import { ProgressOverview } from "@/components/dashboard/progress-overview";
import { ReviewGoalWidget } from "@/components/dashboard/review-goal-widget";
import { StudyTimeChart } from "@/components/dashboard/study-time-chart";
import { TodayPlan } from "@/components/dashboard/today-plan";
import { SectionHeading } from "@/components/shared/section-heading";
import { useProgress } from "@/hooks/use-progress";

export default function HomePage() {
  const { selectedSubject, setSelectedSubject } = useProgress();

  return (
    <AppShell>
      <div className="space-y-6">
        <SectionHeading
          title="Code Mastery Dashboard"
          description="Track combined React and Python growth, then drill into a single subject when you want focused execution."
          actions={
            <div className="inline-flex flex-wrap gap-2">
              {[
                { value: "all", label: "Combined" },
                { value: "react", label: "React" },
                { value: "python", label: "Python" },
                { value: "full-stack", label: "Full-Stack" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setSelectedSubject(
                      option.value as "all" | "react" | "python" | "full-stack",
                    )
                  }
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    selectedSubject === option.value
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          }
        />

        <ProgressOverview />

        <div className="grid gap-4 xl:grid-cols-2">
          <StudyTimeChart />
          <MasteryBreakdownChart />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <TodayPlan />
          <InsightFeed />
        </div>

        <ReviewGoalWidget />

        <ModuleProgressList />
      </div>
    </AppShell>
  );
}

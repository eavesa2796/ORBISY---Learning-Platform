"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ReviewHistoryPanel } from "@/components/dashboard/review-history-panel";
import { SectionHeading } from "@/components/shared/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";
import { MasteryBreakdownChart } from "@/components/dashboard/mastery-breakdown-chart";
import { ModuleProgressList } from "@/components/dashboard/module-progress-list";
import { StudyTimeChart } from "@/components/dashboard/study-time-chart";

export default function ProgressPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <SectionHeading
          title="Progress"
          description="Visualize study consistency and mastery composition over time."
        />

        <div className="grid gap-4 xl:grid-cols-2">
          <StudyTimeChart />
          <MasteryBreakdownChart />
        </div>

        <ReviewHistoryPanel />

        <ModuleProgressList />

        <SurfaceCard title="Review Cadence" subtitle="Interpretation guide">
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>
              Rising study minutes with flat mastery means improve deliberate
              practice quality.
            </li>
            <li>
              Low module completion but high confidence can signal
              overestimation.
            </li>
            <li>
              Mastery grows fastest when lessons, quizzes, and projects progress
              together.
            </li>
          </ul>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}

"use client";

import { BookOpen, BrainCircuit, Flame, Timer } from "lucide-react";
import { useProgress } from "@/hooks/use-progress";
import { useMastery } from "@/hooks/use-mastery";
import { formatMinutes, toPercent } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";

export function ProgressOverview() {
  const { metrics, selectedSubject } = useProgress();
  const { breakdown, subjectMastery } = useMastery();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Completion"
        value={`${metrics.completionPercent}%`}
        detail={`${metrics.completedLessons}/${metrics.totalLessons} lessons finished`}
        icon={<BookOpen className="h-5 w-5" />}
        tone="info"
      />
      <StatCard
        label="Current Streak"
        value={`${metrics.currentStreakDays} days`}
        detail="Consistency compounds learning speed"
        icon={<Flame className="h-5 w-5" />}
        tone="success"
      />
      <StatCard
        label="Study Time"
        value={formatMinutes(metrics.totalStudyMinutes)}
        detail={`${formatMinutes(metrics.studyMinutesLast7Days)} in last 7 days`}
        icon={<Timer className="h-5 w-5" />}
      />
      <StatCard
        label="Mastery"
        value={`${toPercent(breakdown.overall)}%`}
        detail={`React ${subjectMastery.react}% • Python ${subjectMastery.python}% • ${selectedSubject === "all" ? "Combined" : "Selected"}`}
        icon={<BrainCircuit className="h-5 w-5" />}
        tone="warning"
      />
    </div>
  );
}

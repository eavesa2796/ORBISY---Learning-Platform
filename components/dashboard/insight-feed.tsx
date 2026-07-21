"use client";

import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { SurfaceCard } from "@/components/ui/surface-card";

const iconMap = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
};

export function InsightFeed() {
  const { learningPath } = useAppStore();

  return (
    <SurfaceCard
      title="Coach Insights"
      subtitle="Data-driven nudges based on your recent activity"
    >
      <div className="space-y-3">
        {learningPath.dashboard.insights.map((insight) => {
          const Icon = iconMap[insight.type];
          return (
            <div
              key={insight.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4 text-slate-700" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {insight.title}
                  </p>
                  <p className="text-sm text-slate-600">{insight.summary}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SurfaceCard>
  );
}

"use client";

import { useAppStore } from "@/store/app-store";
import { SurfaceCard } from "@/components/ui/surface-card";

export function ModuleProgressList() {
  const { state, learningPath } = useAppStore();

  return (
    <SurfaceCard
      title="Module Progress"
      subtitle="Where you are strong and where to focus next"
    >
      <ul className="space-y-3">
        {learningPath.dashboard.moduleProgress.map((item) => {
          const module = state.modules.find((m) => m.id === item.moduleId);
          if (!module) return null;

          return (
            <li key={item.moduleId} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-900">
                  {module.title}
                </span>
                <span className="text-slate-600">
                  {item.completionPercent}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-teal-600 transition-all"
                  style={{ width: `${item.completionPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {item.completedLessons}/{item.totalLessons} lessons completed
              </p>
            </li>
          );
        })}
      </ul>
    </SurfaceCard>
  );
}

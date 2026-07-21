"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useMastery } from "@/hooks/use-mastery";
import { SurfaceCard } from "@/components/ui/surface-card";
import { toPercent } from "@/lib/utils";

const COLORS = ["#0f766e", "#0ea5e9", "#f59e0b", "#ef4444", "#6366f1"];

export function MasteryBreakdownChart() {
  const { breakdown } = useMastery();

  const data = useMemo(
    () => [
      { name: "Lessons", value: toPercent(breakdown.lessonCompletionScore) },
      { name: "Quizzes", value: toPercent(breakdown.quizPerformanceScore) },
      { name: "Exercises", value: toPercent(breakdown.exerciseScore) },
      { name: "Projects", value: toPercent(breakdown.projectScore) },
      { name: "Confidence", value: toPercent(breakdown.confidenceReviewScore) },
    ],
    [breakdown],
  );

  return (
    <SurfaceCard
      title="Mastery Breakdown"
      subtitle="Weighted learning dimensions"
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={86}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value ?? 0}%`, "Score"]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
        {data.map((item, index) => (
          <li
            key={item.name}
            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
          >
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              {item.name}
            </span>
            <strong>{item.value}%</strong>
          </li>
        ))}
      </ul>
    </SurfaceCard>
  );
}

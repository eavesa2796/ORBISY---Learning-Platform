"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SurfaceCard } from "@/components/ui/surface-card";
import { useFlashcards } from "@/hooks/use-flashcards";

export function ReviewHistoryPanel() {
  const { reviewHistory7Days, dailyReviewGoal } = useFlashcards();

  const goalHits = reviewHistory7Days.filter((day) => day.goalHit).length;
  const averageReviews =
    reviewHistory7Days.reduce((sum, day) => sum + day.reviewed, 0) /
    Math.max(reviewHistory7Days.length, 1);

  return (
    <SurfaceCard
      title="Review History (7 Days)"
      subtitle={`Goal: ${dailyReviewGoal} cards/day • Goal hit on ${goalHits}/7 days`}
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-56 rounded-xl border border-slate-200 bg-slate-50 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={reviewHistory7Days}
              margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
            >
              <CartesianGrid vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                stroke="#475569"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#475569"
                tickLine={false}
                axisLine={false}
                width={28}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "reviewed")
                    return [`${value ?? 0} cards`, "Reviewed"];
                  if (name === "goal") return [`${value ?? 0} cards`, "Goal"];
                  return [value ?? 0, name];
                }}
              />
              <Bar dataKey="reviewed" fill="#0f766e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="goal" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-56 rounded-xl border border-slate-200 bg-slate-50 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={reviewHistory7Days}
              margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
            >
              <CartesianGrid vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                stroke="#475569"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#475569"
                tickLine={false}
                axisLine={false}
                width={28}
                domain={[0, 100]}
              />
              <Tooltip
                formatter={(value) => [`${value ?? 0}%`, "Goal Completion"]}
              />
              <Line
                type="monotone"
                dataKey="completionPercent"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
            Average / Day
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {averageReviews.toFixed(1)} cards
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
            Best Day
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {Math.max(...reviewHistory7Days.map((day) => day.reviewed), 0)}{" "}
            cards
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
            Goal Hit Rate
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {Math.round((goalHits / 7) * 100)}%
          </p>
        </div>
      </div>
    </SurfaceCard>
  );
}

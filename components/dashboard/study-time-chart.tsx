"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStudySession } from "@/hooks/use-study-session";
import { SurfaceCard } from "@/components/ui/surface-card";

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export function StudyTimeChart() {
  const { sessions } = useStudySession();

  const data = useMemo(() => {
    const result: { day: string; minutes: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i -= 1) {
      const dayDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - i,
      );
      const start = dayDate.getTime();
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - i + 1,
      ).getTime();

      const minutes = sessions
        .filter((session) => {
          const time = new Date(session.startedAt).getTime();
          return time >= start && time < end;
        })
        .reduce((sum, session) => sum + session.durationMinutes, 0);

      result.push({ day: formatDayLabel(dayDate), minutes });
    }

    return result;
  }, [sessions]);

  return (
    <SurfaceCard
      title="Study Minutes (7 Days)"
      subtitle="Track consistency and intensity"
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
          >
            <defs>
              <linearGradient id="studyMinutes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f766e" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="day"
              stroke="#475569"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#475569"
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
              }}
              formatter={(value) => [`${value ?? 0} min`, "Study"]}
            />
            <Area
              dataKey="minutes"
              type="monotone"
              stroke="#0f766e"
              strokeWidth={2}
              fill="url(#studyMinutes)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SurfaceCard>
  );
}

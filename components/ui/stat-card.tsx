import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
  icon?: ReactNode;
  tone?: "neutral" | "success" | "warning" | "info";
};

const toneStyles: Record<NonNullable<StatCardProps["tone"]>, string> = {
  neutral: "border-slate-200 bg-white",
  success: "border-emerald-200 bg-emerald-50",
  warning: "border-amber-200 bg-amber-50",
  info: "border-sky-200 bg-sky-50",
};

export function StatCard({
  label,
  value,
  detail,
  icon,
  tone = "neutral",
}: StatCardProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border p-4 shadow-sm transition hover:shadow-md",
        toneStyles[tone],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          {detail ? (
            <p className="mt-1 text-sm text-slate-600">{detail}</p>
          ) : null}
        </div>
        {icon ? <div className="text-slate-500">{icon}</div> : null}
      </div>
    </article>
  );
}

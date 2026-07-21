import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SurfaceCardProps = {
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
};

export function SurfaceCard({
  title,
  subtitle,
  className,
  children,
}: SurfaceCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      {title ? (
        <header className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          ) : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

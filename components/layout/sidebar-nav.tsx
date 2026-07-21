"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookCopy,
  BookOpenCheck,
  Brain,
  CheckCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  Home,
  Settings,
} from "lucide-react";
import { useProgress } from "@/hooks/use-progress";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/learning-path", label: "Learning Paths", icon: BookCopy },
  { href: "/lessons", label: "Lessons", icon: GraduationCap },
  { href: "/practice", label: "Practice", icon: ClipboardList },
  { href: "/projects", label: "Projects", icon: BookOpenCheck },
  { href: "/mastered", label: "Mastered", icon: CheckCheck },
  { href: "/needs-improvement", label: "Needs Improvement", icon: Brain },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function SidebarNav() {
  const pathname = usePathname();
  const { selectedSubject, setSelectedSubject } = useProgress();

  return (
    <aside className="w-full border-r border-slate-200 bg-slate-900 text-slate-100 md:sticky md:top-0 md:h-screen md:w-72">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-700 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-teal-300">
            Code Mastery
          </p>
          <h1 className="mt-2 text-xl font-semibold leading-tight text-white">
            Anthony's Learning
            <br />
            Control Room
          </h1>
          <label className="mt-4 block text-xs text-slate-300">
            Subject
            <select
              value={selectedSubject}
              onChange={(event) =>
                setSelectedSubject(
                  event.target.value as
                    | "all"
                    | "react"
                    | "python"
                    | "full-stack",
                )
              }
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-2 py-1.5 text-xs text-slate-100"
            >
              <option value="all">All Subjects</option>
              <option value="react">React</option>
              <option value="python">Python</option>
            </select>
          </label>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                  isActive
                    ? "bg-teal-500/20 text-teal-100 ring-1 ring-teal-300/40"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-700 p-4 text-xs text-slate-400">
          Version 1 phase baseline
        </div>
      </div>
    </aside>
  );
}

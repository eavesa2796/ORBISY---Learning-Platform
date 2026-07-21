"use client";

import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/shared/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";
import { useProjects } from "@/hooks/use-projects";
import { ProjectStatus } from "@/types/models";

const statuses: ProjectStatus[] = [
  "not-started",
  "planning",
  "in-progress",
  "blocked",
  "submitted",
  "completed",
];

export default function ProjectsPage() {
  const { projects, markProjectStatus } = useProjects();

  return (
    <AppShell>
      <div className="space-y-6">
        <SectionHeading
          title="Projects"
          description="Ship projects in increasing complexity and track each phase state."
        />

        <div className="grid gap-4">
          {projects.map((project) => (
            <SurfaceCard
              key={project.id}
              title={project.title}
              subtitle={project.brief}
            >
              <div className="space-y-3 text-sm text-slate-700">
                <p>
                  <strong>Difficulty:</strong> {project.difficulty} •{" "}
                  <strong>Estimate:</strong> {project.estimatedHours} hours
                </p>
                <p>
                  <strong>Skills:</strong> {project.skills.join(", ")}
                </p>
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  Status
                  <select
                    value={project.status}
                    onChange={(event) =>
                      markProjectStatus(
                        project.id,
                        event.target.value as ProjectStatus,
                      )
                    }
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </SurfaceCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

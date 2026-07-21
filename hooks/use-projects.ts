"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { ProjectStatus } from "@/types/models";

export function useProjects() {
  const { state, learningPath, dispatch } = useAppStore();

  const projectsWithStatus = useMemo(() => {
    return learningPath.projects.map((project) => {
      const status =
        state.progress.projectProgress.find(
          (item) => item.projectId === project.id,
        )?.status ?? "not-started";
      return { ...project, status };
    });
  }, [learningPath.projects, state.progress.projectProgress]);

  return {
    projects: projectsWithStatus,
    markProjectStatus: (projectId: string, status: ProjectStatus) =>
      dispatch({ type: "MARK_PROJECT_STATUS", projectId, status }),
  };
}

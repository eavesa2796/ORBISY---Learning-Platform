"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store/app-store";

export function useStudySession() {
  const { state, learningPath, dispatch } = useAppStore();

  const scopedLessonIds = useMemo(
    () => new Set(learningPath.lessons.map((lesson) => lesson.id)),
    [learningPath.lessons],
  );

  const scopedSessions = useMemo(() => {
    if (state.settings.selectedSubject === "all") {
      return state.progress.studySessions;
    }
    return state.progress.studySessions.filter((session) =>
      session.lessonIds.some((lessonId) => scopedLessonIds.has(lessonId)),
    );
  }, [
    scopedLessonIds,
    state.progress.studySessions,
    state.settings.selectedSubject,
  ]);

  return {
    sessions: scopedSessions,
    addSession: (payload: {
      startedAt: string;
      endedAt: string;
      durationMinutes: number;
      lessonIds: string[];
      noteIds: string[];
      focusScore: number;
    }) => dispatch({ type: "ADD_STUDY_SESSION", payload }),
  };
}

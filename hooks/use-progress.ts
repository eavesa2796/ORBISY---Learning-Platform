"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store/app-store";

export function useProgress() {
  const { state, learningPath, dispatch } = useAppStore();

  const metrics = useMemo(() => {
    const totalLessons = state.lessons.length;
    const completedLessons = state.progress.completedLessonIds.length;
    const inProgressLessons = state.progress.inProgressLessonIds.length;

    return {
      totalLessons,
      completedLessons,
      inProgressLessons,
      remainingLessons: Math.max(totalLessons - completedLessons, 0),
      completionPercent: learningPath.dashboard.overallProgressPercent,
      currentStreakDays: state.progress.currentStreakDays,
      totalStudyMinutes: state.progress.totalStudyMinutes,
      studyMinutesLast7Days: learningPath.dashboard.studyMinutesLast7Days,
    };
  }, [
    learningPath.dashboard.overallProgressPercent,
    learningPath.dashboard.studyMinutesLast7Days,
    state.lessons.length,
    state.progress,
  ]);

  return {
    progress: state.progress,
    metrics,
    selectedSubject: state.settings.selectedSubject,
    setSelectedSubject: (
      selectedSubject: "all" | "react" | "python" | "full-stack",
    ) =>
      dispatch({
        type: "UPDATE_SETTINGS",
        payload: { selectedSubject, defaultSubject: selectedSubject },
      }),
    markLessonComplete: (lessonId: string) =>
      dispatch({ type: "COMPLETE_LESSON", lessonId }),
    startLesson: (lessonId: string) =>
      dispatch({ type: "START_LESSON", lessonId }),
    markLessonReview: (lessonId: string) =>
      dispatch({ type: "MARK_LESSON_REVIEW", lessonId }),
    setTopicConfidence: (topicId: string, confidence: number) =>
      dispatch({ type: "SET_TOPIC_CONFIDENCE", topicId, confidence }),
  };
}

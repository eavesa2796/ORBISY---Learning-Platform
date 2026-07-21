"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store/app-store";

export function useLessons() {
  const { state, learningPath, dispatch } = useAppStore();

  const byModule = useMemo(() => {
    return learningPath.modules.map((module) => ({
      module,
      lessons: learningPath.lessons.filter(
        (lesson) => lesson.moduleId === module.id,
      ),
    }));
  }, [learningPath.lessons, learningPath.modules]);

  const todayPlanLessons = useMemo(() => {
    const ids = new Set(learningPath.dashboard.todayPlanLessonIds);
    return learningPath.lessons.filter((lesson) => ids.has(lesson.id));
  }, [learningPath.dashboard.todayPlanLessonIds, learningPath.lessons]);

  return {
    lessons: learningPath.lessons,
    modules: learningPath.modules,
    selectedSubject: state.settings.selectedSubject,
    byModule,
    todayPlanLessons,
    getLessonById: (lessonId: string) =>
      learningPath.lessons.find((lesson) => lesson.id === lessonId),
    startLesson: (lessonId: string) =>
      dispatch({ type: "START_LESSON", lessonId }),
    completeLesson: (lessonId: string) =>
      dispatch({ type: "COMPLETE_LESSON", lessonId }),
    reviewLesson: (lessonId: string) =>
      dispatch({ type: "MARK_LESSON_REVIEW", lessonId }),
    submitQuizResult: (payload: {
      lessonId: string;
      scorePercent: number;
      totalQuestions: number;
      correctAnswers: number;
      durationMinutes: number;
    }) =>
      dispatch({
        type: "ADD_QUIZ_RESULT",
        payload: {
          id: `quiz-attempt-${Date.now()}`,
          lessonId: payload.lessonId,
          scorePercent: payload.scorePercent,
          totalQuestions: payload.totalQuestions,
          correctAnswers: payload.correctAnswers,
          completedAt: new Date().toISOString(),
          durationMinutes: payload.durationMinutes,
        },
      }),
    submitExerciseResult: (payload: {
      lessonId: string;
      passed: boolean;
      durationMinutes: number;
    }) =>
      dispatch({
        type: "ADD_EXERCISE_RESULT",
        payload: {
          id: `exercise-attempt-${Date.now()}`,
          lessonId: payload.lessonId,
          passed: payload.passed,
          completedAt: new Date().toISOString(),
          durationMinutes: payload.durationMinutes,
        },
      }),
  };
}

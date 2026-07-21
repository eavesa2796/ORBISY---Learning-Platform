import { Lesson, Project, TopicMastery, UserProgress } from "@/types/models";
import { clamp } from "@/lib/utils";

export type MasteryBreakdown = {
  lessonCompletionScore: number;
  quizPerformanceScore: number;
  exerciseScore: number;
  projectScore: number;
  confidenceReviewScore: number;
  overall: number;
};

export function calculateLessonCompletionScore(
  progress: UserProgress,
  lessons: Lesson[],
): number {
  if (lessons.length === 0) return 0;
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const completed = progress.completedLessonIds.filter((id) =>
    lessonIds.has(id),
  );
  return completed.length / lessons.length;
}

export function calculateQuizPerformanceScore(
  progress: UserProgress,
  lessonIds?: Set<string>,
): number {
  const scopedAttempts = lessonIds
    ? progress.quizAttempts.filter((attempt) => lessonIds.has(attempt.lessonId))
    : progress.quizAttempts;
  if (scopedAttempts.length === 0) return 0;
  const average =
    scopedAttempts.reduce((sum, item) => sum + item.scorePercent, 0) /
    scopedAttempts.length;
  return clamp(average / 100, 0, 1);
}

export function calculateExerciseScore(
  progress: UserProgress,
  lessonIds?: Set<string>,
): number {
  const scopedAttempts = lessonIds
    ? progress.exerciseAttempts.filter((attempt) =>
        lessonIds.has(attempt.lessonId),
      )
    : progress.exerciseAttempts;
  if (scopedAttempts.length === 0) return 0;
  const passed = scopedAttempts.filter((item) => item.passed).length;
  return passed / scopedAttempts.length;
}

export function calculateProjectScore(
  progress: UserProgress,
  projects: Project[],
): number {
  if (projects.length === 0) return 0;
  const projectIds = new Set(projects.map((project) => project.id));
  const completed = progress.projectProgress.filter(
    (item) => item.status === "completed" && projectIds.has(item.projectId),
  ).length;
  return completed / projects.length;
}

export function calculateConfidenceReviewScore(
  topicMastery: TopicMastery[],
): number {
  if (topicMastery.length === 0) return 0;
  const avgConfidence =
    topicMastery.reduce((sum, item) => sum + item.confidence, 0) /
    topicMastery.length;
  const avgReviews =
    topicMastery.reduce((sum, item) => sum + item.reviewsCount, 0) /
    topicMastery.length;
  const confidencePart = clamp(avgConfidence / 5, 0, 1);
  const reviewPart = clamp(avgReviews / 3, 0, 1);
  return (confidencePart + reviewPart) / 2;
}

export function calculateMasteryBreakdown(
  progress: UserProgress,
  lessons: Lesson[],
  projects: Project[],
): MasteryBreakdown {
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const lessonCompletionScore = calculateLessonCompletionScore(
    progress,
    lessons,
  );
  const quizPerformanceScore = calculateQuizPerformanceScore(
    progress,
    lessonIds,
  );
  const exerciseScore = calculateExerciseScore(progress, lessonIds);
  const projectScore = calculateProjectScore(progress, projects);
  const confidenceReviewScore = calculateConfidenceReviewScore(
    progress.topicMastery,
  );

  const overall =
    lessonCompletionScore * 0.2 +
    quizPerformanceScore * 0.25 +
    exerciseScore * 0.25 +
    projectScore * 0.2 +
    confidenceReviewScore * 0.1;

  return {
    lessonCompletionScore,
    quizPerformanceScore,
    exerciseScore,
    projectScore,
    confidenceReviewScore,
    overall: clamp(overall, 0, 1),
  };
}

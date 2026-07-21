"use client";

import { useMemo } from "react";
import { calculateMasteryBreakdown } from "@/lib/mastery";
import { useAppStore } from "@/store/app-store";

export function useMastery() {
  const { state, learningPath } = useAppStore();

  return useMemo(() => {
    const breakdown = calculateMasteryBreakdown(
      state.progress,
      learningPath.lessons,
      learningPath.projects,
    );

    const allTopicMastery = state.progress.topicMastery;
    const reactTopics = allTopicMastery.filter(
      (topic) => topic.subject === "react",
    );
    const pythonTopics = allTopicMastery.filter(
      (topic) => topic.subject === "python",
    );
    const fullStackTopics = allTopicMastery.filter(
      (topic) => topic.subject === "full-stack",
    );

    const scoreFromTopics = (topics: typeof allTopicMastery) => {
      if (topics.length === 0) return 0;
      const confidenceAvg =
        topics.reduce((sum, topic) => sum + topic.confidence, 0) /
        topics.length;
      const reviewAvg =
        topics.reduce((sum, topic) => sum + topic.reviewsCount, 0) /
        topics.length;
      return Math.min(
        100,
        Math.round(
          ((confidenceAvg / 5) * 0.7 + Math.min(reviewAvg / 4, 1) * 0.3) * 100,
        ),
      );
    };

    return {
      breakdown,
      allTopicMastery,
      topicMastery: learningPath.progress.topicMastery.filter((topic) =>
        state.settings.selectedSubject === "all"
          ? true
          : topic.subject === state.settings.selectedSubject,
      ),
      masteredTopics: learningPath.progress.topicMastery.filter(
        (topic) => topic.confidence >= 4,
      ),
      needsImprovementTopics: learningPath.progress.topicMastery.filter(
        (topic) => topic.confidence <= 2,
      ),
      subjectMastery: {
        react: scoreFromTopics(reactTopics),
        python: scoreFromTopics(pythonTopics),
        fullStack: scoreFromTopics(fullStackTopics),
        overall: scoreFromTopics(allTopicMastery),
      },
    };
  }, [
    learningPath.lessons,
    learningPath.progress.topicMastery,
    learningPath.projects,
    state.progress,
    state.settings.selectedSubject,
  ]);
}

"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store/app-store";

type ReviewResult = "know_it" | "unsure" | "review_again";

export type PracticeFlashcard = {
  id: string;
  lessonId: string;
  topicId: string;
  front: string;
  back: string;
  dueAt: string;
  isDue: boolean;
  confidence: number;
};

function dayKey(dateIso: string): string {
  const date = new Date(dateIso);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDaysISO(fromIso: string, days: number): string {
  const date = new Date(fromIso);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function useFlashcards() {
  const { state, learningPath, dispatch } = useAppStore();

  const cards = useMemo(() => {
    const now = Date.now();
    const reviewMap = new Map<
      string,
      { nextReviewAt: string; reviewedAt: string }
    >();

    for (const review of state.progress.flashcardReviews) {
      if (!reviewMap.has(review.flashcardId)) {
        reviewMap.set(review.flashcardId, {
          nextReviewAt: review.nextReviewAt,
          reviewedAt: review.reviewedAt,
        });
      }
    }

    const generated: PracticeFlashcard[] = [];

    learningPath.lessons.forEach((lesson) => {
      const topicConfidence =
        state.progress.topicMastery.find(
          (item) => item.topicId === lesson.topicId,
        )?.confidence ?? 3;

      lesson.memorizeSummary.slice(0, 3).forEach((summaryLine, index) => {
        const flashcardId = `${lesson.id}-mem-${index}`;
        const review = reviewMap.get(flashcardId);
        const dueAt = review?.nextReviewAt ?? new Date(0).toISOString();
        const isDue = new Date(dueAt).getTime() <= now;

        generated.push({
          id: flashcardId,
          lessonId: lesson.id,
          topicId: lesson.topicId,
          front: `Topic ${lesson.topicId}: Key rule ${index + 1}`,
          back: summaryLine,
          dueAt,
          isDue,
          confidence: topicConfidence,
        });
      });
    });

    return generated.sort((a, b) => {
      if (a.isDue !== b.isDue) {
        return a.isDue ? -1 : 1;
      }
      if (a.confidence !== b.confidence) {
        return a.confidence - b.confidence;
      }
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    });
  }, [
    learningPath.lessons,
    state.progress.flashcardReviews,
    state.progress.topicMastery,
  ]);

  const dueCards = useMemo(() => cards.filter((card) => card.isDue), [cards]);

  const reviewedTodayCount = useMemo(() => {
    const today = dayKey(new Date().toISOString());
    const visibleLessonIds = new Set(
      learningPath.lessons.map((lesson) => lesson.id),
    );
    return state.progress.flashcardReviews.filter(
      (review) =>
        dayKey(review.reviewedAt) === today &&
        visibleLessonIds.has(review.lessonId),
    ).length;
  }, [learningPath.lessons, state.progress.flashcardReviews]);

  const dailyReviewGoal = useMemo(() => {
    return Math.max(5, Math.round(state.settings.dailyGoalMinutes / 10));
  }, [state.settings.dailyGoalMinutes]);

  const reviewHistory7Days = useMemo(() => {
    const today = new Date();
    const byDay = new Map<string, number>();

    const visibleLessonIds = new Set(
      learningPath.lessons.map((lesson) => lesson.id),
    );

    state.progress.flashcardReviews.forEach((review) => {
      if (!visibleLessonIds.has(review.lessonId)) return;
      const key = dayKey(review.reviewedAt);
      byDay.set(key, (byDay.get(key) ?? 0) + 1);
    });

    const history: Array<{
      dateKey: string;
      label: string;
      reviewed: number;
      goal: number;
      completionPercent: number;
      goalHit: boolean;
    }> = [];

    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - i,
      );
      const dateKey = dayKey(day.toISOString());
      const reviewed = byDay.get(dateKey) ?? 0;
      const completionPercent = Math.min(
        100,
        Math.round((reviewed / Math.max(1, dailyReviewGoal)) * 100),
      );

      history.push({
        dateKey,
        label: day.toLocaleDateString("en-US", { weekday: "short" }),
        reviewed,
        goal: dailyReviewGoal,
        completionPercent,
        goalHit: reviewed >= dailyReviewGoal,
      });
    }

    return history;
  }, [dailyReviewGoal, learningPath.lessons, state.progress.flashcardReviews]);

  const goalCompletionPercent = useMemo(() => {
    return Math.min(
      100,
      Math.round((reviewedTodayCount / Math.max(1, dailyReviewGoal)) * 100),
    );
  }, [dailyReviewGoal, reviewedTodayCount]);

  const reviewCard = (card: PracticeFlashcard, result: ReviewResult) => {
    const reviewedAt = new Date().toISOString();
    const daysOffset = result === "know_it" ? 3 : result === "unsure" ? 1 : 0;
    const nextReviewAt = addDaysISO(reviewedAt, daysOffset);

    dispatch({
      type: "ADD_FLASHCARD_REVIEW",
      payload: {
        id: `flashcard-review-${Date.now()}`,
        flashcardId: card.id,
        lessonId: card.lessonId,
        topicId: card.topicId,
        result,
        reviewedAt,
        nextReviewAt,
      },
    });
  };

  return {
    cards,
    dueCards,
    nextCard: dueCards[0] ?? cards[0],
    reviewedTodayCount,
    dailyReviewGoal,
    goalCompletionPercent,
    remainingToday: Math.max(dailyReviewGoal - reviewedTodayCount, 0),
    reviewHistory7Days,
    reviewCard,
  };
}

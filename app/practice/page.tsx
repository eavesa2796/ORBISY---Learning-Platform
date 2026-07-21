"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/shared/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";
import { useFlashcards } from "@/hooks/use-flashcards";
import { useLessons } from "@/hooks/use-lessons";
import { useProgress } from "@/hooks/use-progress";

export default function PracticePage() {
  const { lessons, reviewLesson } = useLessons();
  const { progress, setTopicConfidence } = useProgress();
  const {
    dueCards,
    nextCard,
    reviewCard,
    reviewedTodayCount,
    dailyReviewGoal,
    goalCompletionPercent,
  } = useFlashcards();
  const [isRevealed, setIsRevealed] = useState(false);

  const lessonForCard = useMemo(
    () => lessons.find((lesson) => lesson.id === nextCard?.lessonId),
    [lessons, nextCard?.lessonId],
  );

  const handleReview = (result: "know_it" | "unsure" | "review_again") => {
    if (!nextCard) return;
    reviewCard(nextCard, result);
    setIsRevealed(false);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <SectionHeading
          title="Practice"
          description="Review weak topics, increase confidence ratings, and log deliberate repetition."
        />

        <SurfaceCard
          title="Spaced Review"
          subtitle={`${dueCards.length} cards due now • ${reviewedTodayCount}/${dailyReviewGoal} today (${goalCompletionPercent}%)`}
        >
          {!nextCard ? (
            <p className="text-sm text-slate-700">
              No review cards generated yet. Complete more lessons to expand
              your memory deck.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
                  Front
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {nextCard.front}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Topic confidence: {nextCard.confidence}
                </p>
              </div>

              {isRevealed ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">
                    Back
                  </p>
                  <p className="mt-1 text-sm text-emerald-900">
                    {nextCard.back}
                  </p>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsRevealed((current) => !current)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
                >
                  {isRevealed ? "Hide Answer" : "Reveal Answer"}
                </button>
                <button
                  type="button"
                  onClick={() => handleReview("review_again")}
                  className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700"
                >
                  Review Again
                </button>
                <button
                  type="button"
                  onClick={() => handleReview("unsure")}
                  className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700"
                >
                  Unsure
                </button>
                <button
                  type="button"
                  onClick={() => handleReview("know_it")}
                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"
                >
                  Know It
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Source lesson: {lessonForCard?.title ?? nextCard.lessonId}
                {" · "}
                <Link
                  href={`/lessons/${nextCard.lessonId}`}
                  className="underline"
                >
                  Open Lesson
                </Link>
              </p>
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard title="Topic Confidence" subtitle="1 = weak, 5 = solid">
          <div className="space-y-3">
            {progress.topicMastery.map((topic) => (
              <div
                key={topic.topicId}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {topic.topicId}
                  </p>
                  <p className="text-xs text-slate-600">
                    Reviews: {topic.reviewsCount}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={topic.confidence}
                    onChange={(event) =>
                      setTopicConfidence(
                        topic.topicId,
                        Number(event.target.value),
                      )
                    }
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const relatedLesson = lessons.find(
                        (lesson) => lesson.topicId === topic.topicId,
                      );
                      if (relatedLesson) {
                        reviewLesson(relatedLesson.id);
                      }
                    }}
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                  >
                    Add Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}

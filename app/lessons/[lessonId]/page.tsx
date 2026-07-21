"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/shared/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";
import { useLessons } from "@/hooks/use-lessons";
import { useNotes } from "@/hooks/use-notes";
import { useProgress } from "@/hooks/use-progress";
import { Lesson } from "@/types/models";

type GeneratedQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

function buildQuizQuestions(lesson: Lesson): GeneratedQuestion[] {
  return lesson.learningObjectives.slice(0, 3).map((objective, index) => {
    const correct =
      lesson.bestPractices[index] ??
      lesson.memorizeSummary[index] ??
      lesson.practicalExamples[index] ??
      objective;
    const wrongA =
      lesson.commonMistakes[index] ??
      lesson.commonMistakes[0] ??
      "Skip the mental model and rely on guesswork";
    const wrongB =
      lesson.practicalExamples[index] ??
      lesson.practicalExamples[0] ??
      "Avoid applying this concept in real projects";

    const permutations = [
      [correct, wrongA, wrongB],
      [wrongA, correct, wrongB],
      [wrongA, wrongB, correct],
    ];
    const options = permutations[index % permutations.length];
    const correctIndex = options.indexOf(correct);

    return {
      id: `${lesson.id}-q-${index + 1}`,
      prompt: `Which action best supports this objective: ${objective}?`,
      options,
      correctIndex,
    };
  });
}

export default function LessonDetailPage() {
  const params = useParams<{ lessonId: string }>();
  const lessonId = params.lessonId;

  const {
    getLessonById,
    modules,
    startLesson,
    completeLesson,
    submitQuizResult,
    submitExerciseResult,
  } = useLessons();
  const { progress, markLessonReview } = useProgress();
  const { createNote } = useNotes();

  const lesson = getLessonById(lessonId);
  const module = useMemo(
    () => modules.find((item) => item.id === lesson?.moduleId),
    [lesson?.moduleId, modules],
  );
  const topic = useMemo(
    () => module?.topics.find((item) => item.id === lesson?.topicId),
    [lesson?.topicId, module?.topics],
  );

  const isCompleted = lesson
    ? progress.completedLessonIds.includes(lesson.id)
    : false;
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, number>
  >({});
  const [quizResult, setQuizResult] = useState<string>("");
  const [exerciseMinutes, setExerciseMinutes] = useState<number>(20);
  const [exercisePassed, setExercisePassed] = useState<boolean>(true);
  const [reflection, setReflection] = useState<string>("");
  const [exerciseMessage, setExerciseMessage] = useState<string>("");

  if (!lesson) {
    return (
      <AppShell>
        <SurfaceCard title="Lesson Not Found">
          <p className="text-sm text-slate-700">
            This lesson does not exist in the current curriculum seed.
          </p>
          <Link
            href="/lessons"
            className="mt-3 inline-flex rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            Back to Lessons
          </Link>
        </SurfaceCard>
      </AppShell>
    );
  }

  const questions = buildQuizQuestions(lesson);

  const handleQuizSubmit = () => {
    const totalQuestions = questions.length;
    const correctAnswers = questions.filter(
      (question) => selectedAnswers[question.id] === question.correctIndex,
    ).length;
    const scorePercent = Math.round(
      (correctAnswers / Math.max(totalQuestions, 1)) * 100,
    );

    submitQuizResult({
      lessonId: lesson.id,
      scorePercent,
      totalQuestions,
      correctAnswers,
      durationMinutes: Math.max(5, Math.round(lesson.estimatedMinutes / 3)),
    });

    setQuizResult(
      `Saved quiz result: ${correctAnswers}/${totalQuestions} (${scorePercent}%).`,
    );
  };

  const handleExerciseSubmit = () => {
    submitExerciseResult({
      lessonId: lesson.id,
      passed: exercisePassed,
      durationMinutes: Math.max(5, exerciseMinutes),
    });

    if (exercisePassed) {
      completeLesson(lesson.id);
    }

    if (reflection.trim()) {
      createNote({
        lessonId: lesson.id,
        title: `Reflection: ${lesson.title}`,
        content: reflection.trim(),
        tags: ["reflection", lesson.topicId],
      });
    }

    markLessonReview(lesson.id);
    setExerciseMessage("Exercise and reflection saved to your progress.");
    setReflection("");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <SectionHeading
          title={lesson.title}
          description={`${module?.title ?? "Module"} • ${topic?.title ?? lesson.topicId} • ${lesson.estimatedMinutes} min`}
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => startLesson(lesson.id)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                Start Lesson
              </button>
              <button
                type="button"
                onClick={() => completeLesson(lesson.id)}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
              >
                {isCompleted ? "Completed" : "Mark Complete"}
              </button>
            </div>
          }
        />

        <div className="grid gap-4 xl:grid-cols-2">
          <SurfaceCard title="Core Understanding" subtitle={lesson.mentalModel}>
            <div className="space-y-3 text-sm text-slate-700">
              <p>{lesson.explanation}</p>
              <div>
                <p className="font-semibold text-slate-900">Objectives</p>
                <ul className="list-disc space-y-1 pl-5">
                  {lesson.learningObjectives.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Best Practices</p>
                <ul className="list-disc space-y-1 pl-5">
                  {lesson.bestPractices.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard
            title="Pitfalls and Memory Cues"
            subtitle="Use this before coding practice"
          >
            <div className="space-y-3 text-sm text-slate-700">
              <div>
                <p className="font-semibold text-slate-900">Common Mistakes</p>
                <ul className="list-disc space-y-1 pl-5">
                  {lesson.commonMistakes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Memorize Summary</p>
                <ul className="list-disc space-y-1 pl-5">
                  {lesson.memorizeSummary.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </SurfaceCard>
        </div>

        <SurfaceCard
          title="Quick Quiz"
          subtitle="Submit a score to update mastery weighting"
        >
          <div className="space-y-4">
            {questions.map((question, qIndex) => (
              <fieldset
                key={question.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <legend className="mb-2 text-sm font-medium text-slate-900">
                  Q{qIndex + 1}. {question.prompt}
                </legend>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={`${question.id}-${optionIndex}`}
                      className="flex items-start gap-2 text-sm text-slate-700"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        checked={selectedAnswers[question.id] === optionIndex}
                        onChange={() =>
                          setSelectedAnswers((current) => ({
                            ...current,
                            [question.id]: optionIndex,
                          }))
                        }
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <button
              type="button"
              onClick={handleQuizSubmit}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Submit Quiz Result
            </button>
            {quizResult ? (
              <p className="text-sm text-emerald-700">{quizResult}</p>
            ) : null}
          </div>
        </SurfaceCard>

        <SurfaceCard title="Coding Exercise" subtitle={lesson.codingExerciseId}>
          <div className="space-y-3 text-sm text-slate-700">
            <div>
              <p className="font-semibold text-slate-900">Practice Prompts</p>
              <ul className="list-disc space-y-1 pl-5">
                {lesson.practicalExamples.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1">
                Minutes spent
                <input
                  type="number"
                  min={5}
                  value={exerciseMinutes}
                  onChange={(event) =>
                    setExerciseMinutes(Number(event.target.value) || 5)
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2"
                />
              </label>
              <label className="grid gap-1">
                Outcome
                <select
                  value={exercisePassed ? "passed" : "not-passed"}
                  onChange={(event) =>
                    setExercisePassed(event.target.value === "passed")
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2"
                >
                  <option value="passed">Passed</option>
                  <option value="not-passed">Not passed yet</option>
                </select>
              </label>
            </div>
            <label className="grid gap-1">
              Reflection note
              <textarea
                rows={3}
                value={reflection}
                onChange={(event) => setReflection(event.target.value)}
                placeholder={lesson.reflectionQuestion}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2"
              />
            </label>
            <button
              type="button"
              onClick={handleExerciseSubmit}
              className="w-fit rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Save Exercise Result
            </button>
            {exerciseMessage ? (
              <p className="text-sm text-emerald-700">{exerciseMessage}</p>
            ) : null}
          </div>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lesson } from "@/data/lessons";

type Progress = {
  answers: Record<string, number>;
  confidence: number;
  projectStarted: boolean;
};

const emptyProgress: Progress = {
  answers: {},
  confidence: 0,
  projectStarted: false,
};

export default function InteractiveLesson({ lesson }: { lesson: Lesson }) {
  const storageKey = `orbisy:lesson:${lesson.id}`;
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) setProgress(JSON.parse(saved) as Progress);
    } catch {
      setProgress(emptyProgress);
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [hydrated, progress, storageKey]);

  const score = useMemo(() => {
    const correct = lesson.checkpoints.filter(
      (checkpoint) => progress.answers[checkpoint.id] === checkpoint.answer,
    ).length;
    return Math.round((correct / lesson.checkpoints.length) * 100);
  }, [lesson.checkpoints, progress.answers]);

  const answered = Object.keys(progress.answers).length;
  const mastered =
    answered === lesson.checkpoints.length &&
    score >= 80 &&
    progress.confidence >= 4 &&
    progress.projectStarted;

  const status = mastered
    ? "Mastered"
    : answered === lesson.checkpoints.length && score < 70
      ? "Needs improvement"
      : "In progress";

  function chooseAnswer(checkpointId: string, optionIndex: number) {
    setProgress((current) => ({
      ...current,
      answers: { ...current.answers, [checkpointId]: optionIndex },
    }));
  }

  return (
    <div className="lesson-layout">
      <aside className="lesson-sidebar card">
        <p className="label">{lesson.track}</p>
        <h1>{lesson.title}</h1>
        <p>{lesson.summary}</p>
        <dl className="lesson-stats">
          <div>
            <dt>Status</dt>
            <dd>{status}</dd>
          </div>
          <div>
            <dt>Recall score</dt>
            <dd>{answered ? `${score}%` : "Not attempted"}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{lesson.estimatedMinutes} minutes</dd>
          </div>
        </dl>
        <button
          className="btn ghost lesson-reset"
          type="button"
          onClick={() => setProgress(emptyProgress)}
        >
          Reset lesson progress
        </button>
      </aside>

      <div className="lesson-content">
        <section className="page-card card">
          <p className="label">Start here</p>
          <h2>What you should be able to do</h2>
          <ul>
            {lesson.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        </section>

        <section className="page-card card lesson-highlight">
          <p className="label">Mental model</p>
          <h2>Understand this before syntax</h2>
          <p className="lesson-lead">{lesson.mentalModel}</p>
        </section>

        <section className="page-card card">
          <p className="label">Explanation</p>
          <h2>How state and rendering work</h2>
          {lesson.explanation.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <pre className="code-block"><code>{lesson.example}</code></pre>
        </section>

        <section className="page-card card">
          <p className="label">Memorize</p>
          <h2>The rules worth keeping</h2>
          <div className="memorize-grid">
            {lesson.memorize.map((item) => (
              <div className="memorize-item" key={item}>{item}</div>
            ))}
          </div>
          <h3>Common mistakes</h3>
          <ul>
            {lesson.mistakes.map((mistake) => (
              <li key={mistake}>{mistake}</li>
            ))}
          </ul>
        </section>

        <section className="page-card card">
          <p className="label">Active recall</p>
          <h2>Answer before revealing the explanation</h2>
          <div className="checkpoint-list">
            {lesson.checkpoints.map((checkpoint, index) => {
              const selected = progress.answers[checkpoint.id];
              const hasAnswered = selected !== undefined;
              return (
                <article className="checkpoint" key={checkpoint.id}>
                  <h3>{index + 1}. {checkpoint.prompt}</h3>
                  <div className="answer-grid">
                    {checkpoint.options.map((option, optionIndex) => {
                      const isSelected = selected === optionIndex;
                      const isCorrect = hasAnswered && optionIndex === checkpoint.answer;
                      const isWrong = hasAnswered && isSelected && !isCorrect;
                      const classes = [
                        "answer-button",
                        isCorrect ? "answer-correct" : "",
                        isWrong ? "answer-wrong" : "",
                      ].filter(Boolean).join(" ");
                      return (
                        <button
                          className={classes}
                          key={option}
                          type="button"
                          onClick={() => chooseAnswer(checkpoint.id, optionIndex)}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {hasAnswered && (
                    <p className="feedback">
                      <strong>{selected === checkpoint.answer ? "Correct." : "Review this."}</strong>{" "}
                      {checkpoint.explanation}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="page-card card">
          <p className="label">Build independently</p>
          <h2>{lesson.project.title}</h2>
          <p>{lesson.project.brief}</p>
          <ul>
            {lesson.project.requirements.map((requirement) => (
              <li key={requirement}>{requirement}</li>
            ))}
          </ul>
          <p><strong>Stretch:</strong> {lesson.project.stretch}</p>
          <label className="project-check">
            <input
              type="checkbox"
              checked={progress.projectStarted}
              onChange={(event) =>
                setProgress((current) => ({
                  ...current,
                  projectStarted: event.target.checked,
                }))
              }
            />
            I started this project without copying a finished solution.
          </label>
        </section>

        <section className="page-card card">
          <p className="label">Self-assessment</p>
          <h2>How confidently could you explain this?</h2>
          <div className="confidence-row" role="group" aria-label="Confidence rating">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                className={progress.confidence === rating ? "confidence-active" : ""}
                key={rating}
                type="button"
                onClick={() => setProgress((current) => ({ ...current, confidence: rating }))}
              >
                {rating}
              </button>
            ))}
          </div>
          <p className="feedback">
            Mastery requires at least 80% recall, confidence of 4 or higher, and starting the independent project.
          </p>
        </section>
      </div>
    </div>
  );
}

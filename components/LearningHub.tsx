"use client";

import { useMemo, useState } from "react";
import InteractiveLesson from "@/components/InteractiveLesson";
import { lessons, type Track } from "@/data/lessons";

const tracks: Array<Track | "All"> = ["All", "React", "Python", "SQL"];

export default function LearningHub() {
  const [track, setTrack] = useState<Track | "All">("All");
  const [lessonId, setLessonId] = useState(lessons[0]?.id ?? "");

  const visibleLessons = useMemo(
    () => (track === "All" ? lessons : lessons.filter((lesson) => lesson.track === track)),
    [track],
  );

  const selectedLesson =
    visibleLessons.find((lesson) => lesson.id === lessonId) ?? visibleLessons[0] ?? lessons[0];

  function chooseTrack(nextTrack: Track | "All") {
    setTrack(nextTrack);
    const firstLesson =
      nextTrack === "All" ? lessons[0] : lessons.find((lesson) => lesson.track === nextTrack);
    if (firstLesson) setLessonId(firstLesson.id);
  }

  if (!selectedLesson) {
    return <section className="page-card card">No lessons are available yet.</section>;
  }

  return (
    <>
      <section className="page-card card">
        <p className="label">Curriculum</p>
        <h1>Learn React, Python, and SQL by doing</h1>
        <p>
          Choose a track and lesson. Each lesson combines a mental model, worked example,
          active recall, an independent project, and a mastery check.
        </p>

        <div className="actions" role="group" aria-label="Filter lessons by track">
          {tracks.map((item) => (
            <button
              className={`btn ${track === item ? "primary" : "ghost"}`}
              key={item}
              type="button"
              onClick={() => chooseTrack(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid-three">
          {visibleLessons.map((lesson) => (
            <button
              className={`mini-card lesson-picker ${selectedLesson.id === lesson.id ? "lesson-picker-active" : ""}`}
              key={lesson.id}
              type="button"
              onClick={() => setLessonId(lesson.id)}
            >
              <span className="label">{lesson.track}</span>
              <h2>{lesson.title}</h2>
              <p>{lesson.module} · {lesson.estimatedMinutes} min</p>
            </button>
          ))}
        </div>
      </section>

      <InteractiveLesson key={selectedLesson.id} lesson={selectedLesson} />
    </>
  );
}

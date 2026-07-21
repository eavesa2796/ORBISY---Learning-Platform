"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store/app-store";

export function useNotes() {
  const { state, learningPath, dispatch } = useAppStore();

  const sortedNotes = useMemo(() => {
    return [...learningPath.notes].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [learningPath.notes]);

  return {
    notes: sortedNotes,
    createNote: (payload: {
      lessonId?: string;
      title: string;
      content: string;
      tags: string[];
    }) =>
      dispatch({
        type: "ADD_NOTE",
        payload: {
          ...payload,
          subject: payload.lessonId
            ? (state.lessons.find((lesson) => lesson.id === payload.lessonId)
                ?.subject ??
              (state.settings.selectedSubject === "all"
                ? "react"
                : state.settings.selectedSubject))
            : state.settings.selectedSubject === "all"
              ? "react"
              : state.settings.selectedSubject,
        },
      }),
    updateNote: (
      noteId: string,
      title: string,
      content: string,
      tags: string[],
    ) => dispatch({ type: "UPDATE_NOTE", noteId, title, content, tags }),
    deleteNote: (noteId: string) => dispatch({ type: "DELETE_NOTE", noteId }),
  };
}

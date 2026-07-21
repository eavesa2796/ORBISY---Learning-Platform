"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/shared/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";
import { useNotes } from "@/hooks/use-notes";

export default function NotesPage() {
  const { notes, createNote, deleteNote } = useNotes();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createNote({
      title: title.trim(),
      content: content.trim(),
      tags: tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });

    setTitle("");
    setContent("");
    setTags("");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <SectionHeading
          title="Notes"
          description="Capture mental models, mistakes, and patterns worth repeating."
        />

        <SurfaceCard title="Add Note">
          <form onSubmit={handleSubmit} className="grid gap-3">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Note title"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="What did you learn?"
              rows={4}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="tags, comma, separated"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="w-fit rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Save Note
            </button>
          </form>
        </SurfaceCard>

        <SurfaceCard title="Saved Notes">
          <div className="space-y-3">
            {notes.map((note) => (
              <article
                key={note.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {note.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {note.content}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {note.tags.join(", ") || "No tags"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteNote(note.id)}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}

"use client";

import { ChangeEvent, useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeading } from "@/components/shared/section-heading";
import { SurfaceCard } from "@/components/ui/surface-card";
import { useAppStore } from "@/store/app-store";
import { ThemePreference } from "@/types/models";

export default function SettingsPage() {
  const { state, dispatch, exportState, importState, resetState } =
    useAppStore();
  const [message, setMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = () => {
    const content = exportState();
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "code-mastery-backup.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Export completed.");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const result = importState(text);

    if (result.ok) {
      setMessage("Import completed.");
    } else {
      setMessage(result.error ?? "Import failed.");
    }

    event.target.value = "";
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <SectionHeading
          title="Settings"
          description="Tune your study cadence and manage your local learning data."
        />

        <SurfaceCard title="Preferences">
          <div className="grid gap-3 sm:grid-cols-4">
            <label className="grid gap-1 text-sm text-slate-700">
              Daily Goal (minutes)
              <input
                type="number"
                value={state.settings.dailyGoalMinutes}
                onChange={(event) =>
                  dispatch({
                    type: "UPDATE_SETTINGS",
                    payload: {
                      dailyGoalMinutes: Number(event.target.value) || 0,
                    },
                  })
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm text-slate-700">
              Session Length (minutes)
              <input
                type="number"
                value={state.settings.preferredSessionLength}
                onChange={(event) =>
                  dispatch({
                    type: "UPDATE_SETTINGS",
                    payload: {
                      preferredSessionLength: Number(event.target.value) || 0,
                    },
                  })
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm text-slate-700">
              Theme
              <select
                value={state.settings.theme}
                onChange={(event) =>
                  dispatch({
                    type: "UPDATE_SETTINGS",
                    payload: { theme: event.target.value as ThemePreference },
                  })
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-2"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm text-slate-700">
              Default Subject
              <select
                value={state.settings.defaultSubject}
                onChange={(event) =>
                  dispatch({
                    type: "UPDATE_SETTINGS",
                    payload: {
                      defaultSubject: event.target.value as
                        | "all"
                        | "react"
                        | "python"
                        | "full-stack",
                      selectedSubject: event.target.value as
                        | "all"
                        | "react"
                        | "python"
                        | "full-stack",
                    },
                  })
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-2"
              >
                <option value="all">All Subjects</option>
                <option value="react">React</option>
                <option value="python">Python</option>
              </select>
            </label>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
            {[
              { key: "react-path", label: "React Track" },
              { key: "python-path", label: "Python Track" },
              { key: "full-stack-path", label: "Full-Stack Track" },
            ].map((track) => {
              const enabled = state.settings.enabledTracks.includes(
                track.key as "react-path" | "python-path" | "full-stack-path",
              );
              return (
                <label
                  key={track.key}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(event) => {
                      const next = event.target.checked
                        ? [
                            ...state.settings.enabledTracks,
                            track.key as
                              | "react-path"
                              | "python-path"
                              | "full-stack-path",
                          ]
                        : state.settings.enabledTracks.filter(
                            (item) => item !== track.key,
                          );
                      dispatch({
                        type: "UPDATE_SETTINGS",
                        payload: { enabledTracks: next },
                      });
                    }}
                  />
                  {track.label}
                </label>
              );
            })}
          </div>
        </SurfaceCard>

        <SurfaceCard
          title="Data Controls"
          subtitle="Export, import, or reset local progress data"
        >
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={handleImportClick}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Import JSON
            </button>
            <button
              type="button"
              onClick={() => {
                resetState();
                setMessage("State reset to seeded defaults.");
              }}
              className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700"
            >
              Reset All
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
          {message ? (
            <p className="mt-3 text-sm text-slate-600">{message}</p>
          ) : null}
        </SurfaceCard>
      </div>
    </AppShell>
  );
}

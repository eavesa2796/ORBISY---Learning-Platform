"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import {
  Achievement,
  DashboardInsight,
  ExerciseAttempt,
  FlashcardReview,
  LearningModule,
  Lesson,
  LearningPathSettings,
  LearningPathState,
  LessonStatus,
  Note,
  Project,
  ProjectStatus,
  QuizAttempt,
  QuizResult,
  StudySession,
  Subject,
  SubjectFilter,
  ThemePreference,
  TopicMastery,
  UserProfile,
  UserProgress,
} from "@/types/models";
import { seededModules } from "@/data/modules";
import { seededLessons } from "@/data/lessons";
import { seededProjects } from "@/data/projects";
import { seededAchievements } from "@/data/achievements";
import { calculateMasteryBreakdown } from "@/lib/mastery";
import { toPercent } from "@/lib/utils";

const STORAGE_KEY = "react-mastery-app-state-v1";

type AppState = {
  profile: UserProfile;
  settings: LearningPathSettings;
  modules: LearningModule[];
  lessons: Lesson[];
  projects: Project[];
  achievementsCatalog: Achievement[];
  progress: UserProgress;
  notes: Note[];
  insights: DashboardInsight[];
};

type AppAction =
  | { type: "HYDRATE"; payload: AppState }
  | { type: "COMPLETE_LESSON"; lessonId: string }
  | { type: "START_LESSON"; lessonId: string }
  | { type: "MARK_LESSON_REVIEW"; lessonId: string }
  | { type: "SET_TOPIC_CONFIDENCE"; topicId: string; confidence: number }
  | { type: "ADD_NOTE"; payload: Omit<Note, "id" | "createdAt" | "updatedAt"> }
  | { type: "DELETE_NOTE"; noteId: string }
  | {
      type: "UPDATE_NOTE";
      noteId: string;
      title: string;
      content: string;
      tags: string[];
    }
  | { type: "MARK_PROJECT_STATUS"; projectId: string; status: ProjectStatus }
  | { type: "ADD_STUDY_SESSION"; payload: Omit<StudySession, "id"> }
  | { type: "ADD_QUIZ_RESULT"; payload: QuizAttempt }
  | { type: "ADD_EXERCISE_RESULT"; payload: ExerciseAttempt }
  | { type: "ADD_FLASHCARD_REVIEW"; payload: FlashcardReview }
  | { type: "UPDATE_SETTINGS"; payload: Partial<LearningPathSettings> }
  | { type: "RESET_ALL"; payload: AppState }
  | { type: "IMPORT_STATE"; payload: AppState };

type AppStoreValue = {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  learningPath: LearningPathState;
  exportState: () => string;
  importState: (content: string) => { ok: boolean; error?: string };
  resetState: () => void;
};

const AppStoreContext = createContext<AppStoreValue | null>(null);

function startOfDayISO(date = new Date()): string {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).toISOString();
}

function getDaysAgoISO(daysAgo: number): string {
  const now = new Date();
  const date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - daysAgo,
  );
  return date.toISOString();
}

function buildInitialTopicMastery(lessons: Lesson[]): TopicMastery[] {
  const topicMap = new Map<
    string,
    { topicId: string; subject: Subject; moduleId: string; lessonIds: string[] }
  >();

  lessons.forEach((lesson) => {
    const existing = topicMap.get(lesson.topicId);
    if (existing) {
      existing.lessonIds.push(lesson.id);
      return;
    }

    topicMap.set(lesson.topicId, {
      topicId: lesson.topicId,
      subject: lesson.subject,
      moduleId: lesson.moduleId,
      lessonIds: [lesson.id],
    });
  });

  return Array.from(topicMap.values()).map((item, index) => ({
    topicId: item.topicId,
    subject: item.subject,
    moduleId: item.moduleId,
    confidence: index % 3 === 0 ? 2 : 3,
    reviewsCount: index % 4,
    lastReviewedAt: getDaysAgoISO(index + 2),
    lessonIds: item.lessonIds,
  }));
}

function buildInitialProfile(): UserProfile {
  return {
    id: "user-anthony",
    name: "Anthony",
    timezone: "America/New_York",
    createdAt: new Date().toISOString(),
  };
}

function buildInitialSettings(): LearningPathSettings {
  return {
    dailyGoalMinutes: 60,
    preferredSessionLength: 30,
    theme: "system",
    remindersEnabled: true,
    autoAdvanceLessons: false,
    selectedSubject: "all",
    defaultSubject: "all",
    enabledTracks: ["react-path", "python-path", "full-stack-path"],
  };
}

function buildInitialProgress(
  lessons: Lesson[],
  projects: Project[],
): UserProgress {
  const completedLessonIds = lessons.slice(0, 4).map((lesson) => lesson.id);
  const inProgressLessonIds = lessons.slice(4, 7).map((lesson) => lesson.id);

  const lessonStatuses: Record<string, LessonStatus> = Object.fromEntries(
    lessons.map((lesson) => {
      if (completedLessonIds.includes(lesson.id))
        return [lesson.id, "completed"];
      if (inProgressLessonIds.includes(lesson.id))
        return [lesson.id, "in-progress"];
      return [lesson.id, "not-started"];
    }),
  );

  const projectProgress = projects.slice(0, 8).map((project, index) => ({
    projectId: project.id,
    status:
      index === 0
        ? ("completed" as ProjectStatus)
        : index <= 2
          ? ("in-progress" as ProjectStatus)
          : ("not-started" as ProjectStatus),
    startedAt: getDaysAgoISO(12 - index),
    completedAt: index === 0 ? getDaysAgoISO(5) : undefined,
    notes: "",
  }));

  const quizAttempts: QuizAttempt[] = [
    {
      id: "quiz-attempt-1",
      lessonId: lessons[0]?.id ?? "",
      scorePercent: 88,
      totalQuestions: 10,
      correctAnswers: 9,
      completedAt: getDaysAgoISO(2),
      durationMinutes: 9,
    },
    {
      id: "quiz-attempt-2",
      lessonId: lessons[1]?.id ?? "",
      scorePercent: 76,
      totalQuestions: 10,
      correctAnswers: 8,
      completedAt: getDaysAgoISO(1),
      durationMinutes: 12,
    },
  ];

  const exerciseAttempts = [
    {
      id: "exercise-attempt-1",
      lessonId: lessons[2]?.id ?? "",
      passed: true,
      completedAt: getDaysAgoISO(1),
      durationMinutes: 20,
    },
    {
      id: "exercise-attempt-2",
      lessonId: lessons[5]?.id ?? "",
      passed: false,
      completedAt: getDaysAgoISO(0),
      durationMinutes: 25,
    },
  ];

  const studySessions: StudySession[] = [
    {
      id: "session-1",
      startedAt: getDaysAgoISO(2),
      endedAt: getDaysAgoISO(2),
      durationMinutes: 45,
      lessonIds: [lessons[0]?.id ?? ""],
      noteIds: [],
      focusScore: 4,
    },
    {
      id: "session-2",
      startedAt: getDaysAgoISO(1),
      endedAt: getDaysAgoISO(1),
      durationMinutes: 60,
      lessonIds: [lessons[1]?.id ?? "", lessons[2]?.id ?? ""],
      noteIds: [],
      focusScore: 5,
    },
    {
      id: "session-3",
      startedAt: getDaysAgoISO(0),
      endedAt: getDaysAgoISO(0),
      durationMinutes: 30,
      lessonIds: [lessons[5]?.id ?? ""],
      noteIds: [],
      focusScore: 3,
    },
  ];

  const achievements = [
    { achievementId: "first-lesson", unlockedAt: getDaysAgoISO(5) },
    { achievementId: "project-shipper", unlockedAt: getDaysAgoISO(4) },
    { achievementId: "streak-3", unlockedAt: getDaysAgoISO(1) },
  ];

  const flashcardReviews: FlashcardReview[] = [
    {
      id: "flashcard-review-1",
      flashcardId: `${lessons[0]?.id ?? "lesson"}-mem-0`,
      lessonId: lessons[0]?.id ?? "",
      topicId: lessons[0]?.topicId ?? "",
      result: "know_it",
      reviewedAt: getDaysAgoISO(2),
      nextReviewAt: getDaysAgoISO(-1),
    },
    {
      id: "flashcard-review-2",
      flashcardId: `${lessons[1]?.id ?? "lesson"}-mem-0`,
      lessonId: lessons[1]?.id ?? "",
      topicId: lessons[1]?.topicId ?? "",
      result: "unsure",
      reviewedAt: getDaysAgoISO(1),
      nextReviewAt: getDaysAgoISO(0),
    },
  ];

  return {
    completedLessonIds,
    inProgressLessonIds,
    lessonStatuses,
    topicMastery: buildInitialTopicMastery(lessons),
    quizAttempts,
    exerciseAttempts,
    flashcardReviews,
    projectProgress,
    studySessions,
    achievements,
    currentStreakDays: 4,
    longestStreakDays: 6,
    totalStudyMinutes: studySessions.reduce(
      (sum, session) => sum + session.durationMinutes,
      0,
    ),
    lastStudyDate: startOfDayISO(),
  };
}

function buildInitialNotes(lessons: Lesson[]): Note[] {
  const now = new Date().toISOString();
  return [
    {
      id: "note-1",
      lessonId: lessons[0]?.id,
      title: "State Snapshot Rule",
      content:
        "If an update depends on previous state, use functional updates. Avoid direct object mutation.",
      tags: ["state", "immutability"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "note-2",
      lessonId: lessons[7]?.id,
      title: "Effects Checklist",
      content:
        "Effect needed only for external sync. Keep render pure and list true dependencies.",
      tags: ["useEffect", "patterns"],
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function buildInsights(
  progress: UserProgress,
  lessons: Lesson[],
  projects: Project[],
): DashboardInsight[] {
  const completedCount = progress.completedLessonIds.length;
  const inProgressCount = progress.inProgressLessonIds.length;
  const mastery = calculateMasteryBreakdown(progress, lessons, projects);

  return [
    {
      id: "insight-velocity",
      title: "Learning Velocity",
      summary: `You completed ${completedCount} lessons and have ${inProgressCount} in progress.`,
      type: "success",
    },
    {
      id: "insight-streak",
      title: "Streak Momentum",
      summary: `Current streak is ${progress.currentStreakDays} days. One focused session today extends it.`,
      type: "info",
    },
    {
      id: "insight-mastery",
      title: "Mastery Snapshot",
      summary: `Overall mastery is ${toPercent(mastery.overall)}%. Quiz and exercise consistency will move this fastest.`,
      type: "warning",
    },
  ];
}

function createSeedState(): AppState {
  const profile = buildInitialProfile();
  const settings = buildInitialSettings();
  const modules = seededModules;
  const lessons = seededLessons;
  const projects = seededProjects;
  const achievementsCatalog = seededAchievements;
  const progress = buildInitialProgress(lessons, projects);
  const notes = buildInitialNotes(lessons);
  const insights = buildInsights(progress, lessons, projects);

  return {
    profile,
    settings,
    modules,
    lessons,
    projects,
    achievementsCatalog,
    progress,
    notes,
    insights,
  };
}

const initialSeedState = createSeedState();

function inferSubjectFromId(value: string): Subject {
  return value.startsWith("py-") ? "python" : "react";
}

function normalizeState(parsed: AppState): AppState {
  const modules = parsed.modules.map((module) => ({
    ...module,
    subject: module.subject ?? inferSubjectFromId(module.id),
  }));

  const lessons = parsed.lessons.map((lesson) => ({
    ...lesson,
    subject: lesson.subject ?? inferSubjectFromId(lesson.id),
  }));

  const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));

  const projects = parsed.projects.map((project) => ({
    ...project,
    subject: project.subject ?? inferSubjectFromId(project.id),
  }));

  const notes = parsed.notes.map((note) => {
    if (note.subject) return note;
    const lesson = note.lessonId ? lessonById.get(note.lessonId) : undefined;
    return {
      ...note,
      subject: lesson?.subject ?? "react",
    };
  });

  const topicMastery = parsed.progress.topicMastery.map((topic) => {
    if (topic.subject && topic.moduleId) {
      return topic;
    }
    const relatedLesson = topic.lessonIds
      .map((id) => lessonById.get(id))
      .find(Boolean);
    return {
      ...topic,
      subject: relatedLesson?.subject ?? "react",
      moduleId: relatedLesson?.moduleId ?? "module-js-foundations",
    };
  });

  return {
    ...parsed,
    modules,
    lessons,
    projects,
    notes,
    settings: {
      ...parsed.settings,
      selectedSubject:
        parsed.settings.selectedSubject ??
        parsed.settings.defaultSubject ??
        "all",
      defaultSubject: parsed.settings.defaultSubject ?? "all",
      enabledTracks: parsed.settings.enabledTracks ?? [
        "react-path",
        "python-path",
        "full-stack-path",
      ],
    },
    progress: {
      ...parsed.progress,
      flashcardReviews: parsed.progress.flashcardReviews ?? [],
      topicMastery,
    },
  };
}

function normalizeProgress(progress: UserProgress): UserProgress {
  return {
    ...progress,
    flashcardReviews: progress.flashcardReviews ?? [],
  };
}

function parseStoredState(raw: string): AppState | null {
  try {
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || !parsed.profile || !parsed.progress || !parsed.settings) {
      return null;
    }
    return normalizeState({
      ...parsed,
      progress: normalizeProgress(parsed.progress),
    });
  } catch {
    return null;
  }
}

function subjectMatches(filter: SubjectFilter, value: Subject): boolean {
  return filter === "all" ? true : filter === value;
}

function getScopedLessons(state: AppState): Lesson[] {
  const filter = state.settings.selectedSubject;
  return state.lessons.filter((lesson) =>
    subjectMatches(filter, lesson.subject),
  );
}

function getScopedProjects(state: AppState): Project[] {
  const filter = state.settings.selectedSubject;
  return state.projects.filter((project) =>
    subjectMatches(filter, project.subject),
  );
}

function getScopedTopicMastery(state: AppState): TopicMastery[] {
  const filter = state.settings.selectedSubject;
  return state.progress.topicMastery.filter((topic) =>
    subjectMatches(filter, topic.subject),
  );
}

function withDerivedState(state: AppState): AppState {
  return {
    ...state,
    insights: buildInsights(state.progress, state.lessons, state.projects),
  };
}

function updateStreak(current: UserProgress): UserProgress {
  const todayIso = startOfDayISO();
  const lastStudyDate = current.lastStudyDate;

  if (lastStudyDate === todayIso) {
    return current;
  }

  const lastDate = new Date(lastStudyDate);
  const today = new Date(todayIso);
  const oneDayMs = 24 * 60 * 60 * 1000;
  const dayDiff = Math.floor((today.getTime() - lastDate.getTime()) / oneDayMs);

  const currentStreakDays = dayDiff === 1 ? current.currentStreakDays + 1 : 1;

  return {
    ...current,
    currentStreakDays,
    longestStreakDays: Math.max(current.longestStreakDays, currentStreakDays),
    lastStudyDate: todayIso,
  };
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "HYDRATE":
      return withDerivedState(action.payload);

    case "COMPLETE_LESSON": {
      const lessonId = action.lessonId;
      const completed = Array.from(
        new Set([...state.progress.completedLessonIds, lessonId]),
      );
      const inProgress = state.progress.inProgressLessonIds.filter(
        (id) => id !== lessonId,
      );

      const nextProgress: UserProgress = updateStreak({
        ...state.progress,
        completedLessonIds: completed,
        inProgressLessonIds: inProgress,
        lessonStatuses: {
          ...state.progress.lessonStatuses,
          [lessonId]: "completed",
        },
        totalStudyMinutes: state.progress.totalStudyMinutes + 20,
      });

      return withDerivedState({
        ...state,
        progress: nextProgress,
      });
    }

    case "START_LESSON": {
      const lessonId = action.lessonId;
      if (state.progress.completedLessonIds.includes(lessonId)) {
        return state;
      }

      const inProgress = Array.from(
        new Set([...state.progress.inProgressLessonIds, lessonId]),
      );

      return withDerivedState({
        ...state,
        progress: {
          ...state.progress,
          inProgressLessonIds: inProgress,
          lessonStatuses: {
            ...state.progress.lessonStatuses,
            [lessonId]: "in-progress",
          },
        },
      });
    }

    case "MARK_LESSON_REVIEW": {
      const lesson = state.lessons.find((item) => item.id === action.lessonId);
      if (!lesson) return state;

      const mastery = state.progress.topicMastery.map((item) =>
        item.topicId === lesson.topicId
          ? {
              ...item,
              reviewsCount: item.reviewsCount + 1,
              lastReviewedAt: new Date().toISOString(),
            }
          : item,
      );

      return withDerivedState({
        ...state,
        progress: {
          ...state.progress,
          topicMastery: mastery,
        },
      });
    }

    case "SET_TOPIC_CONFIDENCE": {
      const nextTopicMastery = state.progress.topicMastery.map((item) =>
        item.topicId === action.topicId
          ? {
              ...item,
              confidence: Math.max(1, Math.min(5, action.confidence)),
              lastReviewedAt: new Date().toISOString(),
            }
          : item,
      );

      return withDerivedState({
        ...state,
        progress: {
          ...state.progress,
          topicMastery: nextTopicMastery,
        },
      });
    }

    case "ADD_NOTE": {
      const timestamp = new Date().toISOString();
      const note: Note = {
        id: `note-${Date.now()}`,
        createdAt: timestamp,
        updatedAt: timestamp,
        ...action.payload,
      };

      return {
        ...state,
        notes: [note, ...state.notes],
      };
    }

    case "DELETE_NOTE":
      return {
        ...state,
        notes: state.notes.filter((item) => item.id !== action.noteId),
      };

    case "UPDATE_NOTE": {
      const notes = state.notes.map((item) =>
        item.id === action.noteId
          ? {
              ...item,
              title: action.title,
              content: action.content,
              tags: action.tags,
              updatedAt: new Date().toISOString(),
            }
          : item,
      );

      return {
        ...state,
        notes,
      };
    }

    case "MARK_PROJECT_STATUS": {
      const projectProgress = state.progress.projectProgress.map((item) =>
        item.projectId === action.projectId
          ? {
              ...item,
              status: action.status,
              startedAt:
                action.status === "in-progress" && !item.startedAt
                  ? new Date().toISOString()
                  : item.startedAt,
              completedAt:
                action.status === "completed"
                  ? new Date().toISOString()
                  : item.completedAt,
            }
          : item,
      );

      const nextProgress =
        action.status === "completed"
          ? updateStreak({ ...state.progress, projectProgress })
          : { ...state.progress, projectProgress };

      return withDerivedState({
        ...state,
        progress: nextProgress,
      });
    }

    case "ADD_STUDY_SESSION": {
      const session: StudySession = {
        id: `session-${Date.now()}`,
        ...action.payload,
      };

      const nextProgress: UserProgress = updateStreak({
        ...state.progress,
        studySessions: [session, ...state.progress.studySessions],
        totalStudyMinutes:
          state.progress.totalStudyMinutes + session.durationMinutes,
      });

      return withDerivedState({
        ...state,
        progress: nextProgress,
      });
    }

    case "ADD_QUIZ_RESULT": {
      const attempts = [action.payload, ...state.progress.quizAttempts];
      const nextProgress = updateStreak({
        ...state.progress,
        quizAttempts: attempts,
      });

      return withDerivedState({
        ...state,
        progress: nextProgress,
      });
    }

    case "ADD_EXERCISE_RESULT": {
      const attempts = [action.payload, ...state.progress.exerciseAttempts];
      const nextProgress = updateStreak({
        ...state.progress,
        exerciseAttempts: attempts,
        totalStudyMinutes: state.progress.totalStudyMinutes + 25,
      });

      return withDerivedState({
        ...state,
        progress: nextProgress,
      });
    }

    case "ADD_FLASHCARD_REVIEW": {
      const reviews = [action.payload, ...state.progress.flashcardReviews];
      const confidenceDelta =
        action.payload.result === "know_it"
          ? 1
          : action.payload.result === "review_again"
            ? -1
            : 0;

      const nextTopicMastery = state.progress.topicMastery.map((item) =>
        item.topicId === action.payload.topicId
          ? {
              ...item,
              confidence: Math.max(
                1,
                Math.min(5, item.confidence + confidenceDelta),
              ),
              reviewsCount: item.reviewsCount + 1,
              lastReviewedAt: action.payload.reviewedAt,
            }
          : item,
      );

      const nextProgress = updateStreak({
        ...state.progress,
        flashcardReviews: reviews,
        topicMastery: nextTopicMastery,
        totalStudyMinutes: state.progress.totalStudyMinutes + 5,
      });

      return withDerivedState({
        ...state,
        progress: nextProgress,
      });
    }

    case "UPDATE_SETTINGS": {
      let nextTheme: ThemePreference | undefined;
      if (action.payload.theme) {
        nextTheme = action.payload.theme;
      }

      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
          theme: nextTheme ?? state.settings.theme,
        },
      };
    }

    case "RESET_ALL":
      return withDerivedState(action.payload);

    case "IMPORT_STATE":
      return withDerivedState(action.payload);

    default:
      return state;
  }
}

function getTodayPlan(state: AppState) {
  const scopedLessons = getScopedLessons(state);

  const incompleteLessons = scopedLessons.filter(
    (lesson) => !state.progress.completedLessonIds.includes(lesson.id),
  );
  const weakTopics = [...getScopedTopicMastery(state)]
    .sort((a, b) => a.confidence - b.confidence)
    .slice(0, 3)
    .map((topic) => topic.topicId);

  const recommendedLessons = incompleteLessons
    .filter((lesson) => weakTopics.includes(lesson.topicId))
    .slice(0, 2);

  const fallbackLessons = incompleteLessons
    .filter(
      (lesson) => !recommendedLessons.some((item) => item.id === lesson.id),
    )
    .slice(0, 2);

  return [...recommendedLessons, ...fallbackLessons].slice(0, 3);
}

function computeLearningPathState(state: AppState): LearningPathState {
  const scopedLessons = getScopedLessons(state);
  const scopedProjects = getScopedProjects(state);
  const scopedModules = state.modules.filter((module) =>
    subjectMatches(state.settings.selectedSubject, module.subject),
  );
  const scopedTopicMastery = getScopedTopicMastery(state);

  const mastery = calculateMasteryBreakdown(
    {
      ...state.progress,
      completedLessonIds: state.progress.completedLessonIds.filter((id) =>
        scopedLessons.some((lesson) => lesson.id === id),
      ),
      inProgressLessonIds: state.progress.inProgressLessonIds.filter((id) =>
        scopedLessons.some((lesson) => lesson.id === id),
      ),
      quizAttempts: state.progress.quizAttempts.filter((attempt) =>
        scopedLessons.some((lesson) => lesson.id === attempt.lessonId),
      ),
      exerciseAttempts: state.progress.exerciseAttempts.filter((attempt) =>
        scopedLessons.some((lesson) => lesson.id === attempt.lessonId),
      ),
      projectProgress: state.progress.projectProgress.filter((item) =>
        scopedProjects.some((project) => project.id === item.projectId),
      ),
      topicMastery: scopedTopicMastery,
    },
    scopedLessons,
    scopedProjects,
  );
  const completedCount = state.progress.completedLessonIds.filter((id) =>
    scopedLessons.some((lesson) => lesson.id === id),
  ).length;

  const moduleProgress = scopedModules.map((module) => {
    const moduleLessons = scopedLessons.filter(
      (lesson) => lesson.moduleId === module.id,
    );
    const completed = moduleLessons.filter((lesson) =>
      state.progress.completedLessonIds.includes(lesson.id),
    ).length;
    const total = moduleLessons.length;

    return {
      moduleId: module.id,
      completionPercent:
        total === 0 ? 0 : Math.round((completed / total) * 100),
      completedLessons: completed,
      totalLessons: total,
    };
  });

  const quizResults: QuizResult[] = state.progress.quizAttempts
    .filter((attempt) =>
      scopedLessons.some((lesson) => lesson.id === attempt.lessonId),
    )
    .map((attempt) => ({
      lessonId: attempt.lessonId,
      scorePercent: attempt.scorePercent,
      takenAt: attempt.completedAt,
    }));

  const needsImprovementTopicIds = scopedTopicMastery
    .filter((topic) => topic.confidence <= 2)
    .map((topic) => topic.topicId);

  const masteredTopicIds = scopedTopicMastery
    .filter((topic) => topic.confidence >= 4)
    .map((topic) => topic.topicId);

  const scopedLessonIdSet = new Set(scopedLessons.map((lesson) => lesson.id));

  const studyMinutesLast7Days = state.progress.studySessions
    .filter((session) => {
      const sessionDate = new Date(session.startedAt).getTime();
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const matchesSubject =
        state.settings.selectedSubject === "all"
          ? true
          : session.lessonIds.some((id) => scopedLessonIdSet.has(id));

      return sessionDate >= sevenDaysAgo && matchesSubject;
    })
    .reduce((sum, session) => sum + session.durationMinutes, 0);

  const scopedProjectProgress = state.progress.projectProgress.filter((item) =>
    scopedProjects.some((project) => project.id === item.projectId),
  );

  const scopedNotes = state.notes.filter((note) =>
    subjectMatches(state.settings.selectedSubject, note.subject ?? "react"),
  );

  return {
    profile: state.profile,
    settings: state.settings,
    modules: scopedModules,
    lessons: scopedLessons,
    projects: scopedProjects,
    progress: state.progress,
    notes: scopedNotes,
    dashboard: {
      overallProgressPercent: Math.round(
        (completedCount / Math.max(scopedLessons.length, 1)) * 100,
      ),
      currentStreakDays: state.progress.currentStreakDays,
      longestStreakDays: state.progress.longestStreakDays,
      totalStudyMinutes: state.progress.totalStudyMinutes,
      studyMinutesLast7Days,
      masteryPercent: toPercent(mastery.overall),
      moduleProgress,
      todayPlanLessonIds: getTodayPlan(state).map((lesson) => lesson.id),
      needsImprovementTopicIds,
      masteredTopicIds,
      quizResults,
      projectProgress: scopedProjectProgress,
      insights: buildInsights(
        {
          ...state.progress,
          completedLessonIds: state.progress.completedLessonIds.filter((id) =>
            scopedLessons.some((lesson) => lesson.id === id),
          ),
          inProgressLessonIds: state.progress.inProgressLessonIds.filter((id) =>
            scopedLessons.some((lesson) => lesson.id === id),
          ),
        },
        scopedLessons,
        scopedProjects,
      ),
    },
  };
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialSeedState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = parseStoredState(raw);
        if (parsed) {
          dispatch({ type: "HYDRATE", payload: parsed });
        }
      }
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, isHydrated]);

  const value = useMemo<AppStoreValue>(() => {
    const learningPath = computeLearningPathState(state);

    const exportState = () => JSON.stringify(state, null, 2);

    const importState = (content: string) => {
      const parsed = parseStoredState(content);
      if (!parsed) {
        return { ok: false, error: "Invalid import file format." };
      }
      dispatch({ type: "IMPORT_STATE", payload: parsed });
      return { ok: true };
    };

    const resetState = () => {
      dispatch({ type: "RESET_ALL", payload: createSeedState() });
    };

    return {
      state,
      dispatch,
      learningPath,
      exportState,
      importState,
      resetState,
    };
  }, [state]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-700">
        <p className="text-sm">Loading your React Mastery workspace...</p>
      </div>
    );
  }

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppStore must be used within AppStoreProvider");
  }
  return context;
}

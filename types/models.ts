export type Difficulty = "beginner" | "intermediate" | "advanced";
export type Subject = "react" | "python" | "full-stack";
export type SubjectFilter = "all" | Subject;
export type LearningTrack = "react-path" | "python-path" | "full-stack-path";
export type ProgrammingLanguage =
  | "javascript"
  | "typescript"
  | "jsx"
  | "tsx"
  | "python";
export type LessonStatus = "not-started" | "in-progress" | "completed";
export type ProjectStatus =
  | "not-started"
  | "planning"
  | "in-progress"
  | "blocked"
  | "submitted"
  | "completed";
export type ThemePreference = "light" | "dark" | "system";

export interface UserProfile {
  id: string;
  name: string;
  timezone: string;
  createdAt: string;
}

export interface Topic {
  id: string;
  moduleId: string;
  title: string;
  difficulty: Difficulty;
  prerequisites: string[];
}

export interface Module {
  id: string;
  subject: Subject;
  title: string;
  order: number;
  description: string;
  topics: Topic[];
}

export type LearningModule = Module;

export interface Lesson {
  id: string;
  subject: Subject;
  moduleId: string;
  topicId: string;
  title: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  learningObjectives: string[];
  explanation: string;
  mentalModel: string;
  syntaxExamples: string[];
  practicalExamples: string[];
  commonMistakes: string[];
  bestPractices: string[];
  memorizeSummary: string[];
  flashcardIds: string[];
  quizId: string;
  codingExerciseId: string;
  reflectionQuestion: string;
}

export interface QuizAttempt {
  id: string;
  quizId?: string;
  lessonId: string;
  scorePercent: number;
  totalQuestions?: number;
  correctAnswers?: number;
  completedAt: string;
  durationMinutes?: number;
}

export interface QuizResult {
  lessonId: string;
  scorePercent: number;
  takenAt: string;
}

export interface ExerciseAttempt {
  id: string;
  lessonId: string;
  exerciseId?: string;
  passed: boolean;
  completedAt?: string;
  lastAttemptAt?: string;
  attempts?: number;
  durationMinutes?: number;
}

export interface FlashcardReview {
  id: string;
  flashcardId: string;
  lessonId: string;
  topicId: string;
  result: "know_it" | "unsure" | "review_again";
  reviewedAt: string;
  nextReviewAt: string;
}

export interface Project {
  id: string;
  subject: Subject;
  title: string;
  difficulty: Difficulty;
  estimatedHours: number;
  skills: string[];
  brief: string;
  userStories: string[];
  requiredFeatures: string[];
  stretchGoals: string[];
  componentTree: string[];
  dataModel: string[];
  acceptanceCriteria: string[];
  testingChecklist: string[];
  accessibilityChecklist: string[];
  reflectionQuestions: string[];
  submissionChecklist: string[];
}

export interface ProjectProgress {
  projectId: string;
  status: ProjectStatus;
  startedAt?: string;
  completedAt?: string;
  notes: string;
}

export interface Note {
  id: string;
  subject?: Subject;
  title: string;
  content: string;
  tags: string[];
  lessonId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: "streak" | "project" | "quiz" | "module" | "consistency";
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string;
}

export interface StudySession {
  id: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  lessonIds: string[];
  noteIds: string[];
  focusScore: number;
}

export interface TopicMastery {
  subject: Subject;
  moduleId: string;
  topicId: string;
  confidence: number;
  reviewsCount: number;
  lastReviewedAt?: string;
  lessonIds: string[];
}

export interface UserProgress {
  completedLessonIds: string[];
  inProgressLessonIds: string[];
  lessonStatuses: Record<string, LessonStatus>;
  topicMastery: TopicMastery[];
  quizAttempts: QuizAttempt[];
  exerciseAttempts: ExerciseAttempt[];
  flashcardReviews: FlashcardReview[];
  projectProgress: ProjectProgress[];
  studySessions: StudySession[];
  achievements: UnlockedAchievement[];
  currentStreakDays: number;
  longestStreakDays: number;
  totalStudyMinutes: number;
  lastStudyDate: string;
}

export interface DashboardInsight {
  id: string;
  title: string;
  summary: string;
  type: "success" | "warning" | "info";
}

export interface LearningPathSettings {
  dailyGoalMinutes: number;
  preferredSessionLength: number;
  theme: ThemePreference;
  remindersEnabled: boolean;
  autoAdvanceLessons: boolean;
  selectedSubject: SubjectFilter;
  defaultSubject: SubjectFilter;
  enabledTracks: LearningTrack[];
}

export interface LearningPathDashboard {
  overallProgressPercent: number;
  currentStreakDays: number;
  longestStreakDays: number;
  totalStudyMinutes: number;
  studyMinutesLast7Days: number;
  masteryPercent: number;
  moduleProgress: Array<{
    moduleId: string;
    completionPercent: number;
    completedLessons: number;
    totalLessons: number;
  }>;
  todayPlanLessonIds: string[];
  needsImprovementTopicIds: string[];
  masteredTopicIds: string[];
  quizResults: QuizResult[];
  projectProgress: ProjectProgress[];
  insights: DashboardInsight[];
}

export interface LearningPathState {
  profile: UserProfile;
  settings: LearningPathSettings;
  modules: LearningModule[];
  lessons: Lesson[];
  projects: Project[];
  progress: UserProgress;
  notes: Note[];
  dashboard: LearningPathDashboard;
}

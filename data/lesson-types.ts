export type Track = "React" | "Python" | "SQL";

export type LessonStatus = "mastered" | "needs-work" | "in-progress";

export type Checkpoint = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type LessonProject = {
  title: string;
  brief: string;
  requirements: string[];
  stretch: string;
};

export type Lesson = {
  id: string;
  track: Track;
  module: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  prerequisites: string[];
  objectives: string[];
  mentalModel: string;
  explanation: string[];
  example: string;
  expectedOutput?: string;
  memorize: string[];
  mistakes: string[];
  checkpoints: Checkpoint[];
  project: LessonProject;
};

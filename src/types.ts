export interface Subject {
  id: string;
  name: string;
  icon: string;
  questionsCount: number;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'essay';
export type Difficulty = 'nhan_biet' | 'thong_hieu' | 'van_dung' | 'van_dung_cao';

export interface Question {
  id: string;
  subjectId: string;
  content: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: Difficulty;
  tags: string[];
}

export interface Session {
  id: string;
  subjectId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
  date: string;
}

export interface Progress {
  totalAttempts: number;
  averageScore: number;
  streakDays: number;
  weakTopics: string[];
}

export interface Settings {
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  autoSave: boolean;
}

export interface AppData {
  subjects: Subject[];
  questions: Question[];
  sessions: Session[];
  progress: Progress;
  settings: Settings;
}

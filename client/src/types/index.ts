export type UserRole = "student" | "lecturer" | "admin";
export type PreferredLanguage = "english" | "tamil" | "both";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  university?: string;
  course?: string;
  preferredLanguage?: PreferredLanguage;
  examTitle?: string;
  examDate?: string;
}

export interface McqQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LectureDocument {
  _id: string;
  title: string;
  originalFilename: string;
  status: string;
  module?: string;
  approvedByLecturer?: boolean;
  extractedText?: string;
  createdAt: string;
}

export interface Flashcard {
  _id?: string;
  question: string;
  answer: string;
  completed?: boolean;
}

export interface StudyMaterial {
  _id: string;
  documentId: string | LectureDocument;
  type: string;
  title: string;
  content: string;
  flashcards?: Flashcard[];
  audioUrl?: string;
  savedToLibrary?: boolean;
  metadata?: {
    voiceMode?: string;
    elevenlabsConfigured?: boolean;
    voiceError?: string;
    questions?: McqQuestion[];
  };
  createdAt: string;
}

export interface VivaQuestion {
  _id?: string;
  question: string;
  studentAnswer?: string;
  feedback?: string;
  score?: number;
}

export interface VivaSession {
  _id: string;
  title: string;
  questions: VivaQuestion[];
  currentIndex: number;
  status: "active" | "completed";
  overallFeedback?: string;
}

export interface DashboardData {
  documents: LectureDocument[];
  recentMaterials: StudyMaterial[];
  vivaSessions: VivaSession[];
  voiceHistory: StudyMaterial[];
  exam?: { title?: string; date?: string };
  progress: {
    flashcardsTotal: number;
    flashcardsCompleted: number;
    studyMinutesThisWeek?: number;
    materialsGenerated?: number;
  };
}

export type UserRole = "student" | "lecturer" | "admin";
export type SriLankanMixMode =
  | "tamil_english"
  | "sinhala_english"
  | "student_lk";

/** How AI explains — includes classic + Sri Lankan mixed modes */
export type ExplanationStyle =
  | "english"
  | "tamil"
  | "both"
  | SriLankanMixMode;

export type PreferredLanguage = ExplanationStyle;

export type VoiceRefineMode =
  | "simpler"
  | "real_life"
  | "tamil"
  | "tamil_english"
  | "sinhala_english"
  | "student_lk"
  | "slow"
  | "repeat";

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
    doubt?: string;
    questionTranscript?: string;
    transcript?: string;
    inputMode?: "text" | "voice";
    language?: ExplanationStyle;
    mixMode?: SriLankanMixMode;
    lastRefineMode?: VoiceRefineMode;
    speechRate?: number;
    audioPending?: boolean;
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

export interface WalkSegment {
  index: number;
  title: string;
  script: string;
  audioUrl?: string;
}

export interface WalkSession {
  _id: string;
  documentId: string;
  title: string;
  segments: WalkSegment[];
  currentIndex: number;
  status: "active" | "completed";
  explanationStyle?: string;
}

export type WalkInterruptAction =
  | "repeat"
  | "explain_again"
  | "simpler"
  | "skip"
  | "continue";

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

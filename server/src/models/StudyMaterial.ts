import mongoose, { Document, Schema, Types } from "mongoose";

export type StudyMaterialType =
  | "cheat_sheet"
  | "flashcards"
  | "tamil_explanation"
  | "lecturer_tamil"
  | "viva_questions"
  | "voice_explanation"
  | "study_plan"
  | "mcq_quiz";

export interface IFlashcard {
  _id?: Types.ObjectId;
  question: string;
  answer: string;
  completed?: boolean;
}

export interface IStudyMaterial extends Document {
  documentId: Types.ObjectId;
  userId: Types.ObjectId;
  type: StudyMaterialType;
  title: string;
  content: string;
  flashcards?: IFlashcard[];
  audioPath?: string;
  audioUrl?: string;
  savedToLibrary: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const flashcardSchema = new Schema<IFlashcard>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { _id: true }
);

const studyMaterialSchema = new Schema<IStudyMaterial>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "LectureDocument",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "cheat_sheet",
        "flashcards",
        "tamil_explanation",
        "lecturer_tamil",
        "viva_questions",
        "voice_explanation",
        "study_plan",
        "mcq_quiz",
      ],
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    flashcards: [flashcardSchema],
    audioPath: { type: String },
    audioUrl: { type: String },
    savedToLibrary: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const StudyMaterial = mongoose.model<IStudyMaterial>(
  "StudyMaterial",
  studyMaterialSchema
);

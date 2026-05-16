import mongoose, { Document, Schema, Types } from "mongoose";

export interface IVivaQuestion {
  question: string;
  studentAnswer?: string;
  feedback?: string;
  score?: number;
}

export interface IVivaSession extends Document {
  documentId?: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  topic?: string;
  questions: IVivaQuestion[];
  currentIndex: number;
  status: "active" | "completed";
  overallFeedback?: string;
  createdByLecturer?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const vivaQuestionSchema = new Schema<IVivaQuestion>(
  {
    question: { type: String, required: true },
    studentAnswer: { type: String },
    feedback: { type: String },
    score: { type: Number, min: 0, max: 10 },
  },
  { _id: true }
);

const vivaSessionSchema = new Schema<IVivaSession>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: "LectureDocument" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    topic: { type: String },
    questions: [vivaQuestionSchema],
    currentIndex: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    overallFeedback: { type: String },
    createdByLecturer: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const VivaSession = mongoose.model<IVivaSession>(
  "VivaSession",
  vivaSessionSchema
);

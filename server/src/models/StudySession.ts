import mongoose, { Document, Schema, Types } from "mongoose";

export interface IStudySession extends Document {
  userId: Types.ObjectId;
  minutes: number;
  label: string;
  documentId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const studySessionSchema = new Schema<IStudySession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    minutes: { type: Number, required: true, min: 1 },
    label: { type: String, default: "Focus session" },
    documentId: { type: Schema.Types.ObjectId, ref: "LectureDocument" },
  },
  { timestamps: true }
);

export const StudySession = mongoose.model<IStudySession>(
  "StudySession",
  studySessionSchema
);

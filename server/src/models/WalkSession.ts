import mongoose, { Document, Schema, Types } from "mongoose";

export interface IWalkSegment {
  index: number;
  title: string;
  script: string;
  audioPath?: string;
  audioUrl?: string;
}

export interface IWalkSession extends Document {
  documentId: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  segments: IWalkSegment[];
  currentIndex: number;
  status: "active" | "completed";
  explanationStyle: string;
  createdAt: Date;
  updatedAt: Date;
}

const walkSegmentSchema = new Schema<IWalkSegment>(
  {
    index: { type: Number, required: true },
    title: { type: String, required: true },
    script: { type: String, required: true },
    audioPath: { type: String },
    audioUrl: { type: String },
  },
  { _id: false }
);

const walkSessionSchema = new Schema<IWalkSession>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "LectureDocument",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    segments: [walkSegmentSchema],
    currentIndex: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    explanationStyle: { type: String, default: "tamil_english" },
  },
  { timestamps: true }
);

export const WalkSession = mongoose.model<IWalkSession>(
  "WalkSession",
  walkSessionSchema
);

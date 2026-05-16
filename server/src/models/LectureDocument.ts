import mongoose, { Document, Schema, Types } from "mongoose";

export type DocumentStatus = "processing" | "ready" | "failed" | "removed";

export interface ILectureDocument extends Document {
  title: string;
  originalFilename: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: Types.ObjectId;
  uploaderRole: "student" | "lecturer";
  extractedText?: string;
  status: DocumentStatus;
  module?: string;
  approvedByLecturer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const lectureDocumentSchema = new Schema<ILectureDocument>(
  {
    title: { type: String, required: true, trim: true },
    originalFilename: { type: String, required: true },
    filePath: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    uploaderRole: {
      type: String,
      enum: ["student", "lecturer"],
      default: "student",
    },
    extractedText: { type: String },
    status: {
      type: String,
      enum: ["processing", "ready", "failed", "removed"],
      default: "processing",
    },
    module: { type: String, trim: true },
    approvedByLecturer: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const LectureDocument = mongoose.model<ILectureDocument>(
  "LectureDocument",
  lectureDocumentSchema
);

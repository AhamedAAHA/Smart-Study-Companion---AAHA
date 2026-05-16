import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "student" | "lecturer" | "admin";
export type PreferredLanguage =
  | "english"
  | "tamil"
  | "both"
  | "tamil_english"
  | "sinhala_english"
  | "student_lk";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  university?: string;
  course?: string;
  preferredLanguage: PreferredLanguage;
  examTitle?: string;
  examDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["student", "lecturer", "admin"],
      default: "student",
    },
    university: { type: String, trim: true },
    course: { type: String, trim: true },
    preferredLanguage: {
      type: String,
      enum: [
        "english",
        "tamil",
        "both",
        "tamil_english",
        "sinhala_english",
        "student_lk",
      ],
      default: "english",
    },
    examTitle: { type: String, trim: true },
    examDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);

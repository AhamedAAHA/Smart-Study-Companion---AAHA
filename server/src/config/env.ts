import dotenv from "dotenv";
import path from "path";

dotenv.config();

function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/$/, "");
}

const clientOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

export const env = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/smart-study-companion",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: clientOrigins[0] || "http://localhost:3000",
  clientOrigins,
  openaiApiKey: (process.env.OPENAI_API_KEY || "").trim(),
  elevenlabsApiKey: (process.env.ELEVENLABS_API_KEY || "").trim(),
  elevenlabsVoiceId:
    process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM",
  uploadDir: path.resolve(process.env.UPLOAD_DIR || "./uploads"),
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || "25", 10),
  isProduction: process.env.NODE_ENV === "production",
};

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/auth.routes";
import documentsRoutes from "./routes/documents.routes";
import studyRoutes from "./routes/study.routes";
import lecturerRoutes from "./routes/lecturer.routes";
import adminRoutes from "./routes/admin.routes";
import { isElevenLabsConfigured } from "./services/elevenlabs.service";

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/$/, "");
      if (env.clientOrigins.includes(normalized)) return callback(null, true);
      if (
        !env.isProduction &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, false);
    },
    credentials: true,
    exposedHeaders: ["Content-Disposition", "Content-Type", "Content-Length"],
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

const audioDir = path.join(env.uploadDir, "audio");
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

app.use("/api/audio", express.static(audioDir));
app.use("/uploads", express.static(env.uploadDir));

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    service: "Smart Study Companion API",
    version: "1.0.0",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/study", studyRoutes);
app.use("/api/lecturer", lecturerRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

async function start() {
  await connectDatabase();
  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
    console.log(
      `ElevenLabs: ${isElevenLabsConfigured() ? "configured" : "not configured (browser voice fallback)"}`
    );
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

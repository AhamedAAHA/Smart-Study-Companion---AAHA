import fs from "fs";
import OpenAI from "openai";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";

const openai = env.openaiApiKey
  ? new OpenAI({ apiKey: env.openaiApiKey })
  : null;

export function isTranscriptionConfigured(): boolean {
  return Boolean(env.openaiApiKey);
}

/** Transcribe spoken audio (student question) using OpenAI Whisper. */
export async function transcribeAudioFile(
  filePath: string,
  language?: string
): Promise<string> {
  if (!openai) {
    throw new AppError(
      "OpenAI API key is not configured. Add OPENAI_API_KEY for voice transcription.",
      503
    );
  }

  if (!fs.existsSync(filePath)) {
    throw new AppError("Audio file not found.", 400);
  }

  const stream = fs.createReadStream(filePath);
  const response = await openai.audio.transcriptions.create({
    file: stream,
    model: "whisper-1",
    ...(language ? { language } : {}),
  });

  const text = response.text?.trim();
  if (!text) {
    throw new AppError("Could not transcribe audio. Please try again or type your doubt.", 400);
  }

  return text;
}

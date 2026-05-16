import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";

const audioDir = path.join(env.uploadDir, "audio");

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

export type TextToSpeechResult = {
  audioPath: string;
  audioUrl: string;
};

const MAX_TTS_CHARS = 1800;
const REQUEST_TIMEOUT_MS = 90_000;
const MAX_RETRIES = 3;

function prepareSpeechText(raw: string): string {
  return raw
    .replace(/[#*_`[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TTS_CHARS);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callElevenLabs(text: string, voiceId: string): Promise<Buffer> {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": env.elevenlabsApiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.75,
          style: 0.2,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      if (response.status === 401) {
        throw new AppError(
          "Invalid ElevenLabs API key. Check ELEVENLABS_API_KEY in server/.env",
          401
        );
      }
      throw new AppError(`ElevenLabs error (${response.status}): ${errText}`, 502);
    }

    return Buffer.from(await response.arrayBuffer());
  } finally {
    clearTimeout(timeout);
  }
}

/** Returns null when ELEVENLABS_API_KEY is missing. */
export async function textToSpeech(
  text: string
): Promise<TextToSpeechResult | null> {
  if (!env.elevenlabsApiKey) {
    return null;
  }

  const speechText = prepareSpeechText(text);
  if (!speechText) {
    throw new AppError("No text available for voice generation", 400);
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const buffer = await callElevenLabs(speechText, env.elevenlabsVoiceId);
      const filename = `${uuidv4()}.mp3`;
      const audioPath = path.join(audioDir, filename);
      fs.writeFileSync(audioPath, buffer);

      return {
        audioPath,
        audioUrl: `/api/audio/${filename}`,
      };
    } catch (err) {
      lastError = err;
      const retryable =
        err instanceof Error &&
        (err.name === "AbortError" ||
          err.message.includes("terminated") ||
          err.message.includes("ECONNRESET") ||
          err.message.includes("fetch failed"));

      if (retryable && attempt < MAX_RETRIES) {
        console.warn(`ElevenLabs attempt ${attempt} failed, retrying...`);
        await sleep(attempt * 1500);
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

export function isElevenLabsConfigured(): boolean {
  return Boolean(env.elevenlabsApiKey);
}

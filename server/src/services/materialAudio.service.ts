import { StudyMaterial } from "../models/StudyMaterial";
import {
  isElevenLabsConfigured,
  speechTranscriptFromMarkdown,
  textToSpeech,
} from "./elevenlabs.service";

const audioJobsInFlight = new Set<string>();

export function buildVoiceMetadata(
  content: string,
  extra: Record<string, unknown> = {}
): Record<string, unknown> {
  const elevenlabsConfigured = isElevenLabsConfigured();
  return {
    ...extra,
    transcript: speechTranscriptFromMarkdown(content),
    voiceMode: "browser",
    elevenlabsConfigured,
    audioPending: elevenlabsConfigured,
    voiceError: elevenlabsConfigured
      ? undefined
      : "Add ELEVENLABS_API_KEY to server/.env for ElevenLabs audio",
  };
}

export async function generateMaterialAudioInBackground(
  materialId: string,
  opts?: { speechRate?: number }
): Promise<void> {
  const id = materialId.toString();
  if (audioJobsInFlight.has(id)) return;
  audioJobsInFlight.add(id);

  try {
    const material = await StudyMaterial.findById(id);
    if (!material?.content) return;
    if (material.audioUrl) {
      await StudyMaterial.findByIdAndUpdate(id, {
        $set: { "metadata.audioPending": false },
      });
      return;
    }

    if (!isElevenLabsConfigured()) {
      await StudyMaterial.findByIdAndUpdate(id, {
        $set: {
          "metadata.audioPending": false,
          "metadata.voiceMode": "browser",
          "metadata.elevenlabsConfigured": false,
          "metadata.voiceError":
            "Add ELEVENLABS_API_KEY to server/.env for ElevenLabs audio",
        },
      });
      return;
    }

    let audioPath: string | undefined;
    let audioUrl: string | undefined;
    let voiceMode: "elevenlabs" | "browser" = "browser";
    let voiceError: string | undefined;

    try {
      const audio = await textToSpeech(material.content);
      if (audio) {
        audioPath = audio.audioPath;
        audioUrl = audio.audioUrl;
        voiceMode = "elevenlabs";
      }
    } catch (err) {
      voiceError =
        err instanceof Error ? err.message : "ElevenLabs request failed";
      console.warn("Background voice generation failed:", err);
    }

    const meta = (material.metadata as Record<string, unknown>) || {};
    const speechRate = opts?.speechRate ?? meta.speechRate;

    await StudyMaterial.findByIdAndUpdate(id, {
      audioPath,
      audioUrl,
      metadata: {
        ...meta,
        transcript: speechTranscriptFromMarkdown(material.content),
        voiceMode,
        elevenlabsConfigured: true,
        voiceError,
        audioPending: false,
        ...(typeof speechRate === "number" ? { speechRate } : {}),
      },
    });
  } catch (err) {
    console.warn("Background audio job failed:", err);
    await StudyMaterial.findByIdAndUpdate(id, {
      $set: {
        "metadata.audioPending": false,
        "metadata.voiceError":
          "Audio generation failed. Use browser play below.",
      },
    });
  } finally {
    audioJobsInFlight.delete(id);
  }
}

export function queueMaterialAudio(
  materialId: string,
  opts?: { speechRate?: number }
): void {
  setImmediate(() => {
    void generateMaterialAudioInBackground(materialId, opts);
  });
}

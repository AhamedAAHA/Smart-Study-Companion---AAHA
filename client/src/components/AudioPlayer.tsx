"use client";

import { useCallback, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import { audioUrl } from "@/lib/api";

export function AudioPlayer({
  url,
  title,
  text,
  elevenlabsConfigured,
  voiceError,
  speechRate = 1,
  audioPending,
}: {
  url?: string;
  title?: string;
  text?: string;
  elevenlabsConfigured?: boolean;
  voiceError?: string;
  speechRate?: number;
  audioPending?: boolean;
}) {
  const [speaking, setSpeaking] = useState(false);
  const hasElevenLabs = Boolean(url);
  const plainText = text?.replace(/[#*_`[\]]/g, " ").slice(0, 3000);

  const stopBrowserSpeech = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const playBrowserSpeech = useCallback(() => {
    if (!plainText || typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }
    stopBrowserSpeech();
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = "ta-IN";
    utterance.rate = Math.min(1.2, Math.max(0.7, speechRate * 0.95));
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [plainText, speechRate, stopBrowserSpeech]);

  if (!hasElevenLabs && !plainText && !audioPending) return null;

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800/50 dark:bg-emerald-950/30">
      <div className="mb-3 flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
        <Volume2 className="h-5 w-5" />
        <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
          {title || "Voice explanation"}
        </span>
      </div>

      {audioPending && !hasElevenLabs && (
        <p className="mb-2 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          Generating premium audio… You can read the explanation below or use browser play.
        </p>
      )}

      {hasElevenLabs ? (
        <>
          <p className="mb-2 text-xs text-emerald-700 dark:text-emerald-400">Powered by ElevenLabs</p>
          <audio controls className="w-full" src={audioUrl(url!)}>
            Your browser does not support audio playback.
          </audio>
        </>
      ) : (
        <div className="space-y-2">
          {!audioPending && (
            <p className="text-xs text-amber-800 dark:text-amber-200">
              {!elevenlabsConfigured ? (
                <>
                  ElevenLabs API key missing in <code className="rounded bg-white/80 px-1">server/.env</code>.
                  Restart the server after adding <code className="rounded bg-white/80 px-1">ELEVENLABS_API_KEY</code>.
                </>
              ) : (
                <>
                  ElevenLabs audio could not be generated
                  {voiceError ? `: ${voiceError}` : ""}. Click{" "}
                  <strong>Voice Explanation</strong> again to retry, or use browser play below.
                </>
              )}
            </p>
          )}
          <button
            type="button"
            onClick={speaking ? stopBrowserSpeech : playBrowserSpeech}
            className="btn-primary !py-2"
          >
            {speaking ? (
              <>
                <Pause className="h-4 w-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Play explanation (browser)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

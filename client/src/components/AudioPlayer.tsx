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
}: {
  url?: string;
  title?: string;
  text?: string;
  elevenlabsConfigured?: boolean;
  voiceError?: string;
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
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [plainText, stopBrowserSpeech]);

  if (!hasElevenLabs && !plainText) return null;

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
      <div className="mb-3 flex items-center gap-2 text-emerald-800">
        <Volume2 className="h-5 w-5" />
        <span className="text-sm font-semibold">
          {title || "Voice explanation"}
        </span>
      </div>

      {hasElevenLabs ? (
        <>
          <p className="mb-2 text-xs text-emerald-700">Powered by ElevenLabs</p>
          <audio controls className="w-full" src={audioUrl(url!)}>
            Your browser does not support audio playback.
          </audio>
        </>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-amber-800">
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

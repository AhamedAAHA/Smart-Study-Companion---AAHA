"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

type SpeechRecognitionCtor = new () => SpeechRecognition;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

interface Props {
  disabled?: boolean;
  speechLang?: string;
  onTranscript: (text: string, audioBlob?: Blob) => void;
  onRecordingChange?: (recording: boolean) => void;
}

export function VoiceDoubtInput({
  disabled,
  speechLang = "en-US",
  onTranscript,
  onRecordingChange,
}: Props) {
  const [recording, setRecording] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [error, setError] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const liveTextRef = useRef("");

  useEffect(() => {
    setSpeechSupported(Boolean(getSpeechRecognition()));
  }, []);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const stopRecognition = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* already stopped */
    }
    recognitionRef.current = null;
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    } else {
      stopRecognition();
      stopTracks();
      setRecording(false);
      onRecordingChange?.(false);
    }
  }, [onRecordingChange, stopRecognition, stopTracks]);

  const startRecording = useCallback(async () => {
    setError("");
    setLiveText("");
    liveTextRef.current = "";
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const SpeechRecognitionClass = getSpeechRecognition();
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = speechLang;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let combined = "";
          for (let i = 0; i < event.results.length; i++) {
            combined += event.results[i][0].transcript;
          }
          const trimmed = combined.trim();
          liveTextRef.current = trimmed;
          setLiveText(trimmed);
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stopRecognition();
        stopTracks();
        setRecording(false);
        onRecordingChange?.(false);

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        onTranscript(liveTextRef.current, blob.size > 0 ? blob : undefined);
      };

      recorder.start(500);
      mediaRecorderRef.current = recorder;
      setRecording(true);
      onRecordingChange?.(true);
    } catch {
      setError("Microphone access denied or unavailable.");
      stopTracks();
    }
  }, [onRecordingChange, onTranscript, stopRecognition, stopTracks]);

  useEffect(() => {
    return () => {
      stopRecognition();
      stopTracks();
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
    };
  }, [stopRecognition, stopTracks]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {!recording ? (
          <button
            type="button"
            disabled={disabled}
            onClick={startRecording}
            className="btn-secondary flex items-center gap-2 !py-2 text-sm"
          >
            <Mic className="h-4 w-4" />
            Ask by voice
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/50"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            Stop recording
          </button>
        )}
        {recording && (
          <span className="flex items-center gap-2 text-sm text-red-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            Listening…
          </span>
        )}
      </div>

      {recording && liveText && (
        <p className="rounded-lg border border-slate-200 bg-white/80 p-3 text-sm text-fg-secondary dark:border-slate-600 dark:bg-slate-900/50">
          <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
            Live transcript
          </span>
          <span className="mt-1 block">{liveText}</span>
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!speechSupported && !error && (
        <p className="text-xs text-fg-muted">
          Live captions may be unavailable; your recording is still transcribed on the server.
        </p>
      )}
    </div>
  );
}
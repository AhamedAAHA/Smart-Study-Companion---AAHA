"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Footprints,
  Loader2,
  Mic,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Sparkles,
  Square,
} from "lucide-react";
import { api, ApiError, audioUrl } from "@/lib/api";
import { WalkInterruptAction, WalkSession } from "@/types";

type Props = {
  documentId: string;
  documentTitle: string;
};

export function WalkingTutor({ documentId, documentTitle }: Props) {
  const [session, setSession] = useState<WalkSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");
  const [recording, setRecording] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const current = session?.segments[session.currentIndex];
  const progress = session
    ? `${session.currentIndex + 1} / ${session.segments.length}`
    : "";

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
  }, []);

  const speakBrowser = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      stopAudio();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.lang = "en-IN";
      utterance.onend = () => setPlaying(false);
      utterance.onerror = () => setPlaying(false);
      setPlaying(true);
      window.speechSynthesis.speak(utterance);
    },
    [stopAudio]
  );

  const playCurrent = useCallback(async () => {
    if (!session || !current) return;
    setError("");

    let seg = current;
    if (!seg.audioUrl) {
      setBusy(true);
      try {
        const res = await api<{ success: boolean; data: WalkSession }>(
          `/study/walk/${session._id}/prepare/${session.currentIndex}`,
          { method: "POST" }
        );
        setSession(res.data);
        seg = res.data.segments[res.data.currentIndex];
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not load audio");
        setBusy(false);
        return;
      }
      setBusy(false);
    }

    stopAudio();
    if (seg.audioUrl) {
      const el = audioRef.current;
      if (!el) return;
      el.src = audioUrl(seg.audioUrl);
      el.playbackRate = 1;
      await el.play().catch(() => {
        speakBrowser(seg.script);
      });
      setPlaying(true);
    } else {
      speakBrowser(seg.script);
    }
  }, [session, current, stopAudio, speakBrowser]);

  const startSession = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<{ success: boolean; data: WalkSession; message: string }>(
        `/study/walk/start/${documentId}`,
        { method: "POST", body: JSON.stringify({}) }
      );
      setSession(res.data);
      setStatusMsg(res.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start walk mode");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  const autoPlayed = useRef(false);

  useEffect(() => {
    void startSession();
    return () => stopAudio();
  }, [startSession, stopAudio]);

  useEffect(() => {
    if (session?.status === "active" && !autoPlayed.current) {
      autoPlayed.current = true;
      const t = window.setTimeout(() => void playCurrent(), 600);
      return () => window.clearTimeout(t);
    }
  }, [session, playCurrent]);

  const onAudioEnded = useCallback(async () => {
    if (!session || session.status === "completed") return;
    setPlaying(false);
    setBusy(true);
    try {
      const res = await api<{
        success: boolean;
        data: WalkSession;
        completed?: boolean;
        message?: string;
      }>(`/study/walk/${session._id}/advance`, { method: "POST" });
      setSession(res.data);
      if (res.completed) {
        setStatusMsg(res.message || "Lesson complete!");
        stopAudio();
      } else {
        setStatusMsg("Next topic…");
        setTimeout(() => void playCurrent(), 400);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not continue");
    } finally {
      setBusy(false);
    }
  }, [session, playCurrent, stopAudio]);

  const interrupt = async (action: WalkInterruptAction, audioBlob?: Blob) => {
    if (!session) return;
    stopAudio();
    setBusy(true);
    setError("");
    try {
      let res: {
        success: boolean;
        data: WalkSession;
        label?: string;
        completed?: boolean;
        heard?: string;
      };

      if (audioBlob) {
        const form = new FormData();
        form.append("audio", audioBlob, "interrupt.webm");
        form.append("action", action);
        res = await api(`/study/walk/${session._id}/interrupt`, {
          method: "POST",
          body: form,
        });
      } else {
        res = await api(`/study/walk/${session._id}/interrupt`, {
          method: "POST",
          body: JSON.stringify({ action }),
        });
      }

      setSession(res.data);
      setStatusMsg(
        res.heard
          ? `${res.label || "Updated"} — heard: "${res.heard}"`
          : res.label || "Updated"
      );

      if (res.completed) {
        stopAudio();
      } else if (action !== "continue") {
        setTimeout(() => void playCurrent(), 500);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Interrupt failed");
    } finally {
      setBusy(false);
    }
  };

  const startInterruptRecording = async () => {
    setError("");
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        void interrupt("explain_again", blob.size > 0 ? blob : undefined);
        setRecording(false);
      };
      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setRecording(true);
      stopAudio();
    } catch {
      setError("Microphone access needed to interrupt by voice.");
    }
  };

  const stopInterruptRecording = () => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    else setRecording(false);
  };

  if (loading) {
    return (
      <div className="walk-mode flex min-h-[80vh] flex-col items-center justify-center gap-4 px-6">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        <p className="text-center text-fg-muted">Building your walking podcast…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="walk-mode px-6 py-12 text-center">
        <p className="text-danger">{error || "Could not start session"}</p>
        <button type="button" onClick={() => void startSession()} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  const completed = session.status === "completed";

  return (
    <div className="walk-mode mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg flex-col px-4 pb-8 pt-2">
      <audio ref={audioRef} className="hidden" onEnded={() => void onAudioEnded()} />

      <div className="mb-4 flex items-center justify-between gap-2">
        <Link
          href={`/documents/${documentId}`}
          className="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800 dark:bg-brand-900/50 dark:text-brand-200">
          Walk & Learn
        </span>
      </div>

      <div className="mb-6 text-center">
        <Footprints className="mx-auto mb-2 h-8 w-8 text-brand-600 dark:text-brand-400" />
        <h1 className="font-display text-lg font-bold text-fg">{documentTitle}</h1>
        <p className="mt-1 text-xs text-fg-muted">Podcast-style · earphones recommended</p>
      </div>

      <div className="walk-now-playing card flex flex-1 flex-col items-center justify-center py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
          {completed ? "Finished" : "Now playing"}
        </p>
        <p className="mt-2 text-xs text-fg-muted">{progress}</p>
        <h2 className="mt-3 max-w-xs text-center text-xl font-semibold text-fg">
          {current?.title || "Done"}
        </h2>

        <div className="mt-8 flex h-16 items-end justify-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`walk-bar w-1.5 rounded-full bg-brand-500 ${playing ? "walk-bar-active" : "opacity-30"}`}
              style={{ animationDelay: `${i * 0.12}s`, height: `${12 + (i % 3) * 8}px` }}
            />
          ))}
        </div>

        <div className="mt-10 flex items-center gap-4">
          <button
            type="button"
            disabled={busy || completed}
            onClick={() => void interrupt("explain_again")}
            className="btn-secondary !rounded-full !p-3"
            aria-label="Explain again"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          <button
            type="button"
            disabled={busy || completed}
            onClick={() => (playing ? stopAudio() : void playCurrent())}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-500/40 transition hover:scale-105 disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : playing ? (
              <Pause className="h-7 w-7" />
            ) : (
              <Play className="h-7 w-7 translate-x-0.5" />
            )}
          </button>

          <button
            type="button"
            disabled={busy || completed}
            onClick={() => void interrupt("skip")}
            className="btn-secondary !rounded-full !p-3"
            aria-label="Skip topic"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {statusMsg && (
          <p className="mt-6 max-w-xs text-center text-xs text-fg-muted">{statusMsg}</p>
        )}
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-center text-xs font-medium text-fg-muted">Interrupt anytime</p>
        <div className="flex flex-wrap justify-center gap-2">
          {(
            [
              ["explain_again", "Explain again"],
              ["simpler", "Simpler"],
              ["skip", "Skip topic"],
            ] as const
          ).map(([action, label]) => (
            <button
              key={action}
              type="button"
              disabled={busy || completed}
              onClick={() => void interrupt(action)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-fg-secondary transition hover:border-brand-300 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-brand-500/50"
            >
              {label}
            </button>
          ))}
        </div>

        {!recording ? (
          <button
            type="button"
            disabled={busy || completed}
            onClick={startInterruptRecording}
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            <Mic className="h-4 w-4" />
            Hold & say: &quot;Wait, explain again&quot;
          </button>
        ) : (
          <button
            type="button"
            onClick={stopInterruptRecording}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 py-3 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-300"
          >
            <Square className="h-4 w-4 fill-current" />
            Stop & send
          </button>
        )}

        <p className="text-center text-[11px] text-fg-subtle">
          Like Spotify + AI tutor · voice uses Whisper + ElevenLabs or browser speech
        </p>
      </div>

      {error && <p className="mt-3 text-center text-sm text-danger">{error}</p>}

      {completed && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-center dark:border-emerald-500/30 dark:bg-emerald-950/30">
          <Sparkles className="mx-auto mb-2 h-6 w-6 text-emerald-600" />
          <p className="text-sm font-medium text-fg">Walking lesson complete!</p>
        </div>
      )}
    </div>
  );
}

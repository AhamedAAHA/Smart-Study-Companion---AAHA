"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Layers,
  Languages,
  GraduationCap,
  Volume2,
  Sparkles,
  CalendarDays,
  HelpCircle,
  MessageCircleQuestion,
  Footprints,
  BookOpen,
  Mic,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "./AuthProvider";
import { EXPLANATION_STYLE_OPTIONS, SRI_LANKAN_MIX_MODES } from "@/lib/localeLabels";
import {
  ExplanationStyle,
  SriLankanMixMode,
  StudyMaterial,
  VivaSession,
} from "@/types";
import { VoiceDoubtInput } from "./VoiceDoubtInput";
import { Alert } from "./ui/Alert";
import { StudyToolCard } from "./study/StudyToolCard";

interface Props {
  documentId: string;
  documentTitle: string;
  documentStatus?: string;
  onResult: (material: StudyMaterial, extra?: { session?: VivaSession }) => void;
  onGenerating?: (toolKey: string | null) => void;
}

function StudySection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="study-section">
      <div className="mb-3">
        <h3 className="study-section-title">{title}</h3>
        {description && (
          <p className="mt-1 text-xs text-fg-muted">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export function StudyActions({
  documentId,
  documentTitle,
  documentStatus = "ready",
  onResult,
  onGenerating,
}: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [doubt, setDoubt] = useState("");
  const [voiceBusy, setVoiceBusy] = useState(false);
  const [doubtStyle, setDoubtStyle] = useState<ExplanationStyle>(
    (user?.preferredLanguage as ExplanationStyle) || "tamil_english"
  );

  const docReady = documentStatus === "ready";
  const disabled = !!loading || !docReady;

  const submitDoubt = async (text: string, audioBlob?: Blob) => {
    const trimmed = text.trim();
    if (!trimmed && !audioBlob) return;

    setLoading("doubt");
    onGenerating?.("doubt");
    setError("");
    try {
      let res: { success: boolean; data: StudyMaterial };

      // Live browser transcript → skip audio upload + server Whisper (much faster)
      const hasLiveTranscript = trimmed.length >= 8;

      if (audioBlob && !hasLiveTranscript) {
        const form = new FormData();
        form.append("audio", audioBlob, "doubt.webm");
        if (trimmed) form.append("doubt", trimmed);
        form.append("inputMode", "voice");
        form.append("language", doubtStyle);
        res = await api(`/study/doubt/${documentId}`, {
          method: "POST",
          body: form,
        });
      } else {
        res = await api(`/study/doubt/${documentId}`, {
          method: "POST",
          body: JSON.stringify({
            doubt: trimmed,
            inputMode: hasLiveTranscript || audioBlob ? "voice" : "text",
            language: doubtStyle,
          }),
        });
      }

      onResult(res.data);
      if (!audioBlob || hasLiveTranscript) setDoubt("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not explain doubt");
    } finally {
      setLoading(null);
      onGenerating?.(null);
      setVoiceBusy(false);
    }
  };

  const run = async (
    key: string,
    path: string,
    options?: RequestInit
  ) => {
    if (!docReady) {
      setError(
        documentStatus === "processing"
          ? "Document is still processing. Wait a moment and refresh."
          : "This document has no readable text. Upload a text-based PDF."
      );
      return;
    }
    setLoading(key);
    onGenerating?.(key);
    setError("");
    try {
      const res = await api<{
        success: boolean;
        data: StudyMaterial | { session: VivaSession; material: StudyMaterial };
      }>(path, { method: "POST", ...options });

      if ("session" in res.data) {
        onResult(res.data.material, { session: res.data.session });
      } else {
        onResult(res.data as StudyMaterial);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Generation failed");
    } finally {
      setLoading(null);
      onGenerating?.(null);
    }
  };

  const runLocalize = (mode: SriLankanMixMode) =>
    run(mode, `/study/localize/${documentId}`, {
      body: JSON.stringify({ mode }),
      headers: { "Content-Type": "application/json" },
    });

  const audioHint = "Text · audio · transcript";

  return (
    <div className="study-dashboard card !p-0 overflow-hidden">
      <header className="study-dashboard-header border-b border-slate-200/80 px-5 py-4 dark:border-slate-700/80">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/50">
            <BookOpen className="h-5 w-5 text-brand-700 dark:text-brand-300" />
          </span>
          <div className="min-w-0">
            <h2 className="font-semibold text-fg">Study workspace</h2>
            <p className="mt-0.5 truncate text-sm text-fg-muted">{documentTitle}</p>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-5 py-5">
        {!docReady && (
          <Alert variant="warning">
            {documentStatus === "processing"
              ? "Your file is still processing. Tools unlock when ready."
              : "Upload a text-based PDF (not a scanned image)."}
          </Alert>
        )}

        <StudySection
          title="Featured"
          description="Best for revision on the move"
        >
          <Link
            href={`/walk/${documentId}`}
            className={`study-featured-walk ${!docReady ? "pointer-events-none opacity-50" : ""}`}
          >
            <Footprints className="h-5 w-5 shrink-0" />
            <span className="min-w-0">
              <span className="block text-sm font-semibold">Teach me while walking</span>
              <span className="block text-xs opacity-90">
                Podcast audio · say &quot;explain again&quot; anytime
              </span>
            </span>
          </Link>
        </StudySection>

        <StudySection title="Revision materials">
          <div className="study-tool-grid">
            <StudyToolCard
              icon={FileText}
              title="Cheat sheet"
              description="Exam summary"
              accent="brand"
              loading={loading === "cheat"}
              disabled={disabled}
              onClick={() => run("cheat", `/study/cheat-sheet/${documentId}`)}
            />
            <StudyToolCard
              icon={Layers}
              title="Flashcards"
              description="Q&A cards"
              accent="violet"
              loading={loading === "flash"}
              disabled={disabled}
              onClick={() => run("flash", `/study/flashcards/${documentId}`)}
            />
            <StudyToolCard
              icon={Volume2}
              title="Voice lesson"
              description="English audio"
              accent="emerald"
              loading={loading === "voice"}
              disabled={disabled}
              onClick={() => run("voice", `/study/voice/${documentId}`)}
            />
            <StudyToolCard
              icon={CalendarDays}
              title="5-day plan"
              description="Study schedule"
              accent="cyan"
              loading={loading === "plan"}
              disabled={disabled}
              onClick={() => run("plan", `/study/plan/${documentId}`)}
            />
          </div>
        </StudySection>

        <StudySection title="Exam practice">
          <div className="study-tool-grid">
            <StudyToolCard
              icon={GraduationCap}
              title="Mock viva"
              description="Oral exam Q&A"
              accent="indigo"
              loading={loading === "viva"}
              disabled={disabled}
              onClick={() => run("viva", `/study/viva/generate/${documentId}`)}
            />
            <StudyToolCard
              icon={HelpCircle}
              title="MCQ quiz"
              description="Practice test"
              accent="rose"
              loading={loading === "mcq"}
              disabled={disabled}
              onClick={() => run("mcq", `/study/mcq/${documentId}`)}
            />
          </div>
        </StudySection>

        <StudySection
          title="Sri Lankan languages"
          description="Natural mix — how students really explain topics"
        >
          <p className="mb-3 rounded-lg bg-teal-500/10 px-3 py-2 text-[11px] text-teal-800 dark:text-teal-200">
            All language tools include written explanation, spoken audio, and auto-generated transcript.
          </p>
          <div className="study-tool-grid">
            {SRI_LANKAN_MIX_MODES.map(({ mode, label, short }) => (
              <StudyToolCard
                key={mode}
                icon={Languages}
                title={short}
                description={audioHint}
                accent="teal"
                loading={loading === mode}
                disabled={disabled}
                onClick={() => runLocalize(mode)}
              />
            ))}
            <StudyToolCard
              icon={Languages}
              title="Tamil explanation"
              description={audioHint}
              accent="orange"
              loading={loading === "tamil"}
              disabled={disabled}
              onClick={() =>
                run("tamil", `/study/tamil/${documentId}`, {
                  body: JSON.stringify({ lecturerStyle: false }),
                  headers: { "Content-Type": "application/json" },
                })
              }
            />
            <StudyToolCard
              icon={Sparkles}
              title="Lecturer Tamil"
              description={audioHint}
              accent="amber"
              loading={loading === "lecturer"}
              disabled={disabled}
              onClick={() =>
                run("lecturer", `/study/tamil/${documentId}`, {
                  body: JSON.stringify({ lecturerStyle: true }),
                  headers: { "Content-Type": "application/json" },
                })
              }
            />
          </div>
        </StudySection>

        <StudySection title="Ask a doubt">
          <div className="study-doubt-panel">
            <label className="label">Explanation style</label>
            <select
              className="input mb-3 w-full text-sm"
              value={doubtStyle}
              onChange={(e) => setDoubtStyle(e.target.value as ExplanationStyle)}
              disabled={disabled || voiceBusy}
            >
              {EXPLANATION_STYLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <VoiceDoubtInput
              disabled={disabled || voiceBusy}
              speechLang={
                doubtStyle === "tamil" || doubtStyle === "both"
                  ? "ta-IN"
                  : "en-US"
              }
              onRecordingChange={setVoiceBusy}
              onTranscript={(text, audioBlob) => {
                setDoubt(text);
                void submitDoubt(text, audioBlob);
              }}
            />

            <textarea
              value={doubt}
              onChange={(e) => setDoubt(e.target.value)}
              placeholder="Type your doubt here…"
              rows={3}
              className="input-field mb-3 mt-3 w-full resize-y text-sm"
              disabled={disabled || voiceBusy}
            />

            <button
              type="button"
              disabled={disabled || voiceBusy || !doubt.trim()}
              onClick={() => submitDoubt(doubt)}
              className="btn-primary flex w-full items-center justify-center gap-2"
            >
              {loading === "doubt" ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
              Explain with text + audio
            </button>
          </div>
        </StudySection>

        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Languages, Mic } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import {
  EXPLANATION_STYLE_OPTIONS,
  LANGUAGE_TOOL_OPTIONS,
  LanguageToolId,
} from "@/lib/localeLabels";
import { ExplanationStyle, StudyMaterial, VivaSession } from "@/types";
import { VoiceDoubtInput } from "@/components/VoiceDoubtInput";
import { Alert } from "@/components/ui/Alert";
import { StudySection } from "./StudySection";
import { StudyWorkspaceShell } from "./StudyWorkspaceShell";
import { useStudyRunner } from "./useStudyRunner";

interface Props {
  documentId: string;
  documentTitle: string;
  documentStatus?: string;
  onResult: (material: StudyMaterial, extra?: { session?: VivaSession }) => void;
  onGenerating?: (toolKey: string | null) => void;
}

export function StudyTutorActions({
  documentId,
  documentTitle,
  documentStatus = "ready",
  onResult,
  onGenerating,
}: Props) {
  const { user } = useAuth();
  const { loading, error, setError, disabled, docReady, run } = useStudyRunner(
    documentId,
    documentStatus,
    onResult,
    onGenerating
  );

  const [doubt, setDoubt] = useState("");
  const [voiceBusy, setVoiceBusy] = useState(false);
  const [doubtStyle, setDoubtStyle] = useState<ExplanationStyle>(
    (user?.preferredLanguage as ExplanationStyle) || "tamil_english"
  );
  const [languageTool, setLanguageTool] = useState<LanguageToolId>("tamil_english");

  const [doubtLoading, setDoubtLoading] = useState(false);

  const submitDoubt = async (text: string, audioBlob?: Blob) => {
    const trimmed = text.trim();
    if (!trimmed && !audioBlob) return;

    setDoubtLoading(true);
    onGenerating?.("doubt");
    setError("");
    try {
      let res: { success: boolean; data: StudyMaterial };
      const hasLiveTranscript = trimmed.length >= 8;

      if (audioBlob && !hasLiveTranscript) {
        const form = new FormData();
        form.append("audio", audioBlob, "doubt.webm");
        if (trimmed) form.append("doubt", trimmed);
        form.append("inputMode", "voice");
        form.append("language", doubtStyle);
        res = await api(`/study/doubt/${documentId}`, { method: "POST", body: form });
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
      setDoubtLoading(false);
      onGenerating?.(null);
      setVoiceBusy(false);
    }
  };

  const runLanguageTool = () => {
    if (languageTool === "english_voice") {
      run("voice", `/study/voice/${documentId}`);
      return;
    }

    if (
      languageTool === "tamil_english" ||
      languageTool === "sinhala_english" ||
      languageTool === "student_lk"
    ) {
      run(languageTool, `/study/localize/${documentId}`, {
        body: JSON.stringify({ mode: languageTool }),
        headers: { "Content-Type": "application/json" },
      });
      return;
    }

    const key = languageTool === "lecturer_tamil" ? "lecturer" : "tamil";
    run(key, `/study/tamil/${documentId}`, {
      body: JSON.stringify({ lecturerStyle: languageTool === "lecturer_tamil" }),
      headers: { "Content-Type": "application/json" },
    });
  };

  const languageLoading =
    loading === "tamil_english" ||
    loading === "sinhala_english" ||
    loading === "student_lk" ||
    loading === "tamil" ||
    loading === "lecturer" ||
    loading === "voice" ||
    doubtLoading;

  const selectedLanguage = LANGUAGE_TOOL_OPTIONS.find((o) => o.id === languageTool);

  return (
    <StudyWorkspaceShell
      documentTitle={documentTitle}
      backHref={`/documents/${documentId}`}
      backLabel="Back to study tools"
      subtitle="Languages & doubts"
    >
      {!docReady && (
        <Alert variant="warning">
          {documentStatus === "processing"
            ? "Your file is still processing. Tools unlock when ready."
            : "Upload a text-based PDF (not a scanned image)."}
        </Alert>
      )}

      <StudySection
        title="Sri Lankan languages"
        description="Tamil, Sinhala, and mixed explanations with audio"
      >
        <div className="study-language-panel">
          <label className="label" htmlFor="language-tool-select">
            Choose language style
          </label>
          <select
            id="language-tool-select"
            className="input mb-2 w-full text-sm"
            value={languageTool}
            onChange={(e) => setLanguageTool(e.target.value as LanguageToolId)}
            disabled={disabled || languageLoading}
          >
            {LANGUAGE_TOOL_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          {selectedLanguage && (
            <p className="mb-3 text-xs italic text-fg-muted">{selectedLanguage.hint}</p>
          )}
          <button
            type="button"
            disabled={disabled || languageLoading}
            onClick={runLanguageTool}
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            {languageLoading && loading !== "doubt" ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Languages className="h-4 w-4" />
            )}
            Generate explanation
          </button>
          <p className="mt-2 text-center text-[11px] text-fg-muted">
            Includes text, spoken audio, and auto-generated transcript
          </p>
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
              doubtStyle === "tamil" || doubtStyle === "both" ? "ta-IN" : "en-US"
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
            rows={4}
            className="input-field mb-3 mt-3 w-full resize-y text-sm"
            disabled={disabled || voiceBusy}
          />

          <button
            type="button"
            disabled={disabled || voiceBusy || !doubt.trim()}
            onClick={() => submitDoubt(doubt)}
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            {doubtLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            Explain with text + audio
          </button>
        </div>
      </StudySection>

      {error && <p className="text-sm text-danger">{error}</p>}
    </StudyWorkspaceShell>
  );
}

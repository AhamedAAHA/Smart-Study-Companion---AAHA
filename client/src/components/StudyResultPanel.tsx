"use client";

import { useEffect, useState } from "react";
import { Bookmark, Copy, Download, FileText, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { StudyMaterial, VivaSession } from "@/types";
import { MarkdownContent } from "./MarkdownContent";
import { FlashcardDeck } from "./FlashcardDeck";
import { AudioPlayer } from "./AudioPlayer";
import { VoiceTutorControls } from "./VoiceTutorControls";
import { VivaPanel } from "./VivaPanel";
import { McqQuiz } from "./McqQuiz";
import { Badge } from "./ui/Badge";
import { BackLink } from "./ui/BackLink";
import { downloadAuthenticatedFile } from "@/lib/downloadFile";
import { getMaterialTypeLabel } from "@/lib/materialLabels";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type DownloadFormat = "pdf" | "docx";

export function StudyResultPanel({
  material,
  vivaSession,
  onUpdate,
  onBack,
}: {
  material: StudyMaterial;
  vivaSession?: VivaSession;
  onUpdate?: (m: StudyMaterial) => void;
  onBack?: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState<DownloadFormat | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [saved, setSaved] = useState(material.savedToLibrary);
  const [copied, setCopied] = useState(false);

  const spokenTypes = [
    "voice_explanation",
    "doubt_explanation",
    "tamil_explanation",
    "lecturer_tamil",
    "localized_explanation",
  ];
  const isSpokenLesson = spokenTypes.includes(material.type);
  const hasAudio = Boolean(material.audioUrl) || isSpokenLesson;
  const audioPending =
    Boolean(material.metadata?.audioPending) && !material.audioUrl;

  useEffect(() => {
    if (!onUpdate || !audioPending) return;

    const poll = async () => {
      try {
        const res = await api<{ success: boolean; data: StudyMaterial }>(
          `/study/materials/${material._id}`
        );
        if (res.data.audioUrl || !res.data.metadata?.audioPending) {
          onUpdate(res.data);
        }
      } catch {
        /* ignore transient poll errors */
      }
    };

    void api(`/study/materials/${material._id}/audio`, { method: "POST" }).catch(
      () => {}
    );
    void poll();
    const interval = setInterval(() => void poll(), 2000);
    return () => clearInterval(interval);
  }, [material._id, audioPending, onUpdate]);

  const saveToLibrary = async () => {
    setSaving(true);
    try {
      await api(`/study/materials/${material._id}/save`, { method: "PATCH" });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(material.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = async (format: DownloadFormat) => {
    setDownloading(format);
    try {
      const token = localStorage.getItem("ssc_token");
      if (!token) throw new Error("Please sign in again to download files.");

      const ext = format === "docx" ? "docx" : "pdf";
      const fallback = `${material.title.replace(/[^a-z0-9._-]+/gi, "_")}.${ext}`;

      await downloadAuthenticatedFile(
        `${API_BASE}/study/materials/${material._id}/download?format=${format}`,
        token,
        fallback
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="result-panel">
      <div className="space-y-3 border-b border-slate-200/80 pb-4 dark:border-slate-700/80">
        {onBack && <BackLink onClick={onBack} label="Back to tools" />}
        <Badge variant="info">
          {getMaterialTypeLabel(material.type, material.metadata?.mixMode)}
        </Badge>
        <h3
          className="truncate font-semibold text-fg [text-wrap:nowrap]"
          title={material.title}
        >
          {material.title}
        </h3>
        {downloadNotice && (
          <p
            className={`text-sm ${
              downloadNotice.includes("saved")
                ? "text-brand-700 dark:text-brand-300"
                : "text-danger"
            }`}
            role="status"
          >
            {downloadNotice}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={saveToLibrary} disabled={saving || saved} className="btn-secondary !py-2 !text-xs">
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bookmark className="h-3 w-3" />}
            {saved ? "Saved" : "Save"}
          </button>
          <button type="button" onClick={copyText} className="btn-secondary !py-2 !text-xs">
            <Copy className="h-3 w-3" />
            {copied ? "Copied!" : "Copy"}
          </button>
          <button type="button" onClick={() => download("pdf")} disabled={!!downloading} className="btn-secondary !py-2 !text-xs">
            {downloading === "pdf" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
            PDF
          </button>
          <button type="button" onClick={() => download("docx")} disabled={!!downloading} className="btn-secondary !py-2 !text-xs">
            {downloading === "docx" ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
            Word
          </button>
        </div>
      </div>

      {material.type === "mcq_quiz" && material.metadata?.questions ? (
        <McqQuiz questions={material.metadata.questions} />
      ) : material.type === "flashcards" && material.flashcards ? (
        <FlashcardDeck material={material} onUpdate={(m) => onUpdate?.(m)} />
      ) : (
        <>
          {material.type === "doubt_explanation" && material.metadata?.doubt && (
            <div className="space-y-3">
              <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 dark:border-amber-500/30 dark:bg-amber-950/20">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                  Your doubt
                  {material.metadata.inputMode === "voice" && (
                    <span className="ml-2 rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold normal-case text-amber-900 dark:bg-amber-800/50 dark:text-amber-100">
                      asked by voice
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm text-fg-secondary">{material.metadata.doubt}</p>
              </div>
              {material.metadata.inputMode === "voice" && material.metadata.questionTranscript && (
                <details className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                  <summary className="cursor-pointer text-sm font-semibold text-fg">Question transcript</summary>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-fg-subtle">
                    {material.metadata.questionTranscript}
                  </p>
                </details>
              )}
            </div>
          )}

          {onUpdate && (material.type === "voice_explanation" || material.type === "doubt_explanation") && (
            <VoiceTutorControls material={material} onUpdate={onUpdate} />
          )}

          {hasAudio && (
            <AudioPlayer
              key={`${material._id}-${material.metadata?.lastRefineMode || "base"}`}
              url={material.audioUrl}
              title={material.title}
              text={material.content}
              speechRate={material.metadata?.speechRate}
              elevenlabsConfigured={material.metadata?.elevenlabsConfigured}
              voiceError={material.metadata?.voiceError}
              audioPending={audioPending}
            />
          )}

          <div className="markdown-panel">
            <MarkdownContent content={material.content} />
          </div>

          {isSpokenLesson && material.metadata?.transcript && (
            <details className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/40">
              <summary className="cursor-pointer text-sm font-semibold text-fg">
                Spoken transcript (auto-generated)
              </summary>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-fg-subtle">
                {material.metadata.transcript}
              </p>
            </details>
          )}
        </>
      )}

      {vivaSession && <VivaPanel session={vivaSession} />}
    </div>
  );
}

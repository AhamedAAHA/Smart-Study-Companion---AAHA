"use client";

import { useState } from "react";
import { Bookmark, Copy, Download, FileText, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { StudyMaterial, VivaSession } from "@/types";
import { MarkdownContent } from "./MarkdownContent";
import { FlashcardDeck } from "./FlashcardDeck";
import { AudioPlayer } from "./AudioPlayer";
import { VivaPanel } from "./VivaPanel";
import { McqQuiz } from "./McqQuiz";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type DownloadFormat = "pdf" | "docx";

export function StudyResultPanel({
  material,
  vivaSession,
  onUpdate,
}: {
  material: StudyMaterial;
  vivaSession?: VivaSession;
  onUpdate?: (m: StudyMaterial) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState<DownloadFormat | null>(null);
  const [saved, setSaved] = useState(material.savedToLibrary);
  const [copied, setCopied] = useState(false);

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
      const res = await fetch(
        `${API_BASE}/study/materials/${material._id}/download?format=${format}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Download failed");
      }
      const blob = await res.blob();
      const ext = format === "docx" ? "docx" : "pdf";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${material.title.replace(/[^a-z0-9]/gi, "_")}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-900">{material.title}</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={saveToLibrary}
            disabled={saving || saved}
            className="btn-secondary !py-2 !text-xs"
          >
            {saving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Bookmark className="h-3 w-3" />
            )}
            {saved ? "Saved" : "Save to library"}
          </button>
          <button
            type="button"
            onClick={copyText}
            className="btn-secondary !py-2 !text-xs"
          >
            <Copy className="h-3 w-3" />
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            type="button"
            onClick={() => download("pdf")}
            disabled={!!downloading}
            className="btn-secondary !py-2 !text-xs"
          >
            {downloading === "pdf" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Download className="h-3 w-3" />
            )}
            PDF
          </button>
          <button
            type="button"
            onClick={() => download("docx")}
            disabled={!!downloading}
            className="btn-secondary !py-2 !text-xs"
          >
            {downloading === "docx" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <FileText className="h-3 w-3" />
            )}
            Word
          </button>
        </div>
      </div>

      {material.type === "mcq_quiz" && material.metadata?.questions ? (
        <McqQuiz questions={material.metadata.questions} />
      ) : material.type === "flashcards" && material.flashcards ? (
        <FlashcardDeck
          material={material}
          onUpdate={(m) => onUpdate?.(m)}
        />
      ) : (
        <>
          {(material.audioUrl || material.type === "voice_explanation") && (
            <AudioPlayer
              url={material.audioUrl}
              title={material.title}
              text={material.content}
              elevenlabsConfigured={material.metadata?.elevenlabsConfigured}
              voiceError={material.metadata?.voiceError}
            />
          )}
          <MarkdownContent content={material.content} />
        </>
      )}

      {vivaSession && <VivaPanel session={vivaSession} />}
    </div>
  );
}

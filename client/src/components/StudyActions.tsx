"use client";

import Link from "next/link";
import {
  FileText,
  Layers,
  GraduationCap,
  CalendarDays,
  HelpCircle,
  Footprints,
  Languages,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { StudyMaterial, VivaSession } from "@/types";
import { Alert } from "./ui/Alert";
import { StudySection } from "./study/StudySection";
import { StudyWorkspaceShell } from "./study/StudyWorkspaceShell";
import { StudyToolCard } from "./study/StudyToolCard";
import { useStudyRunner } from "./study/useStudyRunner";

interface Props {
  documentId: string;
  documentTitle: string;
  documentStatus?: string;
  onResult: (material: StudyMaterial, extra?: { session?: VivaSession }) => void;
  onGenerating?: (toolKey: string | null) => void;
}

export function StudyActions({
  documentId,
  documentTitle,
  documentStatus = "ready",
  onResult,
  onGenerating,
}: Props) {
  const { loading, error, disabled, docReady, run } = useStudyRunner(
    documentId,
    documentStatus,
    onResult,
    onGenerating
  );

  return (
    <StudyWorkspaceShell
      documentTitle={documentTitle}
      backHref="/dashboard"
      backLabel="Back to dashboard"
      subtitle="Study workspace"
    >
      {!docReady && (
        <Alert variant="warning">
          {documentStatus === "processing"
            ? "Your file is still processing. Tools unlock when ready."
            : "Upload a text-based PDF (not a scanned image)."}
        </Alert>
      )}

      <StudySection title="Featured" description="Best for revision on the move">
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
        <div className="study-tool-grid study-tool-grid-3">
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
        <div className="study-tool-grid study-tool-grid-2">
          <StudyToolCard
            icon={GraduationCap}
            title="Mock viva"
            description="Speak answers · examiner voice"
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

      <StudySection title="More tools">
        <Link
          href={`/documents/${documentId}/tutor`}
          className={`study-hub-link ${!docReady ? "pointer-events-none opacity-50" : ""}`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/40">
            <Languages className="h-5 w-5 text-brand-700 dark:text-brand-300" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 font-semibold text-fg">
              <MessageCircle className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              Languages &amp; doubts
            </span>
            <span className="mt-0.5 block text-xs text-fg-muted">
              Tamil, Sinhala, voice explanations · ask your own questions
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-fg-muted" aria-hidden />
        </Link>
      </StudySection>

      {error && <p className="text-sm text-danger">{error}</p>}
    </StudyWorkspaceShell>
  );
}

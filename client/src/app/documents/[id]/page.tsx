"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StudyActions } from "@/components/StudyActions";
import { StudyResultPanel } from "@/components/StudyResultPanel";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import {
  documentStatusLabel,
  documentStatusVariant,
} from "@/lib/documentStatus";
import { LectureDocument, StudyMaterial, VivaSession } from "@/types";

export default function DocumentPage() {
  return (
    <ProtectedRoute roles={["student"]}>
      <DocumentContent />
    </ProtectedRoute>
  );
}

function DocumentContent() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<LectureDocument | null>(null);
  const [result, setResult] = useState<StudyMaterial | null>(null);
  const [vivaSession, setVivaSession] = useState<VivaSession | undefined>();
  const [generating, setGenerating] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<{ success: boolean; data: LectureDocument }>(`/documents/${id}`).then(
      (res) => setDoc(res.data)
    );
  }, [id]);

  const handleResult = (
    material: StudyMaterial,
    extra?: { session?: VivaSession }
  ) => {
    setGenerating(null);
    setResult(material);
    setVivaSession(extra?.session);
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  if (!doc) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <header className="mb-6">
        {doc.module && (
          <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
            {doc.module}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-fg">{doc.title}</h1>
          <Badge variant={documentStatusVariant(doc.status)}>
            {documentStatusLabel(doc.status)}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-fg-muted">{doc.originalFilename}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <StudyActions
          documentId={doc._id}
          documentTitle={doc.title}
          documentStatus={doc.status}
          onResult={handleResult}
          onGenerating={setGenerating}
        />
        <div ref={resultRef} className="min-h-[200px] space-y-4 lg:sticky lg:top-24">
          {generating && (
            <div className="card flex items-center gap-3 border-brand-200/80 bg-brand-50/50 p-4 dark:border-brand-800/40 dark:bg-brand-950/20">
              <Spinner />
              <p className="text-sm text-fg-secondary">
                Generating content… This usually takes a few seconds for text; audio
                may continue in the background.
              </p>
            </div>
          )}
          {result ? (
            <StudyResultPanel
              material={result}
              vivaSession={vivaSession}
              onUpdate={setResult}
            />
          ) : !generating ? (
            <div className="card flex min-h-[200px] items-center justify-center p-6">
              <EmptyState
                icon={Sparkles}
                title="No content yet"
                description="Pick a study tool on the left to generate cheat sheets, flashcards, voice lessons, and more."
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

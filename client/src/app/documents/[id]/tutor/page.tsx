"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StudyTutorActions } from "@/components/study/StudyTutorActions";
import { StudyResultColumn } from "@/components/study/StudyResultColumn";
import { BackLink } from "@/components/ui/BackLink";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import {
  documentStatusLabel,
  documentStatusVariant,
} from "@/lib/documentStatus";
import { LectureDocument, StudyMaterial, VivaSession } from "@/types";

export default function DocumentTutorPage() {
  return (
    <ProtectedRoute roles={["student"]}>
      <TutorContent />
    </ProtectedRoute>
  );
}

function TutorContent() {
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

  const clearResult = () => {
    setResult(null);
    setVivaSession(undefined);
    setGenerating(null);
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
      <BackLink href="/dashboard" label="Back to dashboard" className="mb-4" />

      <header className="mb-6">
        {doc.module && (
          <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
            {doc.module}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-fg">Languages &amp; doubts</h1>
          <Badge variant={documentStatusVariant(doc.status)}>
            {documentStatusLabel(doc.status)}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-fg-muted">{doc.title}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <StudyTutorActions
          documentId={doc._id}
          documentTitle={doc.title}
          documentStatus={doc.status}
          onResult={handleResult}
          onGenerating={setGenerating}
        />
        <StudyResultColumn
          resultRef={resultRef}
          result={result}
          vivaSession={vivaSession}
          generating={generating}
          onUpdate={setResult}
          onClear={clearResult}
          emptyDescription="Generate a language explanation or ask a doubt. Your answer appears here."
        />
      </div>
    </div>
  );
}

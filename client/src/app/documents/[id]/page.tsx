"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StudyActions } from "@/components/StudyActions";
import { StudyResultPanel } from "@/components/StudyResultPanel";
import { api } from "@/lib/api";
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

  useEffect(() => {
    api<{ success: boolean; data: LectureDocument }>(`/documents/${id}`).then(
      (res) => setDoc(res.data)
    );
  }, [id]);

  if (!doc) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <p className="text-sm text-brand-600">{doc.module || "Lecture material"}</p>
        <h1 className="font-display text-2xl font-bold text-slate-900">{doc.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {doc.originalFilename} · <span className="capitalize">{doc.status}</span>
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <StudyActions
          documentId={doc._id}
          documentTitle={doc.title}
          onResult={(material, extra) => {
            setResult(material);
            setVivaSession(extra?.session);
          }}
        />
        {result ? (
          <StudyResultPanel
            material={result}
            vivaSession={vivaSession}
            onUpdate={setResult}
          />
        ) : (
          <div className="card flex min-h-[200px] items-center justify-center text-center text-sm text-slate-500">
            Select a study tool to generate content from this document.
          </div>
        )}
      </div>
    </div>
  );
}

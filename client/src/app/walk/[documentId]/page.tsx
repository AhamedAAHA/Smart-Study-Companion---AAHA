"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { WalkingTutor } from "@/components/walk/WalkingTutor";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { LectureDocument } from "@/types";

export default function WalkPage() {
  return (
    <ProtectedRoute roles={["student"]}>
      <WalkPageContent />
    </ProtectedRoute>
  );
}

function WalkPageContent() {
  const { documentId } = useParams<{ documentId: string }>();
  const [doc, setDoc] = useState<LectureDocument | null>(null);

  useEffect(() => {
    api<{ success: boolean; data: LectureDocument }>(`/documents/${documentId}`).then(
      (res) => setDoc(res.data)
    );
  }, [documentId]);

  if (!doc) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (doc.status !== "ready") {
    return (
      <div className="page-shell text-center">
        <p className="text-fg-muted">
          This document is not ready yet. Open it from your dashboard when processing finishes.
        </p>
      </div>
    );
  }

  return <WalkingTutor documentId={doc._id} documentTitle={doc.title} />;
}

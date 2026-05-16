"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { VivaPanel } from "@/components/VivaPanel";
import { api } from "@/lib/api";
import { VivaSession } from "@/types";

export default function VivaPage() {
  return (
    <ProtectedRoute roles={["student"]}>
      <VivaContent />
    </ProtectedRoute>
  );
}

function VivaContent() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<VivaSession | null>(null);

  useEffect(() => {
    api<{ success: boolean; data: VivaSession }>(`/study/viva/${sessionId}`).then(
      (res) => setSession(res.data)
    );
  }, [sessionId]);

  if (!session) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <VivaPanel session={session} />
    </div>
  );
}

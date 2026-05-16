"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { StudyMaterial, VivaSession } from "@/types";

export function useStudyRunner(
  documentId: string,
  documentStatus: string,
  onResult: (material: StudyMaterial, extra?: { session?: VivaSession }) => void,
  onGenerating?: (toolKey: string | null) => void
) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const docReady = documentStatus === "ready";
  const disabled = !!loading || !docReady;

  const run = async (key: string, path: string, options?: RequestInit) => {
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

  return { loading, error, setError, disabled, docReady, run };
}

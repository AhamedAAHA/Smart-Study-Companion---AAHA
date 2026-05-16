"use client";

import { useState } from "react";
import {
  FileText,
  Layers,
  Languages,
  GraduationCap,
  Volume2,
  Loader2,
  Sparkles,
  CalendarDays,
  HelpCircle,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { StudyMaterial, VivaSession } from "@/types";

interface Props {
  documentId: string;
  documentTitle: string;
  onResult: (material: StudyMaterial, extra?: { session?: VivaSession }) => void;
}

export function StudyActions({ documentId, documentTitle, onResult }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const run = async (
    key: string,
    path: string,
    options?: RequestInit
  ) => {
    setLoading(key);
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
    }
  };

  const actions = [
    {
      key: "cheat",
      label: "Generate Cheat Sheet",
      icon: FileText,
      path: `/study/cheat-sheet/${documentId}`,
      className: "hover:border-brand-300 hover:bg-brand-50",
    },
    {
      key: "flash",
      label: "Create Flashcards",
      icon: Layers,
      path: `/study/flashcards/${documentId}`,
      className: "hover:border-violet-300 hover:bg-violet-50",
    },
    {
      key: "tamil",
      label: "Explain in Tamil",
      icon: Languages,
      path: `/study/tamil/${documentId}`,
      body: JSON.stringify({ lecturerStyle: false }),
      className: "hover:border-orange-300 hover:bg-orange-50",
    },
    {
      key: "lecturer",
      label: "Explain like my lecturer in Tamil",
      icon: Sparkles,
      path: `/study/tamil/${documentId}`,
      body: JSON.stringify({ lecturerStyle: true }),
      className: "hover:border-amber-300 hover:bg-amber-50 ring-1 ring-amber-200",
    },
    {
      key: "viva",
      label: "Mock Viva Questions",
      icon: GraduationCap,
      path: `/study/viva/generate/${documentId}`,
      className: "hover:border-indigo-300 hover:bg-indigo-50",
    },
    {
      key: "voice",
      label: "Voice Explanation (ElevenLabs)",
      icon: Volume2,
      path: `/study/voice/${documentId}`,
      className: "hover:border-emerald-300 hover:bg-emerald-50",
    },
    {
      key: "plan",
      label: "AI Study Plan (5 days)",
      icon: CalendarDays,
      path: `/study/plan/${documentId}`,
      className: "hover:border-cyan-300 hover:bg-cyan-50",
    },
    {
      key: "mcq",
      label: "MCQ Practice Quiz",
      icon: HelpCircle,
      path: `/study/mcq/${documentId}`,
      className: "hover:border-rose-300 hover:bg-rose-50",
    },
  ];

  return (
    <div className="card">
      <h2 className="mb-1 font-semibold text-slate-900">Study Tools</h2>
      <p className="mb-4 text-sm text-slate-500">
        AI tools for <span className="font-medium text-brand-800">{documentTitle}</span>
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((a) => (
          <button
            key={a.key}
            type="button"
            disabled={!!loading}
            onClick={() =>
              run(a.key, a.path, {
                body: a.body,
                headers: a.body ? { "Content-Type": "application/json" } : undefined,
              })
            }
            className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left text-sm font-medium transition ${a.className} disabled:opacity-60`}
          >
            {loading === a.key ? (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-brand-600" />
            ) : (
              <a.icon className="h-5 w-5 shrink-0 text-brand-600" />
            )}
            {a.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <p className="mt-4 text-xs text-slate-400">
        Voice mode uses ElevenLabs multilingual TTS. Configure API keys in server .env.
      </p>
    </div>
  );
}

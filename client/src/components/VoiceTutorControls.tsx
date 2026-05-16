"use client";

import { useState } from "react";
import {
  Languages,
  Loader2,
  Rabbit,
  RefreshCw,
  Sparkles,
  Star,
  Lightbulb,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { StudyMaterial, VoiceRefineMode } from "@/types";

const MODES: {
  mode: VoiceRefineMode;
  label: string;
  icon: typeof Sparkles;
}[] = [
  { mode: "simpler", label: "Explain simpler", icon: Sparkles },
  { mode: "real_life", label: "Real-life example", icon: Lightbulb },
  { mode: "tamil_english", label: "Tamil–English mix", icon: Languages },
  { mode: "sinhala_english", label: "Sinhala–English mix", icon: Languages },
  { mode: "student_lk", label: "Student LK style", icon: Sparkles },
  { mode: "slow", label: "Explain slowly", icon: Rabbit },
  { mode: "repeat", label: "Repeat important point", icon: Star },
];

export function VoiceTutorControls({
  material,
  onUpdate,
}: {
  material: StudyMaterial;
  onUpdate: (m: StudyMaterial) => void;
}) {
  const [loading, setLoading] = useState<VoiceRefineMode | null>(null);
  const [error, setError] = useState("");

  const refine = async (mode: VoiceRefineMode) => {
    setLoading(mode);
    setError("");
    try {
      const res = await api<{ success: boolean; data: StudyMaterial }>(
        `/study/materials/${material._id}/voice-refine`,
        {
          method: "POST",
          body: JSON.stringify({ mode }),
        }
      );
      onUpdate(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update explanation");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/60 p-4 dark:border-indigo-500/30 dark:bg-indigo-950/25">
      <div className="mb-3 flex items-center gap-2">
        <RefreshCw className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <p className="text-sm font-semibold text-fg">Talk to your tutor</p>
      </div>
      <p className="mb-3 text-xs text-fg-muted">
        Tap a button — AI instantly rewrites and regenerates the voice explanation.
      </p>
      <div className="flex flex-wrap gap-2">
        {MODES.map(({ mode, label, icon: Icon }) => (
          <button
            key={mode}
            type="button"
            disabled={!!loading}
            onClick={() => refine(mode)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              material.metadata?.lastRefineMode === mode
                ? "border-indigo-400 bg-indigo-100 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-900/50 dark:text-indigo-100"
                : "border-slate-200 bg-white text-fg-secondary hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-600 dark:bg-slate-800/80 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-950/40"
            } disabled:opacity-60`}
          >
            {loading === mode ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Icon className="h-3.5 w-3.5 shrink-0" />
            )}
            {label}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
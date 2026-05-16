"use client";

import { useState } from "react";
import { Calendar, Save } from "lucide-react";
import { api } from "@/lib/api";

export function ExamCountdown({
  initialTitle,
  initialDate,
  onSaved,
}: {
  initialTitle?: string;
  initialDate?: string;
  onSaved?: () => void;
}) {
  const [title, setTitle] = useState(initialTitle || "");
  const [date, setDate] = useState(
    initialDate ? new Date(initialDate).toISOString().slice(0, 10) : ""
  );
  const [saving, setSaving] = useState(false);

  const daysLeft = date
    ? Math.ceil(
        (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const save = async () => {
    setSaving(true);
    try {
      await api("/study/exam", {
        method: "PATCH",
        body: JSON.stringify({ examTitle: title, examDate: date }),
      });
      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card border-accent-200 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-slate-900">
      <div className="mb-3 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-accent-600" />
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          Exam / Viva countdown
        </h3>
      </div>

      {daysLeft !== null && date && (
        <div className="mb-4 rounded-xl bg-white/80 px-4 py-3 text-center dark:bg-slate-800/80">
          <p className="text-3xl font-bold text-brand-700 dark:text-brand-300">
            {daysLeft > 0 ? daysLeft : daysLeft === 0 ? "Today!" : "Passed"}
          </p>
          <p className="text-xs text-slate-500">
            {daysLeft > 0 ? "days until" : ""} {title || "your exam"}
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Exam / viva name</label>
          <input
            className="input"
            placeholder="e.g. OS Viva"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={save}
        disabled={saving || !date}
        className="btn-accent mt-3 !py-2"
      >
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save countdown"}
      </button>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StudyResultPanel } from "@/components/StudyResultPanel";
import { api } from "@/lib/api";
import { StudyMaterial } from "@/types";

export default function LibraryPage() {
  return (
    <ProtectedRoute roles={["student"]}>
      <LibraryContent />
    </ProtectedRoute>
  );
}

function LibraryContent() {
  const [items, setItems] = useState<StudyMaterial[]>([]);
  const [selected, setSelected] = useState<StudyMaterial | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q) ||
        i.content.toLowerCase().includes(q)
    );
  }, [items, query]);

  useEffect(() => {
    api<{ success: boolean; data: StudyMaterial[] }>("/study/library").then(
      (res) => {
        setItems(res.data);
        if (res.data[0]) setSelected(res.data[0]);
      }
    );
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-fg">My Library</h1>
      <p className="mt-1 text-fg-subtle">Saved cheat sheets, explanations, and notes</p>

      <div className="relative mt-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-10"
          placeholder="Search library..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <ul className="space-y-2 lg:col-span-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-fg-muted">Save materials from document study tools.</p>
          ) : (
            filtered.map((item) => (
              <li key={item._id}>
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm text-fg transition ${
                    selected?._id === item._id
                      ? "border-brand-400 bg-brand-50 dark:bg-brand-900/30"
                      : "border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {item.title}
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="lg:col-span-2">
          {selected ? (
            <StudyResultPanel material={selected} onUpdate={setSelected} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

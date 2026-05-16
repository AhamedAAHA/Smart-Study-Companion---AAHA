"use client";

import { useState, useRef, useEffect } from "react";
import { Moon, Sun, Palette, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useTheme, ColorTheme } from "./ThemeProvider";

const COLOR_OPTIONS: { id: ColorTheme; label: string; swatch: string }[] = [
  { id: "teal", label: "Teal", swatch: "bg-teal-500" },
  { id: "ocean", label: "Ocean", swatch: "bg-blue-500" },
  { id: "sunset", label: "Sunset", swatch: "bg-orange-500" },
  { id: "violet", label: "Violet", swatch: "bg-violet-500" },
];

export function ThemeSwitcher() {
  const { mode, color, toggleMode, setColor } = useTheme();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <span ref={panelRef} className="relative inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={toggleMode}
        className="btn-secondary !p-2 transition-transform hover:scale-105 active:scale-95"
        aria-label="Toggle light and dark mode"
      >
        {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn-secondary !gap-1 !py-2 !pl-2.5 !pr-2 transition-transform hover:scale-105 active:scale-95"
        aria-label="Choose color theme"
        aria-expanded={open}
      >
        <Palette className="h-4 w-4" />
        <ChevronDown
          className={clsx("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <span className="animate-scale-in absolute right-0 top-full z-50 mt-2 block w-44 rounded-xl border border-slate-200/80 bg-white p-2 shadow-lg dark:border-slate-600 dark:bg-slate-800">
          <p className="px-2 py-1 text-xs font-medium text-fg-muted">Color theme</p>
          {COLOR_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setColor(opt.id);
                setOpen(false);
              }}
              className={clsx(
                "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
                color === opt.id
                  ? "bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200"
                  : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
              )}
            >
              <span className={clsx("h-4 w-4 rounded-full ring-2 ring-white", opt.swatch)} />
              {opt.label}
            </button>
          ))}
        </span>
      )}
    </span>
  );
}

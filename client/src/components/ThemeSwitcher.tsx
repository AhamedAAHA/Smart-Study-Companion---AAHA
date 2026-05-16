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
  const { mode, color, setMode, setColor } = useTheme();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

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
    <div ref={panelRef} className="flex items-center gap-2">
      <div
        className="theme-segment"
        role="group"
        aria-label="Day or night appearance"
      >
        <button
          type="button"
          onClick={() => setMode("light")}
          className={clsx("theme-segment-btn", mode === "light" && "is-active")}
          aria-pressed={mode === "light"}
        >
          <Sun className="h-3.5 w-3.5" />
          <span>Day</span>
        </button>
        <button
          type="button"
          onClick={() => setMode("dark")}
          className={clsx("theme-segment-btn", mode === "dark" && "is-active")}
          aria-pressed={mode === "dark"}
        >
          <Moon className="h-3.5 w-3.5" />
          <span>Night</span>
        </button>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="btn-secondary !gap-1 !py-2 !pl-2.5 !pr-2"
          aria-label="Accent color"
          aria-expanded={open}
        >
          <Palette className="h-4 w-4" />
          <ChevronDown
            className={clsx("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
          />
        </button>
        {open && (
          <div className="theme-panel animate-scale-in">
            <p className="theme-panel-label">Accent color</p>
            {COLOR_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setColor(opt.id);
                  setOpen(false);
                }}
                className={clsx(
                  "theme-panel-item",
                  color === opt.id && "is-active"
                )}
              >
                <span className={clsx("h-4 w-4 rounded-full", opt.swatch)} />
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

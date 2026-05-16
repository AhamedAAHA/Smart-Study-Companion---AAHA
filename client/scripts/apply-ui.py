from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src"

files = {}

files["components/motion/FadeIn.tsx"] = r'''"use client";

import { useEffect, useRef, useState, ReactNode, CSSProperties } from "react";
import clsx from "clsx";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
};

const directionClass = {
  up: "animate-fade-in-up",
  down: "animate-fade-in-down",
  left: "animate-fade-in-left",
  right: "animate-fade-in-right",
  none: "animate-fade-in",
};

export function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.6,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const style: CSSProperties = {
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  };

  return (
    <div
      ref={ref}
      className={clsx(!visible && "opacity-0", visible && directionClass[direction], className)}
      style={visible ? style : undefined}
    >
      {children}
    </motion-safe>
  );
}
'''.replace("</motion-safe>", "</div>")

files["components/PageBackground.tsx"] = r'''"use client";

export function PageBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <span className="mesh-blob mesh-blob-1" />
      <span className="mesh-blob mesh-blob-2" />
      <span className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(248,250,252,0.85))] dark:bg-[linear-gradient(to_bottom,transparent,rgba(2,6,23,0.9))]" />
    </motion-safe>
  );
}
'''.replace("</motion-safe>", "</motion-safe>").replace("<motion-safe", "<motion-safe").replace("motion-safe", "div")

# fix PageBackground properly
files["components/PageBackground.tsx"] = '''"use client";

export function PageBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <span className="mesh-blob mesh-blob-1" />
      <span className="mesh-blob mesh-blob-2" />
      <span className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(248,250,252,0.85))] dark:bg-[linear-gradient(to_bottom,transparent,rgba(2,6,23,0.9))]" />
    </div>
  );
}
'''

files["components/ThemeSwitcher.tsx"] = '''"use client";

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
    <motion-safe ref={panelRef} className="relative flex items-center gap-1.5">
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
        <ChevronDown className={clsx("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <motion-safe className="animate-scale-in absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-slate-200/80 bg-white p-2 shadow-lg dark:border-slate-600 dark:bg-slate-800">
          <p className="px-2 py-1 text-xs font-medium text-slate-500">Color theme</p>
          {COLOR_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => { setColor(opt.id); setOpen(false); }}
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
        </motion-safe>
      )}
    </motion-safe>
  );
}
'''.replace("motion-safe", "motion-safe").replace("motion-safe", "div")

# simpler - just replace motion-safe with div in ThemeSwitcher content
ts_content = files["components/ThemeSwitcher.tsx"]
files["components/ThemeSwitcher.tsx"] = ts_content.replace("motion-safe", "div")

files["components/ThemeProvider.tsx"] = open(ROOT / "components/ThemeProvider.tsx", encoding="utf-8").read().replace("</motion-safe>", "</motion-safe>").replace("motion-safe", "motion-safe")
files["components/ThemeProvider.tsx"] = files["components/ThemeProvider.tsx"].replace("motion-safe", "div")

for rel, content in files.items():
    path = ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print("wrote", rel)

print("done")

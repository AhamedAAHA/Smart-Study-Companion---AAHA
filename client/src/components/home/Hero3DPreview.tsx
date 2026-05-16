"use client";

import { useRef } from "react";
import { FileText, GraduationCap, Volume2, Sparkles } from "lucide-react";

export function Hero3DPreview() {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `rotateX(${-y * 14}deg) rotateY(${x * 14}deg) translateZ(0)`;
  };

  const handleLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform =
        "rotateX(4deg) rotateY(-6deg) translateZ(0)";
    }
  };

  return (
    <div
      className="perspective-distant relative mx-auto w-full max-w-[22rem] sm:max-w-md lg:max-w-lg"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <span className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-brand-500/15 blur-3xl dark:bg-brand-500/20" />
      <span className="pointer-events-none absolute -bottom-6 left-1/2 h-8 w-3/4 -translate-x-1/2 rounded-full bg-slate-900/10 blur-2xl dark:bg-black/40" />

      <div
        ref={cardRef}
        className="glass-card-3d relative overflow-hidden transition-transform duration-200 ease-out"
        style={{ transform: "rotateX(4deg) rotateY(-6deg)" }}
      >
        <span className="glass-card-shine" />
        <span className="flex items-center justify-between border-b border-slate-200/80 px-4 py-3 dark:border-white/10">
          <span className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-red-400/80" />
            <span className="flex h-2 w-2 rounded-full bg-amber-400/80" />
            <span className="flex h-2 w-2 rounded-full bg-emerald-400/80" />
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-white/50">
            Study OS · Live
          </span>
        </span>

        <span className="block p-4 sm:p-5">
          <span className="mb-4 flex items-start justify-between gap-3">
            <span>
              <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-white/40">
                Today
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                Operating Systems
              </p>
              <p className="text-sm text-slate-600 dark:text-white/50">
                Viva prep · 6 tasks left
              </p>
            </span>
            <span className="rounded-xl border border-slate-200/90 bg-slate-50 px-3 py-2 text-right dark:border-white/10 dark:bg-white/5">
              <p className="text-2xl font-bold text-brand-600 dark:text-brand-300">87%</p>
              <p className="text-[10px] text-slate-500 dark:text-white/40">Flashcards</p>
            </span>
          </span>

          <span className="grid grid-cols-2 gap-2 sm:gap-3">
            {[
              { icon: FileText, label: "Cheat sheet", value: "Ready" },
              { icon: Volume2, label: "Tamil voice", value: "Playing" },
              { icon: GraduationCap, label: "Mock viva", value: "3 left" },
              { icon: Sparkles, label: "AI summary", value: "Draft" },
            ].map((item) => (
              <span
                key={item.label}
                className="rounded-xl border border-slate-200/90 bg-slate-50/90 p-3 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04]"
              >
                <item.icon className="mb-2 h-4 w-4 text-brand-600 dark:text-brand-400" />
                <p className="text-xs text-slate-500 dark:text-white/40">{item.label}</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white/90">
                  {item.value}
                </p>
              </span>
            ))}
          </span>

          <span className="mt-4 block rounded-xl border border-brand-200/80 bg-brand-50 px-3 py-2.5 dark:border-brand-500/20 dark:bg-brand-500/10">
            <p className="text-xs text-brand-800 dark:text-brand-200/80">
              Lio-style workspace — upload PDF → AI builds your study stack
            </p>
          </span>
        </span>
      </div>
    </div>
  );
}

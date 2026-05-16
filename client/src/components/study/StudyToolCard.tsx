"use client";

import { Loader2, LucideIcon } from "lucide-react";
import clsx from "clsx";

export function StudyToolCard({
  icon: Icon,
  title,
  description,
  loading,
  disabled,
  onClick,
  accent = "brand",
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  accent?: "brand" | "violet" | "orange" | "amber" | "indigo" | "emerald" | "cyan" | "rose" | "teal";
  className?: string;
}) {
  const accentRing: Record<string, string> = {
    brand: "group-hover:border-brand-400/50 group-hover:bg-brand-500/10",
    violet: "group-hover:border-violet-400/50 group-hover:bg-violet-500/10",
    orange: "group-hover:border-orange-400/50 group-hover:bg-orange-500/10",
    amber: "group-hover:border-amber-400/50 group-hover:bg-amber-500/10",
    indigo: "group-hover:border-indigo-400/50 group-hover:bg-indigo-500/10",
    emerald: "group-hover:border-emerald-400/50 group-hover:bg-emerald-500/10",
    cyan: "group-hover:border-cyan-400/50 group-hover:bg-cyan-500/10",
    rose: "group-hover:border-rose-400/50 group-hover:bg-rose-500/10",
    teal: "group-hover:border-teal-400/50 group-hover:bg-teal-500/10",
  };

  const iconColor: Record<string, string> = {
    brand: "text-brand-600 dark:text-brand-400",
    violet: "text-violet-600 dark:text-violet-400",
    orange: "text-orange-600 dark:text-orange-400",
    amber: "text-amber-600 dark:text-amber-400",
    indigo: "text-indigo-600 dark:text-indigo-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    cyan: "text-cyan-600 dark:text-cyan-400",
    rose: "text-rose-600 dark:text-rose-400",
    teal: "text-teal-600 dark:text-teal-400",
  };

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        "study-tool-card group",
        accentRing[accent],
        className
      )}
    >
      <span
        className={clsx(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800",
          iconColor[accent]
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </span>
      <span className="min-w-0 text-left">
        <span className="block text-sm font-medium leading-snug text-fg">{title}</span>
        {description && (
          <span className="mt-0.5 block text-[11px] leading-tight text-fg-muted">
            {description}
          </span>
        )}
      </span>
    </button>
  );
}

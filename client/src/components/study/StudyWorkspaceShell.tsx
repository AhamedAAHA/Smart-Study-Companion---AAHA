"use client";

import { BookOpen } from "lucide-react";
import { BackLink } from "@/components/ui/BackLink";

export function StudyWorkspaceShell({
  documentTitle,
  backHref,
  backLabel = "Back",
  subtitle,
  children,
}: {
  documentTitle: string;
  backHref: string;
  backLabel?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="study-dashboard card !p-0 overflow-hidden">
      <header className="study-dashboard-header border-b border-slate-200/80 px-5 py-4 dark:border-slate-700/80">
        <BackLink href={backHref} label={backLabel} className="mb-3" />
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/50">
            <BookOpen className="h-5 w-5 text-brand-700 dark:text-brand-300" />
          </span>
          <div className="min-w-0">
            <h2 className="font-semibold text-fg">{subtitle || "Study workspace"}</h2>
            <p className="mt-0.5 truncate text-sm text-fg-muted">{documentTitle}</p>
          </div>
        </div>
      </header>
      <div className="space-y-5 px-5 py-5">{children}</div>
    </div>
  );
}

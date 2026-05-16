"use client";

import { Ref } from "react";
import { Sparkles } from "lucide-react";
import { BackLink } from "@/components/ui/BackLink";
import { StudyResultPanel } from "@/components/StudyResultPanel";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { StudyMaterial, VivaSession } from "@/types";

type Props = {
  resultRef: Ref<HTMLDivElement>;
  result: StudyMaterial | null;
  vivaSession?: VivaSession;
  generating: string | null;
  onUpdate: (m: StudyMaterial) => void;
  onClear: () => void;
  emptyDescription?: string;
};

export function StudyResultColumn({
  resultRef,
  result,
  vivaSession,
  generating,
  onUpdate,
  onClear,
  emptyDescription = "Pick a study tool to generate content. Results appear here.",
}: Props) {
  return (
    <div ref={resultRef} className="min-h-[200px] space-y-4 lg:sticky lg:top-24">
      {generating && (
        <div className="card border-brand-200/80 bg-brand-50/50 p-4 dark:border-brand-800/40 dark:bg-brand-950/20">
          <div className="mb-3">
            <BackLink onClick={onClear} label="Back" />
          </div>
          <div className="flex items-center gap-3">
            <Spinner />
            <p className="text-sm text-fg-secondary">
              Generating content… This usually takes a few seconds for text; audio
              may continue in the background.
            </p>
          </div>
        </div>
      )}
      {result ? (
        <StudyResultPanel
          material={result}
          vivaSession={vivaSession}
          onUpdate={onUpdate}
          onBack={onClear}
        />
      ) : !generating ? (
        <div className="card flex min-h-[200px] flex-col p-6">
          <BackLink onClick={onClear} label="Back to tools" className="mb-4 self-start" />
          <div className="flex flex-1 items-center justify-center">
            <EmptyState icon={Sparkles} title="No content yet" description={emptyDescription} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

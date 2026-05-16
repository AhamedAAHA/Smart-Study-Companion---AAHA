"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Layers,
  Volume2,
  GraduationCap,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FadeIn } from "@/components/motion/FadeIn";
import { FileUpload } from "@/components/FileUpload";
import { ExamCountdown } from "@/components/ExamCountdown";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import {
  documentStatusLabel,
  documentStatusVariant,
} from "@/lib/documentStatus";
import { DashboardData, LectureDocument } from "@/types";

export default function DashboardPage() {
  return (
    <ProtectedRoute roles={["student"]}>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, refreshUser } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await api<{ success: boolean; data: DashboardData }>(
      "/study/dashboard"
    );
    setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onUploaded = (doc: LectureDocument) => {
    load();
    window.location.href = `/documents/${doc._id}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const progress = data?.progress;

  return (
    <div className="page-shell">
      <FadeIn>
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-fg">
            Hello, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-fg-muted">
            {user?.university && `${user.university}`}
            {user?.course && ` · ${user.course}`}
          </p>
        </div>
      </FadeIn>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          label="Flashcards done"
          value={`${progress?.flashcardsCompleted || 0} / ${progress?.flashcardsTotal || 0}`}
          delay={0}
        />
        <StatCard
          icon={Clock}
          label="Study minutes (7 days)"
          value={String(progress?.studyMinutesThisWeek || 0)}
          delay={0.08}
        />
        <StatCard
          icon={Sparkles}
          label="Materials generated"
          value={String(progress?.materialsGenerated || 0)}
          delay={0.16}
        />
        <StatCard
          icon={Volume2}
          label="Voice lessons"
          value={String(data?.voiceHistory?.length || 0)}
          delay={0.24}
        />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <ExamCountdown
          initialTitle={data?.exam?.title || user?.examTitle}
          initialDate={data?.exam?.date || user?.examDate}
          onSaved={() => {
            load();
            refreshUser();
          }}
        />
        <PomodoroTimer />
      </div>

      <FadeIn delay={0.15}>
        <FileUpload onUploaded={onUploaded} />
      </FadeIn>

      <FadeIn delay={0.2}>
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-fg">
            Your lecture files
          </h2>
          {!data?.documents?.length ? (
            <p className="text-sm text-fg-muted">Upload your first PDF to get started.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {data.documents.map((doc, i) => (
                <FadeIn key={doc._id} delay={i * 0.06}>
                  <Link
                    href={`/documents/${doc._id}`}
                    className="card-interactive flex items-center gap-3"
                  >
                    <FileText className="icon-brand h-8 w-8 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-fg">{doc.title}</p>
                      <Badge
                        variant={documentStatusVariant(doc.status)}
                        className="mt-1"
                      >
                        {documentStatusLabel(doc.status)}
                      </Badge>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          )}
        </section>
      </FadeIn>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <FadeIn delay={0.1}>
          <RecentList
            title="Recent study materials"
            icon={Layers}
            items={data?.recentMaterials?.map((m) => ({
              id: m._id,
              label: m.title,
              href: `/documents/${typeof m.documentId === "object" ? m.documentId._id : m.documentId}`,
            }))}
          />
        </FadeIn>
        <FadeIn delay={0.18}>
          <RecentList
            title="Mock viva sessions"
            icon={GraduationCap}
            items={data?.vivaSessions?.map((v) => ({
              id: v._id,
              label: v.title,
              href: `/viva/${v._id}`,
            }))}
          />
        </FadeIn>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delay?: number;
}) {
  return (
    <FadeIn delay={delay}>
      <div className="card flex items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 transition-transform duration-300 hover:scale-110 dark:bg-brand-900/50">
          <Icon className="h-5 w-5 text-brand-700 dark:text-brand-300" />
        </span>
        <div>
          <p className="text-xs text-fg-muted">{label}</p>
          <p className="text-lg font-semibold text-fg">{value}</p>
        </div>
      </div>
    </FadeIn>
  );
}

function RecentList({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: { id: string; label: string; href: string }[];
}) {
  return (
    <div className="card h-full">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="icon-brand h-5 w-5" />
        <h3 className="font-semibold text-fg">{title}</h3>
      </div>
      {!items?.length ? (
        <p className="text-sm text-fg-muted">Nothing yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="text-sm text-brand-700 transition hover:translate-x-0.5 hover:underline dark:text-brand-300"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

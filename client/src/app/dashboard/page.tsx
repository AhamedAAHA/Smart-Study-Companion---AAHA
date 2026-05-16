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
import { FileUpload } from "@/components/FileUpload";
import { ExamCountdown } from "@/components/ExamCountdown";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  const progress = data?.progress;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
          Hello, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {user?.university && `${user.university}`}
          {user?.course && ` · ${user.course}`}
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          label="Flashcards done"
          value={`${progress?.flashcardsCompleted || 0} / ${progress?.flashcardsTotal || 0}`}
        />
        <StatCard
          icon={Clock}
          label="Study minutes (7 days)"
          value={String(progress?.studyMinutesThisWeek || 0)}
        />
        <StatCard
          icon={Sparkles}
          label="Materials generated"
          value={String(progress?.materialsGenerated || 0)}
        />
        <StatCard
          icon={Volume2}
          label="Voice lessons"
          value={String(data?.voiceHistory?.length || 0)}
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

      <FileUpload onUploaded={onUploaded} />

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold dark:text-slate-100">
          Your lecture files
        </h2>
        {!data?.documents?.length ? (
          <p className="text-sm text-slate-500">Upload your first PDF to get started.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.documents.map((doc) => (
              <Link
                key={doc._id}
                href={`/documents/${doc._id}`}
                className="card flex items-center gap-3 transition hover:border-brand-300 hover:shadow-md"
              >
                <FileText className="h-8 w-8 text-brand-600" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {doc.title}
                  </p>
                  <p className="text-xs capitalize text-slate-500">{doc.status}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <RecentList
          title="Recent study materials"
          icon={Layers}
          items={data?.recentMaterials?.map((m) => ({
            id: m._id,
            label: m.title,
            href: `/documents/${typeof m.documentId === "object" ? m.documentId._id : m.documentId}`,
          }))}
        />
        <RecentList
          title="Mock viva sessions"
          icon={GraduationCap}
          items={data?.vivaSessions?.map((v) => ({
            id: v._id,
            label: v.title,
            href: `/viva/${v._id}`,
          }))}
        />
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="card flex items-center gap-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/50">
        <Icon className="h-5 w-5 text-brand-700 dark:text-brand-300" />
      </span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-lg font-semibold dark:text-slate-100">{value}</p>
      </div>
    </div>
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
    <div className="card">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5 text-brand-600" />
        <h3 className="font-semibold dark:text-slate-100">{title}</h3>
      </div>
      {!items?.length ? (
        <p className="text-sm text-slate-500">Nothing yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="text-sm text-brand-700 hover:underline dark:text-brand-300"
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

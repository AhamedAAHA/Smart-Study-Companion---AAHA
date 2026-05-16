"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { api, ApiError } from "@/lib/api";
import { LectureDocument } from "@/types";
import { MarkdownContent } from "@/components/MarkdownContent";

export default function LecturerPage() {
  return (
    <ProtectedRoute roles={["lecturer", "admin"]}>
      <LecturerContent />
    </ProtectedRoute>
  );
}

function LecturerContent() {
  const [documents, setDocuments] = useState<LectureDocument[]>([]);
  const [pending, setPending] = useState<LectureDocument[]>([]);
  const [summary, setSummary] = useState("");
  const [vivaTitle, setVivaTitle] = useState("");
  const [vivaQuestions, setVivaQuestions] = useState("");
  const [message, setMessage] = useState("");

  const load = () => {
    api<{ success: boolean; data: LectureDocument[] }>("/lecturer/documents").then(
      (r) => setDocuments(r.data)
    );
    api<{ success: boolean; data: LectureDocument[] }>(
      "/lecturer/materials/pending"
    ).then((r) => setPending(r.data));
  };

  useEffect(() => {
    load();
  }, []);

  const summarize = async (id: string) => {
    const res = await api<{ success: boolean; data: { summary: string } }>(
      `/lecturer/summarize/${id}`,
      { method: "POST" }
    );
    setSummary(res.data.summary);
  };

  const approve = async (id: string) => {
    await api(`/documents/${id}/approve`, { method: "PATCH" });
    load();
    setMessage("Document approved for students.");
  };

  const createVivaSet = async (e: React.FormEvent) => {
    e.preventDefault();
    const questions = vivaQuestions
      .split("\n")
      .map((q) => q.trim())
      .filter(Boolean);
    try {
      await api("/lecturer/viva-sets", {
        method: "POST",
        body: JSON.stringify({ title: vivaTitle, questions }),
      });
      setMessage("Viva question set created.");
      setVivaTitle("");
      setVivaQuestions("");
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Failed");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-fg">Lecturer Panel</h1>
      <p className="text-fg-subtle">Review materials and create viva question sets</p>

      {message && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800 dark:bg-green-950/40 dark:text-green-300">
          {message}
        </p>
      )}

      <section className="mt-8 card">
        <h2 className="font-semibold text-fg">Create topic-based viva set</h2>
        <form onSubmit={createVivaSet} className="mt-4 space-y-3">
          <input
            className="input"
            placeholder="e.g. Process Synchronization Viva Questions"
            value={vivaTitle}
            onChange={(e) => setVivaTitle(e.target.value)}
            required
          />
          <textarea
            className="input min-h-[120px]"
            placeholder="One question per line..."
            value={vivaQuestions}
            onChange={(e) => setVivaQuestions(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">
            Create viva set
          </button>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 font-semibold text-fg">Pending approval ({pending.length})</h2>
        <div className="grid gap-3">
          {pending.map((doc) => (
            <div key={doc._id} className="card flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-fg">{doc.title}</p>
                <p className="text-xs text-fg-muted">Student upload</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-secondary !py-2"
                  onClick={() => summarize(doc._id)}
                >
                  AI Summary
                </button>
                <button
                  type="button"
                  className="btn-primary !py-2"
                  onClick={() => approve(doc._id)}
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {summary && (
        <section className="mt-8 card">
          <h2 className="mb-3 font-semibold text-fg">AI Summary Preview</h2>
          <MarkdownContent content={summary} />
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-4 font-semibold text-fg">All documents</h2>
        <ul className="space-y-2 text-sm">
          {documents.map((d) => (
            <li key={d._id} className="rounded-lg border border-slate-200 px-4 py-2 text-fg dark:border-slate-600">
              {d.title}{" "}
              <span className="text-fg-muted">
                {d.approvedByLecturer ? "· approved" : "· pending"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

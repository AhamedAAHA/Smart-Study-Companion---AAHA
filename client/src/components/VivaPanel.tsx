"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Send, Trophy } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { VivaSession } from "@/types";

export function VivaPanel({
  session: initial,
}: {
  session: VivaSession;
}) {
  const [session, setSession] = useState(initial);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const current = session.questions[session.currentIndex];
  const isDone = session.status === "completed";

  const submit = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await api<{ success: boolean; data: VivaSession }>(
        `/study/viva/${session._id}/answer`,
        {
          method: "POST",
          body: JSON.stringify({ answer }),
        }
      );
      setSession(res.data);
      setAnswer("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  const lastAnswered = session.questions[session.currentIndex - 1];

  return (
    <div className="card">
      <div className="mb-4 flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-indigo-600" />
        <h3 className="font-semibold">{session.title}</h3>
      </div>

      {lastAnswered?.feedback && (
        <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
          <p className="text-xs font-semibold text-indigo-700">Feedback</p>
          <p className="mt-1 text-sm text-indigo-900">{lastAnswered.feedback}</p>
          {lastAnswered.score != null && (
            <p className="mt-1 text-xs text-indigo-600">Score: {lastAnswered.score}/10</p>
          )}
        </div>
      )}

      {isDone ? (
        <div className="rounded-xl bg-green-50 p-6 text-center">
          <Trophy className="mx-auto h-10 w-10 text-green-600" />
          <p className="mt-2 font-semibold text-green-900">Viva complete!</p>
          <p className="mt-2 text-sm text-green-800">{session.overallFeedback}</p>
        </div>
      ) : current ? (
        <>
          <p className="text-sm font-medium text-slate-500">
            Question {session.currentIndex + 1} of {session.questions.length}
          </p>
          <p className="mt-2 text-lg font-medium text-slate-900">{current.question}</p>
          <textarea
            className="input mt-4 min-h-[100px]"
            placeholder="Type your answer (or use speech-to-text on your device)..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="btn-primary mt-3"
          >
            <Send className="h-4 w-4" />
            Submit answer
          </button>
        </>
      ) : null}

      <Link
        href={`/viva/${session._id}`}
        className="mt-4 inline-block text-sm text-brand-600 hover:underline"
      >
        Open full viva session →
      </Link>
    </div>
  );
}

"use client";

import { useState } from "react";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { McqQuestion } from "@/types";

export function McqQuiz({ questions }: { questions: McqQuestion[] }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (!questions.length) return null;

  const q = questions[index];
  const answered = selected !== null;

  const pick = (optIndex: number) => {
    if (answered) return;
    setSelected(optIndex);
    if (optIndex === q.correctIndex) setScore((s) => s + 1);
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="card text-center">
        <p className="text-lg font-semibold text-fg">Quiz complete!</p>
        <p className="mt-2 text-3xl font-bold text-brand-700 dark:text-brand-300">
          {score}/{questions.length}
        </p>
        <p className="text-sm text-fg-muted">{pct}% correct</p>
        <p className="mt-3 text-sm text-fg-subtle">
          {pct >= 70
            ? "Great work — you're exam ready on this topic!"
            : "Revise weak answers and try again."}
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-fg">
          <HelpCircle className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          MCQ Practice
        </h3>
        <span className="text-sm text-fg-muted">
          {index + 1} / {questions.length}
        </span>
      </div>

      <p className="mb-4 font-medium text-fg">
        {q.question}
      </p>

      <div className="space-y-2">
        {q.options.map((opt, i) => {
          let style =
            "border-slate-200 hover:border-brand-300 dark:border-slate-600";
          if (answered) {
            if (i === q.correctIndex) style = "border-green-500 bg-green-50 dark:bg-green-950/40";
            else if (i === selected) style = "border-red-400 bg-red-50 dark:bg-red-950/40";
            else style = "border-slate-200 opacity-60";
          } else if (selected === i) {
            style = "border-brand-500 bg-brand-50 dark:bg-brand-900/30";
          }

          return (
            <button
              key={opt}
              type="button"
              onClick={() => pick(i)}
              disabled={answered}
              className={`flex w-full items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm text-fg transition ${style}`}
            >
              {answered && i === q.correctIndex && (
                <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
              )}
              {answered && i === selected && i !== q.correctIndex && (
                <XCircle className="h-4 w-4 shrink-0 text-red-500" />
              )}
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-fg dark:bg-slate-800/80">
          <p className="font-medium text-fg-secondary">
            {selected === q.correctIndex ? "Correct!" : "Not quite"}
          </p>
          <p className="mt-1 text-fg-subtle">{q.explanation}</p>
          <button type="button" onClick={next} className="btn-primary mt-3 !py-2">
            {index + 1 >= questions.length ? "See results" : "Next question"}
          </button>
        </div>
      )}
    </div>
  );
}

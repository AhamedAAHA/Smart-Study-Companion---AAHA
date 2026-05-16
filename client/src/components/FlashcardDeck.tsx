"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, RotateCcw, Brain } from "lucide-react";
import { api } from "@/lib/api";
import { Flashcard, StudyMaterial } from "@/types";

export function FlashcardDeck({
  material,
  onUpdate,
}: {
  material: StudyMaterial;
  onUpdate: (m: StudyMaterial) => void;
}) {
  const cards = material.flashcards || [];
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [showModel, setShowModel] = useState(false);

  if (!cards.length) return null;

  const card = cards[index];

  const go = (next: number) => {
    setIndex(next);
    setFlipped(false);
    setQuizAnswer("");
    setShowModel(false);
  };

  const toggleComplete = async () => {
    if (!card._id) return;
    const res = await api<{ success: boolean; data: StudyMaterial }>(
      `/study/flashcards/${material._id}/${card._id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ completed: !card.completed }),
      }
    );
    onUpdate(res.data);
  };

  return (
    <div className="card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">Flashcards</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setQuizMode(!quizMode);
              setFlipped(false);
              setQuizAnswer("");
              setShowModel(false);
            }}
            className={`rounded-lg px-2 py-1 text-xs font-medium ${
              quizMode ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            <Brain className="mr-1 inline h-3 w-3" />
            Quiz mode
          </button>
          <span className="text-sm text-slate-500">
            {index + 1} / {cards.length}
          </span>
        </div>
      </div>

      {quizMode ? (
        <div className="min-h-[180px] rounded-xl border border-violet-200 bg-violet-50/50 p-6 dark:border-violet-800 dark:bg-violet-950/30">
          <p className="text-xs font-semibold uppercase text-violet-600">Question</p>
          <p className="mt-2 text-lg font-medium">{card.question}</p>
          <textarea
            className="input mt-4 min-h-[80px]"
            placeholder="Type your answer..."
            value={quizAnswer}
            onChange={(e) => setQuizAnswer(e.target.value)}
          />
          <button
            type="button"
            className="btn-primary mt-3 !py-2"
            onClick={() => setShowModel(true)}
          >
            Check answer
          </button>
          {showModel && (
            <div className="mt-3 rounded-lg bg-white p-3 text-sm dark:bg-slate-800">
              <p className="font-medium text-green-700">Model answer:</p>
              <p className="mt-1">{card.answer}</p>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setFlipped(!flipped)}
          className="min-h-[180px] w-full rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6 text-left shadow-sm transition hover:shadow-md dark:from-brand-950/40 dark:to-slate-900"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {flipped ? "Answer" : "Question"}
          </p>
          <p className="mt-3 text-lg font-medium text-slate-800 dark:text-slate-100">
            {flipped ? card.answer : card.question}
          </p>
          <p className="mt-4 text-xs text-slate-400">Tap to flip</p>
        </button>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-secondary !p-2"
            disabled={index === 0}
            onClick={() => go(index - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="btn-secondary !p-2"
            disabled={index >= cards.length - 1}
            onClick={() => go(index + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="btn-secondary !p-2"
            onClick={() => {
              setFlipped(false);
              setShowModel(false);
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={toggleComplete}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${
            card.completed
              ? "bg-green-100 text-green-800"
              : "bg-slate-100 text-slate-700 hover:bg-green-50"
          }`}
        >
          <Check className="h-4 w-4" />
          {card.completed ? "Completed" : "Mark completed"}
        </button>
      </div>
    </div>
  );
}

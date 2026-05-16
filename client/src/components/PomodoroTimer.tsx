"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { api } from "@/lib/api";

const PRESETS = [15, 25, 45];

export function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessionsToday, setSessionsToday] = useState(0);
  const loggedRef = useRef(false);

  const totalSeconds = minutes * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const reset = useCallback(() => {
    setRunning(false);
    setSecondsLeft(minutes * 60);
  }, [minutes]);

  useEffect(() => {
    reset();
  }, [minutes, reset]);

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [running, secondsLeft]);

  useEffect(() => {
    if (secondsLeft !== 0 || !running || loggedRef.current) return;
    loggedRef.current = true;
    setRunning(false);
    (async () => {
      await api("/study/sessions", {
        method: "POST",
        body: JSON.stringify({ minutes, label: "Pomodoro focus" }),
      });
      setSessionsToday((n) => n + 1);
    })();
  }, [secondsLeft, running, minutes]);

  useEffect(() => {
    if (secondsLeft > 0) loggedRef.current = false;
  }, [secondsLeft]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-brand-600" />
          <h3 className="font-semibold">Focus timer</h3>
        </div>
        <span className="text-xs text-slate-500">
          {sessionsToday} session{sessionsToday !== 1 ? "s" : ""} today
        </span>
      </div>

      <div className="mb-3 flex gap-2">
        {PRESETS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMinutes(m)}
            className={`rounded-lg px-3 py-1 text-xs font-medium ${
              minutes === m
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {m}m
          </button>
        ))}
      </div>

      <div className="relative mx-auto mb-4 flex h-32 w-32 items-center justify-center">
        <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-700"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            className="text-brand-500"
            strokeWidth="6"
            strokeDasharray={`${progress * 2.83} 283`}
            strokeLinecap="round"
          />
        </svg>
        <span className="font-mono text-3xl font-bold text-brand-800 dark:text-brand-200">
          {mm}:{ss}
        </span>
      </div>

      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setRunning(!running)}
          className="btn-primary !py-2"
          disabled={secondsLeft === 0}
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? "Pause" : "Start"}
        </button>
        <button type="button" onClick={reset} className="btn-secondary !p-2">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type ColorTheme = "teal" | "ocean" | "sunset" | "violet";
export type Mode = "light" | "dark";

const STORAGE_KEY = "ssc_theme_v2";

type ThemeState = { mode: Mode; color: ColorTheme };

const ThemeContext = createContext<{
  mode: Mode;
  color: ColorTheme;
  setMode: (mode: Mode) => void;
  setColor: (color: ColorTheme) => void;
  toggleMode: () => void;
} | null>(null);

function applyTheme({ mode, color }: ThemeState) {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.setAttribute("data-color", color);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeState>({ mode: "dark", color: "teal" });

  useEffect(() => {
    let initial: ThemeState = { mode: "dark", color: "teal" };

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        initial = JSON.parse(stored) as ThemeState;
      } catch {
        const legacy = localStorage.getItem("ssc_theme");
        if (legacy === "dark" || legacy === "light") {
          initial = { mode: legacy, color: "teal" };
        }
      }
    }

    setTheme(initial);
    applyTheme(initial);
  }, []);

  const persist = (next: ThemeState) => {
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    applyTheme(next);
  };

  const setMode = (mode: Mode) => persist({ ...theme, mode });
  const setColor = (color: ColorTheme) => persist({ ...theme, color });
  const toggleMode = () =>
    persist({ ...theme, mode: theme.mode === "light" ? "dark" : "light" });

  return (
    <ThemeContext.Provider value={{ ...theme, setMode, setColor, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

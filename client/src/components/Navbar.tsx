"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LogOut, LayoutDashboard, Moon, Sun } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";
import clsx from "clsx";

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const pathname = usePathname();

  const dashboardHref =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "lecturer"
        ? "/lecturer"
        : "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href={user ? dashboardHref : "/"} className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold text-brand-900 dark:text-brand-100">
            Smart Study Companion
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            className="btn-secondary !p-2"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          {user ? (
            <>
              <Link
                href={dashboardHref}
                className={clsx(
                  "hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium sm:flex",
                  pathname.includes("dashboard") ||
                    pathname.includes("admin") ||
                    pathname.includes("lecturer")
                    ? "bg-brand-50 text-brand-800"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              {user.role === "student" && (
                <Link
                  href="/library"
                  className={clsx(
                    "hidden rounded-lg px-3 py-2 text-sm font-medium sm:block",
                    pathname === "/library"
                      ? "bg-brand-50 text-brand-800"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  Library
                </Link>
              )}
              <span className="hidden text-sm text-slate-500 md:inline">
                {user.name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="btn-secondary !py-2 !px-3"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary !py-2">
                Login
              </Link>
              <Link href="/signup" className="btn-primary !py-2">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

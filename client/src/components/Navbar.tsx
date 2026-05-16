"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { ThemeSwitcher } from "./ThemeSwitcher";
import clsx from "clsx";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardHref =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "lecturer"
        ? "/lecturer"
        : "/dashboard";

  const navLinkClass = (active: boolean) =>
    clsx(
      "rounded-full px-3 py-2 text-sm font-medium transition-all",
      active
        ? "bg-brand-100 text-brand-900 dark:bg-white/10 dark:text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-white/55 dark:hover:bg-white/5 dark:hover:text-white"
    );

  const dashboardActive =
    pathname.includes("dashboard") ||
    pathname.includes("admin") ||
    pathname.includes("lecturer");

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <nav
        className="glass-nav mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-5"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="group flex min-w-0 flex-1 items-center gap-2.5 sm:flex-initial sm:max-w-[min(100%,20rem)]"
          onClick={() => setMobileOpen(false)}
          aria-label="Smart Study Companion home"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-lg shadow-brand-500/30 transition-transform duration-300 group-hover:rotate-6">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="truncate font-display text-base font-bold text-fg-on-surface-strong sm:text-lg">
            Smart Study Companion
          </span>
        </Link>

        <div className="nav-actions">
          <ThemeSwitcher />

          {user ? (
            <>
              <nav className="nav-links hidden md:flex" aria-label="Account">
                <Link
                  href={dashboardHref}
                  className={clsx("flex items-center gap-1.5", navLinkClass(dashboardActive))}
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  Dashboard
                </Link>
                {user.role === "student" && (
                  <Link
                    href="/library"
                    className={navLinkClass(pathname === "/library")}
                  >
                    Library
                  </Link>
                )}
              </nav>

              <span className="nav-divider" aria-hidden />

              <span className="nav-user" title={user.name}>
                {user.name}
              </span>

              <button
                type="button"
                onClick={logout}
                className="btn-secondary !rounded-full !px-3 !py-2"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Logout</span>
              </button>

              <button
                type="button"
                className="rounded-full p-2 text-fg-muted transition hover:bg-slate-100 dark:hover:bg-white/10 md:hidden"
                onClick={() => setMobileOpen((o) => !o)}
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary !rounded-full !py-2 !text-sm">
                Login
              </Link>
              <Link href="/signup" className="btn-primary !rounded-full !py-2 !text-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {user && mobileOpen && (
        <div className="glass-nav mx-auto mt-2 flex max-w-6xl flex-col gap-1 px-3 py-3 md:hidden">
          <Link
            href={dashboardHref}
            className={navLinkClass(dashboardActive)}
            onClick={() => setMobileOpen(false)}
          >
            Dashboard
          </Link>
          {user.role === "student" && (
            <Link
              href="/library"
              className={navLinkClass(pathname === "/library")}
              onClick={() => setMobileOpen(false)}
            >
              Library
            </Link>
          )}
          <p className="px-3 py-2 text-sm text-fg-muted">{user.name}</p>
        </div>
      )}
    </header>
  );
}

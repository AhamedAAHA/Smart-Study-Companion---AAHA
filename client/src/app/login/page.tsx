"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { ApiError } from "@/lib/api";
import { FadeIn } from "@/components/motion/FadeIn";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12">
      <FadeIn>
        <section className="card">
          <h1 className="font-display text-2xl font-bold text-fg">Welcome back</h1>
          <p className="mt-1 text-sm text-fg-muted">Sign in to continue studying</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="animate-fade-in text-sm text-danger" role="alert">
                {error}
              </p>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-fg-muted">
            No account?{" "}
            <Link
              href="/signup"
              className="font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              Sign up
            </Link>
          </p>

          <aside className="mt-6 rounded-xl bg-slate-50 p-3 text-xs text-fg-subtle dark:bg-slate-800/80">
            <p className="font-semibold text-fg">Demo accounts (run npm run seed on server):</p>
            <p className="mt-1">student@demo.lk / student123</p>
            <p>lecturer@demo.lk / lecturer123</p>
            <p>admin@demo.lk / admin123</p>
          </aside>
        </section>
      </FadeIn>
    </main>
  );
}

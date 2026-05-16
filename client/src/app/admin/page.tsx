"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { api } from "@/lib/api";
import { User } from "@/types";

interface AdminStats {
  users: { students: number; lecturers: number };
  documents: number;
  generated: {
    cheatSheets: number;
    voiceExplanations: number;
    flashcardSets: number;
    vivaSessions: number;
  };
  subjectUsage: { _id: string; count: number }[];
}

export default function AdminPage() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <AdminContent />
    </ProtectedRoute>
  );
}

function AdminContent() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    api<{ success: boolean; data: AdminStats }>("/admin/stats").then((r) =>
      setStats(r.data)
    );
    api<{ success: boolean; data: User[] }>("/admin/users").then((r) =>
      setUsers(r.data)
    );
  }, []);

  const blockUser = async (id: string) => {
    await api(`/admin/users/${id}/block`, { method: "PATCH" });
    const res = await api<{ success: boolean; data: User[] }>("/admin/users");
    setUsers(res.data);
  };

  if (!stats) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold">Admin Panel</h1>
      <p className="text-slate-600">System usage, users, and content safety</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Students" value={stats.users.students} />
        <Metric label="Lecturers" value={stats.users.lecturers} />
        <Metric label="Documents" value={stats.documents} />
        <Metric label="Cheat sheets" value={stats.generated.cheatSheets} />
        <Metric label="Voice (ElevenLabs)" value={stats.generated.voiceExplanations} />
        <Metric label="Flashcard sets" value={stats.generated.flashcardSets} />
        <Metric label="Viva sessions" value={stats.generated.vivaSessions} />
      </div>

      <section className="mt-10 card">
        <h2 className="font-semibold">Most used subjects</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {stats.subjectUsage.map((s) => (
            <li key={s._id} className="flex justify-between">
              <span>{s._id}</span>
              <span className="text-slate-500">{s.count} uploads</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 card overflow-x-auto">
        <h2 className="mb-4 font-semibold">Manage users</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="py-2">Name</th>
              <th>Email</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const id = u.id || (u as User & { _id?: string })._id || "";
              return (
              <tr key={id} className="border-b border-slate-100">
                <td className="py-2">{u.name}</td>
                <td>{u.email}</td>
                <td className="capitalize">{u.role}</td>
                <td>
                  <button
                    type="button"
                    className="text-xs text-red-600 hover:underline"
                    onClick={() => blockUser(id)}
                  >
                    Block
                  </button>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="card">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-brand-800">{value}</p>
    </div>
  );
}

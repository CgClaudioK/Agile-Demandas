"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, User as UserIcon, Users, X } from "lucide-react";
import { api, type User } from "@/lib/api";

export function UsersModal({ token, me, onClose }: { token: string; me: User; onClose: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setUsers(await api<User[]>("/users", { token }));
    } catch (err) {
      setError((err as Error).message);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function toggle(u: User) {
    const role = u.role === "ANALISTA" ? "SOLICITANTE" : "ANALISTA";
    try {
      await api(`/users/${u.id}/role`, { method: "PATCH", token, body: { role } });
      setError("");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Users className="size-5 text-emerald-600" /> Usuários e permissões
          </h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
            <X className="size-5" />
          </button>
        </header>
        {error && <p className="mx-5 mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <ul className="divide-y divide-slate-100 overflow-y-auto p-2">
          {users.map((u) => (
            <li key={u.id} className="flex items-center gap-3 p-3 text-sm">
              <span className={`rounded-full p-2 ${u.role === "ANALISTA" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                {u.role === "ANALISTA" ? <ShieldCheck className="size-4" /> : <UserIcon className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{u.name ?? u.email}</p>
                <p className="truncate text-xs text-slate-500">{u.email}</p>
              </div>
              <button
                disabled={u.id === me.id}
                onClick={() => toggle(u)}
                className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {u.role === "ANALISTA" ? "Tornar solicitante" : "Tornar analista"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

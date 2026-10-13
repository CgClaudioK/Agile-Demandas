"use client";

import { useState } from "react";
import { KanbanSquare, Lock, Mail, User as UserIcon, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export function AuthForm({ onLogin }: { onLogin: (token: string) => Promise<void> | void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await api("/auth/signup", { method: "POST", body: form });
      }
      const { token } = await api<{ token: string }>("/auth/signin", {
        method: "POST",
        body: { email: form.email, password: form.password },
      });
      await onLogin(token);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const wrap = "relative";
  const icon = "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400";
  const input =
    "w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-600 via-teal-600 to-slate-800 p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
            <KanbanSquare className="size-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Agile Demands</h1>
          <p className="text-sm text-slate-500">
            {mode === "signin" ? "Entre para gerenciar suas demandas" : "Crie sua conta de solicitante"}
          </p>
        </div>

        {mode === "signup" && (
          <div className={wrap}>
            <UserIcon className={icon} />
            <input className={input} placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
        )}
        <div className={wrap}>
          <Mail className={icon} />
          <input className={input} type="email" placeholder="E-mail" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className={wrap}>
          <Lock className={icon} />
          <input className={input} type="password" placeholder="Senha (mín. 8 caracteres)" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>

        {error && (
          <p className="flex items-center gap-2 rounded-lg bg-red-50 p-2 text-sm text-red-700">
            <AlertCircle className="size-4 shrink-0" /> {error}
          </p>
        )}

        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60">
          {loading && <Loader2 className="size-4 animate-spin" />}
          {mode === "signin" ? "Entrar" : "Criar conta"}
        </button>
        <button type="button" className="w-full text-sm text-slate-600 hover:text-emerald-700" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
          {mode === "signin" ? "Não tenho conta" : "Já tenho conta"}
        </button>
      </form>
    </div>
  );
}

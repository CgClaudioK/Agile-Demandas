"use client";

import { useEffect, useState } from "react";
import { api, type User } from "@/lib/api";
import { AuthForm } from "@/components/AuthForm";
import { Board } from "@/components/Board";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("token");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!saved) return setReady(true);
    api<User>("/auth/me", { token: saved })
      .then((u) => {
        setToken(saved);
        setUser(u);
      })
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setReady(true));
  }, []);

  async function login(t: string) {
    const u = await api<User>("/auth/me", { token: t });
    localStorage.setItem("token", t);
    setToken(t);
    setUser(u);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  if (!ready) return null;
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      {token && user ? <Board token={token} user={user} onLogout={logout} /> : <AuthForm onLogin={login} />}
    </main>
  );
}
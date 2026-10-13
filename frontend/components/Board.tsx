"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle, ArrowDownUp, Building2, Calendar, CheckCircle2, CircleDot, Flag, Inbox, KanbanSquare,
  LogOut, MessageSquare, Pencil, Plus, Search, ShieldCheck, Trash2, User as UserIcon, Users, XCircle, type LucideIcon,
} from "lucide-react";
import { api, PRIORITY_LABEL, STATUS_LABEL, type Demand, type Priority, type Status, type Summary, type User } from "@/lib/api";
import { DemandDetail } from "@/components/DemandDetail";
import { UsersModal } from "@/components/UsersModal";
import { ConfirmModal } from "@/components/ConfirmModal";

const COLUMNS: Status[] = ["ABERTA", "EM_ANALISE", "APROVADA", "REJEITADA"];

const COLUMN_STYLE: Record<Status, { icon: LucideIcon; head: string; bg: string }> = {
  ABERTA: { icon: Inbox, head: "text-sky-700", bg: "bg-sky-50" },
  EM_ANALISE: { icon: Search, head: "text-amber-700", bg: "bg-amber-50" },
  APROVADA: { icon: CheckCircle2, head: "text-emerald-700", bg: "bg-emerald-50" },
  REJEITADA: { icon: XCircle, head: "text-red-700", bg: "bg-red-50" },
};

const BADGE: Record<Priority, string> = {
  ALTA: "bg-red-100 text-red-700",
  MEDIA: "bg-amber-100 text-amber-700",
  BAIXA: "bg-sky-100 text-sky-700",
};

export function Board({ token, user, onLogout }: { token: string; user: User; onLogout: () => void }) {
  const isAnalyst = user.role === "ANALISTA";
  const [demands, setDemands] = useState<Demand[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [filters, setFilters] = useState({ search: "", status: "", priority: "", order: "desc" });
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Partial<Demand> | null>(null);
  const [deciding, setDeciding] = useState<{ demand: Demand; status: Status } | null>(null);
  const [detail, setDetail] = useState<Demand | null>(null);
  const [comment, setComment] = useState("");
  const [showUsers, setShowUsers] = useState(false);
  const [deleting, setDeleting] = useState<Demand | null>(null);

  const load = useCallback(async () => {
    const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
    try {
      const [list, sum] = await Promise.all([
        api<Demand[]>(`/demands?${qs}`, { token }),
        api<Summary>("/dashboard", { token }),
      ]);
      setDemands(list);
      setSummary(sum);
      setError("");
    } catch (err) {
      setError((err as Error).message);
    }
  }, [filters, token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function run(action: () => Promise<unknown>) {
    try {
      await action();
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function drop(e: React.DragEvent, status: Status) {
    const id = Number(e.dataTransfer.getData("id"));
    const demand = demands.find((d) => d.id === id);
    if (!demand || demand.status === status || !isAnalyst) return;
    if (status === "ABERTA") return setError("Uma demanda não volta para Aberta.");
    if (status === "EM_ANALISE") return run(() => api(`/demands/${id}/decision`, { method: "PATCH", token, body: { status } }));
    setComment("");
    setDeciding({ demand, status });
  }

  function saveDemand(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const { title, description, area, priority } = editing;
    const body = { title, description, area, priority: priority ?? "MEDIA" };
    run(() =>
      editing.id
        ? api(`/demands/${editing.id}`, { method: "PATCH", token, body })
        : api("/demands", { method: "POST", token, body }),
    );
    setEditing(null);
  }

  const field = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200";
  const label = "flex flex-col gap-1 text-xs font-medium text-slate-500";
  const control = "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200";

  const cards: { label: string; value: number; icon: LucideIcon; color: string }[] = summary
    ? [
        { label: "Total", value: summary.total, icon: KanbanSquare, color: "bg-slate-100 text-slate-700" },
        { label: "Abertas", value: summary.abertas, icon: Inbox, color: "bg-sky-100 text-sky-700" },
        { label: "Em análise", value: summary.emAnalise, icon: Search, color: "bg-amber-100 text-amber-700" },
        { label: "Aprovadas", value: summary.aprovadas, icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" },
        { label: "Rejeitadas", value: summary.rejeitadas, icon: XCircle, color: "bg-red-100 text-red-700" },
        { label: "Prioridade alta", value: summary.porPrioridade.alta, icon: Flag, color: "bg-red-100 text-red-700" },
        { label: "Prioridade média", value: summary.porPrioridade.media, icon: Flag, color: "bg-amber-100 text-amber-700" },
        { label: "Prioridade baixa", value: summary.porPrioridade.baixa, icon: Flag, color: "bg-sky-100 text-sky-700" },
      ]
    : [];

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <h1 className="flex items-center gap-2 text-lg font-bold">
            <KanbanSquare className="size-6" /> Agile Demands
          </h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
              {isAnalyst ? <ShieldCheck className="size-4" /> : <UserIcon className="size-4" />}
              {user.name ?? user.email} · {isAnalyst ? "Analista" : "Solicitante"}
            </span>
            {isAnalyst && (
              <button className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 font-medium transition hover:bg-white/25" onClick={() => setShowUsers(true)}>
                <Users className="size-4" /> Usuários
              </button>
            )}
            <button className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 font-medium transition hover:bg-white/25" onClick={onLogout}>
              <LogOut className="size-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-5 p-4">
        {cards.length > 0 && (
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
            {cards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                <span className={`rounded-lg p-2 ${color}`}><Icon className="size-4" /></span>
                <div>
                  <div className="text-xl font-bold leading-none">{value}</div>
                  <div className="mt-1 text-[11px] leading-tight text-slate-500">{label}</div>
                </div>
              </div>
            ))}
          </section>
        )}

        <section className="flex flex-col gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 lg:flex-row lg:items-end">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className={label}>
              Busca
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input className={`${control} pl-9`} placeholder="Título, descrição ou área" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
              </span>
            </label>
            <label className={label}>
              Status
              <select className={control} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">Todos</option>
                {COLUMNS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </label>
            <label className={label}>
              Prioridade
              <select className={control} value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
                <option value="">Todas</option>
                {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
              </select>
            </label>
            <label className={label}>
              Ordenação
              <span className="relative block">
                <ArrowDownUp className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <select className={`${control} pl-9`} value={filters.order} onChange={(e) => setFilters({ ...filters, order: e.target.value })}>
                  <option value="desc">Mais recentes</option>
                  <option value="asc">Mais antigas</option>
                </select>
              </span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            {(filters.search || filters.status || filters.priority) && (
              <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100" onClick={() => setFilters({ search: "", status: "", priority: "", order: filters.order })}>
                <XCircle className="size-4" /> Limpar
              </button>
            )}
            <button className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700" onClick={() => setEditing({ priority: "MEDIA" })}>
              <Plus className="size-4" /> Nova demanda
            </button>
          </div>
        </section>
        {error && (
          <p className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="size-4" /> {error}
          </p>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((status) => {
            const { icon: ColIcon, head, bg } = COLUMN_STYLE[status];
            const items = demands.filter((d) => d.status === status);
            return (
              <div key={status} className={`min-h-48 rounded-xl p-3 ring-1 ring-slate-200 ${bg}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => drop(e, status)}>
                <h2 className={`mb-3 flex items-center gap-2 text-sm font-semibold ${head}`}>
                  <ColIcon className="size-4" /> {STATUS_LABEL[status]}
                  <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs text-slate-600">{items.length}</span>
                </h2>
                <div className="max-h-[52rem] space-y-3 overflow-y-auto pr-1">
                  {items.map((d) => (
                    <article key={d.id} draggable={isAnalyst} onDragStart={(e) => e.dataTransfer.setData("id", String(d.id))} className="space-y-2 rounded-lg bg-white p-3 text-sm shadow-sm ring-1 ring-slate-200 transition hover:shadow-md">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-slate-900">{d.title}</h3>
                        <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${BADGE[d.priority]}`}>
                          <Flag className="size-3" /> {PRIORITY_LABEL[d.priority]}
                        </span>
                      </div>
                      <p className="line-clamp-3 text-slate-600">{d.description}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><UserIcon className="size-3" /> {d.requester}</span>
                        <span className="flex items-center gap-1"><Building2 className="size-3" /> {d.area}</span>
                        <span className="flex items-center gap-1"><Calendar className="size-3" /> {new Date(d.createdAt).toLocaleDateString("pt-BR")}</span>
                      </div>
                      {d.decisionComment && (
                        <p className="rounded-md bg-slate-50 p-2 text-xs text-slate-700">
                          <CircleDot className="mr-1 inline size-3" />{d.decisionComment}
                          {d.decidedAt && <span className="block text-slate-400">{new Date(d.decidedAt).toLocaleDateString("pt-BR")}</span>}
                        </p>
                      )}
                      <div className="flex items-center gap-3 border-t border-slate-100 pt-2 text-xs">
                        <button className="flex items-center gap-1 text-violet-600 hover:underline" onClick={() => setDetail(d)}>
                          <MessageSquare className="size-3.5" /> Histórico
                        </button>
                        {(isAnalyst || d.status === "ABERTA") && (
                          <>
                            <button className="flex items-center gap-1 text-slate-600 hover:underline" onClick={() => setEditing(d)}>
                              <Pencil className="size-3.5" /> Editar
                            </button>
                            <button className="flex items-center gap-1 text-red-600 hover:underline" onClick={() => setDeleting(d)}>
                              <Trash2 className="size-3.5" /> Excluir
                            </button>
                          </>
                        )}
                      </div>
                    </article>
                  ))}
                  {items.length === 0 && <p className="py-6 text-center text-xs text-slate-400">Nenhuma demanda</p>}
                </div>
              </div>
            );
          })}
        </section>
        {isAnalyst && <p className="text-xs text-slate-500">Arraste os cartões entre colunas para analisar, aprovar ou rejeitar.</p>}
      </div>

      {deleting && (
        <ConfirmModal
          title="Excluir demanda?"
          message={`"${deleting.title}" será removida permanentemente.`}
          confirmLabel="Excluir"
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            const id = deleting.id;
            setDeleting(null);
            run(() => api(`/demands/${id}`, { method: "DELETE", token }));
          }}
        />
      )}
      {showUsers && <UsersModal token={token} me={user} onClose={() => setShowUsers(false)} />}
      {detail && <DemandDetail demand={detail} token={token} onClose={() => setDetail(null)} />}

      {editing && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={saveDemand} className="w-full max-w-md space-y-3 rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold">{editing.id ? "Editar demanda" : "Nova demanda"}</h2>
            <input className={field} placeholder="Título" required minLength={3} value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <textarea className={field} rows={4} placeholder="Descrição" required minLength={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            <input className={field} placeholder="Área solicitante" required minLength={2} value={editing.area ?? ""} onChange={(e) => setEditing({ ...editing, area: e.target.value })} />
            {(isAnalyst || !editing.id) && (
              <select className={field} value={editing.priority ?? "MEDIA"} onChange={(e) => setEditing({ ...editing, priority: e.target.value as Priority })}>
                {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => <option key={p} value={p}>Prioridade {PRIORITY_LABEL[p]}</option>)}
              </select>
            )}
            <div className="flex justify-end gap-2 text-sm">
              <button type="button" className="rounded-lg px-4 py-2 hover:bg-slate-100" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {deciding && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
          <form
            className="w-full max-w-md space-y-3 rounded-2xl bg-white p-6 shadow-2xl"
            onSubmit={(e) => {
              e.preventDefault();
              const { demand, status } = deciding;
              run(() => api(`/demands/${demand.id}/decision`, { method: "PATCH", token, body: { status, comment } }));
              setDeciding(null);
            }}
          >
            <h2 className="text-lg font-semibold">{STATUS_LABEL[deciding.status]}: {deciding.demand.title}</h2>
            <textarea className={field} rows={3} placeholder="Comentário da decisão" required minLength={3} value={comment} onChange={(e) => setComment(e.target.value)} />
            <div className="flex justify-end gap-2 text-sm">
              <button type="button" className="rounded-lg px-4 py-2 hover:bg-slate-100" onClick={() => setDeciding(null)}>Cancelar</button>
              <button className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">Confirmar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

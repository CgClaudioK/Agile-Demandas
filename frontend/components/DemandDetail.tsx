"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Flag, MessageSquare, Pencil, PlusCircle, Send, X, XCircle, Search as SearchIcon } from "lucide-react";
import { api, PRIORITY_LABEL, STATUS_LABEL, type Demand, type DemandEvent } from "@/lib/api";

function formatEditMessage(msg: string | null | undefined): string {
  if (!msg) return "Detalhes da demanda foram atualizados.";

  // Compatibilidade com eventos legados gravados como lista de campos em inglês
  const fieldDict: Record<string, string> = {
    title: "Título",
    description: "Descrição",
    area: "Área",
    priority: "Prioridade",
  };

  const rawKeys = msg.split(",").map((k) => k.trim());
  const isLegacy = rawKeys.every((k) => k in fieldDict);

  if (isLegacy) {
    const translated = rawKeys.map((k) => fieldDict[k]);
    return `Campos alterados: ${translated.join(", ")}`;
  }

  return msg;
}

function eventView(e: DemandEvent) {
  switch (e.type) {
    case "CRIADA":
      return { icon: PlusCircle, color: "bg-sky-100 text-sky-700", text: "criou a demanda" };
    case "EDITADA":
      return { icon: Pencil, color: "bg-slate-100 text-slate-600", text: "editou a demanda" };
    case "COMENTARIO":
      return { icon: MessageSquare, color: "bg-violet-100 text-violet-700", text: "comentou" };
    default:
      if (e.toStatus === "APROVADA") return { icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700", text: "aprovou" };
      if (e.toStatus === "REJEITADA") return { icon: XCircle, color: "bg-red-100 text-red-700", text: "rejeitou" };
      return { icon: SearchIcon, color: "bg-amber-100 text-amber-700", text: `mudou para ${e.toStatus ? STATUS_LABEL[e.toStatus] : "novo status"}` };
  }
}

export function DemandDetail({ demand, token, onClose }: { demand: Demand; token: string; onClose: () => void }) {
  const [events, setEvents] = useState<DemandEvent[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setEvents(await api<DemandEvent[]>(`/demands/${demand.id}/history`, { token }));
    } catch (err) {
      setError((err as Error).message);
    }
  }, [demand.id, token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      setEvents(await api<DemandEvent[]>(`/demands/${demand.id}/comments`, { method: "POST", token, body: { message } }));
      setMessage("");
      setError("");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-black/40" onClick={onClose}>
      <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{demand.title}</h2>
            <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <Flag className="size-3.5" /> {PRIORITY_LABEL[demand.priority]} · {STATUS_LABEL[demand.status]} · {demand.area}
            </p>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
            <X className="size-5" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <p className="text-sm text-slate-700">{demand.description}</p>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Histórico</h3>
          <ol className="space-y-4">
            {events.map((ev) => {
              const v = eventView(ev);
              const Icon = v.icon;
              return (
                <li key={ev.id} className="flex gap-3">
                  <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${v.color}`}>
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 text-sm">
                    <p>
                      <strong>{ev.authorName}</strong> {v.text}
                    </p>
                    {ev.message && (
                      <p className="mt-1 whitespace-pre-line break-words rounded-lg bg-slate-50 p-2 text-xs text-slate-700 ring-1 ring-slate-200/60">
                        {ev.type === "EDITADA" ? formatEditMessage(ev.message) : ev.message}
                      </p>
                    )}
                    <time className="text-xs text-slate-400">{new Date(ev.createdAt).toLocaleString("pt-BR")}</time>
                  </div>
                </li>
              );
            })}
            {events.length === 0 && <li className="text-sm text-slate-400">Sem eventos ainda.</li>}
          </ol>
        </div>

        <form onSubmit={send} className="space-y-2 border-t border-slate-200 p-4">
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="Adicionar comentário..."
              maxLength={1000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-700">
              <Send className="size-4" /> Enviar
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

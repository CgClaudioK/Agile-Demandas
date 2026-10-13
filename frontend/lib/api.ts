export type Priority = "BAIXA" | "MEDIA" | "ALTA";
export type Status = "ABERTA" | "EM_ANALISE" | "APROVADA" | "REJEITADA";

export interface Demand {
  id: number;
  title: string;
  description: string;
  requester: string;
  area: string;
  priority: Priority;
  status: Status;
  decisionComment: string | null;
  decidedAt: string | null;
  createdAt: string;
  createdById: number;
}

export interface DemandEvent {
  id: number;
  demandId: number;
  type: "CRIADA" | "EDITADA" | "STATUS" | "COMENTARIO";
  authorName: string;
  message: string | null;
  toStatus: Status | null;
  createdAt: string;
}

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: "SOLICITANTE" | "ANALISTA";
}

export interface Summary {
  total: number;
  abertas: number;
  emAnalise: number;
  aprovadas: number;
  rejeitadas: number;
  porPrioridade: { baixa: number; media: number; alta: number };
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function api<T>(path: string, options: { method?: string; body?: unknown; token?: string } = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: "Bearer " + options.token } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = Array.isArray(err.message) ? err.message.join(", ") : err.message;
    throw new Error(msg ?? `Erro ${res.status}`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const STATUS_LABEL: Record<Status, string> = {
  ABERTA: "Aberta",
  EM_ANALISE: "Em análise",
  APROVADA: "Aprovada",
  REJEITADA: "Rejeitada",
};

export const PRIORITY_LABEL: Record<Priority, string> = { BAIXA: "Baixa", MEDIA: "Média", ALTA: "Alta" };

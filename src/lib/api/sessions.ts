import type {
  Session,
  SessionWithClient,
  SessionNote,
} from "@/lib/types/database.types";
import type {
  CreateSessionInput,
  UpdateSessionInput,
  SessionNoteInput,
} from "@/lib/schemas/session.schema";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export function fetchSessions(filters?: {
  client_id?: string;
  status?: string;
  from?: string;
  to?: string;
}): Promise<SessionWithClient[]> {
  const params = new URLSearchParams();
  if (filters?.client_id) params.set("client_id", filters.client_id);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.from) params.set("from", filters.from);
  if (filters?.to) params.set("to", filters.to);
  const qs = params.toString();
  return apiFetch(`/api/sessions${qs ? `?${qs}` : ""}`);
}

export function fetchSession(id: string): Promise<SessionWithClient> {
  return apiFetch(`/api/sessions/${id}`);
}

export function createSession(data: CreateSessionInput): Promise<Session> {
  return apiFetch("/api/sessions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateSession(
  id: string,
  data: UpdateSessionInput
): Promise<Session> {
  return apiFetch(`/api/sessions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function fetchSessionNotes(
  sessionId: string
): Promise<SessionNote | null> {
  return apiFetch(`/api/sessions/${sessionId}/notes`);
}

export function upsertSessionNote(
  sessionId: string,
  data: SessionNoteInput
): Promise<SessionNote> {
  return apiFetch(`/api/sessions/${sessionId}/notes`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function fetchTodaySessions(): Promise<SessionWithClient[]> {
  const today = new Date();
  const from = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).toISOString();
  const to = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59,
    999
  ).toISOString();

  return fetchSessions({ from, to });
}

export function fetchUpcomingSessions(
  limit = 5
): Promise<SessionWithClient[]> {
  const params = new URLSearchParams({
    from: new Date().toISOString(),
    status: "scheduled",
  });
  return apiFetch(`/api/sessions?${params.toString()}`);
}

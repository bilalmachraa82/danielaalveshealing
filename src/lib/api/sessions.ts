import type {
  Client,
  PaginatedResponse,
  Session,
  SessionWithClient,
  SessionNote,
} from "@/lib/types/database.types";
import type {
  CreateSessionInput,
  UpdateSessionInput,
  SessionNoteInput,
  ManageSessionActionInput,
} from "@/lib/schemas/session.schema";
import { getAuthHeaders } from "./auth-headers";

export interface ManageSessionState {
  canConfirm: boolean;
  canReschedule: boolean;
  canCancel: boolean;
  isClosed: boolean;
  blockingReason: "status_closed" | "session_started" | "notice_period" | null;
}

export interface ManagedSessionResponse {
  session: Pick<
    Session,
    | "id"
    | "scheduled_at"
    | "duration_minutes"
    | "service_type"
    | "status"
    | "notes"
    | "cancellation_reason"
    | "reschedule_reason"
    | "client_confirmed_at"
    | "manage_token_expires_at"
  >;
  client: Pick<
    Client,
    | "id"
    | "first_name"
    | "last_name"
    | "email"
    | "phone"
    | "preferred_language"
    | "preferred_channel"
    | "gender"
  >;
  manage_state: ManageSessionState;
  manage_url: string | null;
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options?.headers ?? {}) },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export async function fetchSessions(filters?: {
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
  const result = await apiFetch<PaginatedResponse<SessionWithClient>>(`/api/sessions${qs ? `?${qs}` : ""}`);
  return result.data;
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

export function fetchManagedSession(
  token: string
): Promise<ManagedSessionResponse> {
  return apiFetch(`/api/sessions/manage/${token}`);
}

export function submitManagedSessionAction(
  token: string,
  data: ManageSessionActionInput
): Promise<ManagedSessionResponse> {
  return apiFetch(`/api/sessions/manage/${token}`, {
    method: "POST",
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

export async function fetchUpcomingSessions(
  limit = 5
): Promise<SessionWithClient[]> {
  const params = new URLSearchParams({
    from: new Date().toISOString(),
    status: "scheduled",
    limit: String(limit),
  });
  const result = await apiFetch<PaginatedResponse<SessionWithClient>>(`/api/sessions?${params.toString()}`);
  return result.data;
}

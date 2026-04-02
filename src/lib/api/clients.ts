import type { Client, ClientTimelineEvent, PaginatedResponse, Tag } from "@/lib/types/database.types";
import type { CreateClientInput, UpdateClientInput } from "@/lib/schemas/client.schema";
import { getAuthHeaders } from "./auth-headers";

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

export async function fetchClients(filters?: {
  status?: string;
  search?: string;
}): Promise<Client[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.search) params.set("search", filters.search);
  const qs = params.toString();
  const result = await apiFetch<PaginatedResponse<Client>>(`/api/clients${qs ? `?${qs}` : ""}`);
  return result.data;
}

export function fetchClient(id: string): Promise<Client> {
  return apiFetch(`/api/clients/${id}`);
}

export function fetchClientTimeline(
  clientId: string
): Promise<ClientTimelineEvent[]> {
  return apiFetch(`/api/clients/${clientId}/timeline`);
}

export function createClient(data: CreateClientInput): Promise<Client> {
  return apiFetch("/api/clients", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateClient(
  id: string,
  data: UpdateClientInput
): Promise<Client> {
  return apiFetch(`/api/clients/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteClient(id: string): Promise<void> {
  return apiFetch(`/api/clients/${id}`, { method: "DELETE" });
}

export function fetchClientTags(clientId: string): Promise<Tag[]> {
  return apiFetch(`/api/clients/${clientId}/tags`);
}

export function addClientTag(
  clientId: string,
  tagId: string
): Promise<void> {
  return apiFetch(`/api/clients/${clientId}/tags`, {
    method: "POST",
    body: JSON.stringify({ tag_id: tagId }),
  });
}

export function removeClientTag(
  clientId: string,
  tagId: string
): Promise<void> {
  return apiFetch(`/api/clients/${clientId}/tags/${tagId}`, {
    method: "DELETE",
  });
}

export function fetchTags(): Promise<Tag[]> {
  return apiFetch("/api/tags");
}

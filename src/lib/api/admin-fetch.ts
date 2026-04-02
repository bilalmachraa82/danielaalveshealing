import { DEFAULT_CONFIG } from "@/lib/config/therapist";

export const ADMIN_AUTH_KEY = `${DEFAULT_CONFIG.localStoragePrefix}-auth`;
export const ADMIN_UNAUTHORIZED_EVENT = "daniela-crm:admin-unauthorized";

export interface StoredAdminAuth {
  id: string;
  email: string;
  name: string;
  token?: string | null;
}

export class AdminUnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AdminUnauthorizedError";
  }
}

export function readStoredAdminAuth(): StoredAdminAuth | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(ADMIN_AUTH_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredAdminAuth;
  } catch {
    window.localStorage.removeItem(ADMIN_AUTH_KEY);
    return null;
  }
}

export function clearStoredAdminAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_AUTH_KEY);
}

export function getAuthHeaders(): HeadersInit {
  const auth = readStoredAdminAuth();
  return auth?.token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      }
    : { "Content-Type": "application/json" };
}

export function notifyAdminUnauthorized() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ADMIN_UNAUTHORIZED_EVENT));
}

export async function adminFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options?.headers ?? {}) },
  });

  if (response.status === 401) {
    notifyAdminUnauthorized();
    throw new AdminUnauthorizedError("Unauthorized");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

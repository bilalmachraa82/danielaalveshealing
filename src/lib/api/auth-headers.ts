import { DEFAULT_CONFIG } from "@/lib/config/therapist";

const AUTH_KEY = `${DEFAULT_CONFIG.localStoragePrefix}-auth`;

export function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  const stored = localStorage.getItem(AUTH_KEY);
  if (!stored) return { "Content-Type": "application/json" };
  try {
    const { token } = JSON.parse(stored);
    if (token) {
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
    }
  } catch {
    // Invalid stored data
  }
  return { "Content-Type": "application/json" };
}

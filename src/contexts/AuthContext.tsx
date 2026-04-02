import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  ADMIN_AUTH_KEY,
  ADMIN_UNAUTHORIZED_EVENT,
  clearStoredAdminAuth,
  readStoredAdminAuth,
  type StoredAdminAuth,
} from "@/lib/api/admin-fetch";

type User = StoredAdminAuth;

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncFromStorage = () => {
      setUser(readStoredAdminAuth());
      setIsLoading(false);
    };

    const handleUnauthorized = () => {
      clearStoredAdminAuth();
      setUser(null);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === ADMIN_AUTH_KEY) {
        syncFromStorage();
      }
    };

    syncFromStorage();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(ADMIN_UNAUTHORIZED_EVENT, handleUnauthorized);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(ADMIN_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  async function login(email: string, password: string) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error((body as { error?: string }).error ?? "Credenciais inválidas");
    }

    const userData = (await response.json()) as User;
    setUser(userData);
    localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(userData));
  }

  function logout() {
    setUser(null);
    clearStoredAdminAuth();
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

import { useState, useEffect, useCallback } from "react";

export interface AuthUser {
  name: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);

  const read = useCallback(() => {
    try {
      const raw = localStorage.getItem("medily_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
        return;
      }
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  useEffect(() => {
    read();
    const handler = () => read();
    window.addEventListener("storage", handler);
    window.addEventListener("medily_auth_change", handler as EventListener);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("medily_auth_change", handler as EventListener);
    };
  }, [read]);

  const signOut = useCallback(() => {
    localStorage.removeItem("medily_user");
    setUser(null);
    window.dispatchEvent(new Event("medily_auth_change"));
  }, []);

  return { user, signOut };
}

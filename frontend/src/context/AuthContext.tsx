import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getMe, type UserProfile } from "../services/authService";
import { registerUnauthorizedHandler } from "../utils/authEvents";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  }, []);

  const handleSessionExpiry = useCallback(
    (message?: string) => {
      clearAuth();
      localStorage.setItem(
        "session_expired_message",
        message || "Session expired. Please log in again."
      );
    },
    [clearAuth]
  );

  const hydrateAuth = useCallback(async (nextToken: string) => {
    const profile = await getMe(nextToken);
    localStorage.setItem("token", nextToken);
    setToken(nextToken);
    setUser(profile);
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(handleSessionExpiry);

    return () => {
      registerUnauthorizedHandler(null);
    };
  }, [handleSessionExpiry]);

  useEffect(() => {
    let active = true;

    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        if (active) setLoading(false);
        return;
      }

      try {
        const profile = await getMe(storedToken);
        if (!active) return;
        setToken(storedToken);
        setUser(profile);
      } catch {
        if (!active) return;
        clearAuth();
      } finally {
        if (active) setLoading(false);
      }
    };

    void initAuth();

    return () => {
      active = false;
    };
  }, [clearAuth]);

  const login = useCallback(async (nextToken: string) => {
    setLoading(true);

    try {
      await hydrateAuth(nextToken);
    } catch {
      clearAuth();
      throw new Error("Authentication failed");
    } finally {
      setLoading(false);
    }
  }, [clearAuth, hydrateAuth]);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const value = useMemo(
    () => ({ user, token, loading, login, logout }),
    [user, token, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

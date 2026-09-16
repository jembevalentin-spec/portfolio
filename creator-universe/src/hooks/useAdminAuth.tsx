import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getAdminProfile, getSession, signInWithPassword, signOut, supabaseConfigured } from "../lib/supabase";

interface AdminAuthContextValue {
  isAuthenticated: boolean;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  adminEmail: string;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);
export const ADMIN_EMAIL = "jembevalentin@gmail.com";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!supabaseConfigured) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const session = await getSession();
        if (!session) {
          if (!cancelled) setIsAuthenticated(false);
          return;
        }
        const profile = await getAdminProfile();
        if (!cancelled) setIsAuthenticated(Boolean(profile));
      } catch {
        if (!cancelled) setIsAuthenticated(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const login = async (email: string, password: string) => {
    setError("");
    if (!supabaseConfigured) {
      setError("Supabase is not configured. Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return false;
    }
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      setError("Only the authorized Jembe administrator can sign in here.");
      return false;
    }
    try {
      await signInWithPassword(email.trim(), password);
      const profile = await getAdminProfile();
      if (!profile) {
        await signOut();
        setError("This account is not authorized as the Jembe administrator.");
        return false;
      }
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
      return false;
    }
  };

  const logout = async () => {
    await signOut();
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, loading, error, login, logout, adminEmail: ADMIN_EMAIL }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}

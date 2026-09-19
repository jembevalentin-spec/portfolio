const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
const SESSION_KEY = "jembe-supabase-session-v1";

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type?: string;
  user: {
    id: string;
    email?: string;
  };
}

function readStoredSession(): SupabaseSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SupabaseSession) : null;
  } catch {
    return null;
  }
}

function storeSession(session: SupabaseSession | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

async function authRequest(path: string, body: Record<string, unknown>) {
  if (!supabaseConfigured) throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.msg || data.error_description || data.message || "Supabase authentication failed.");
  return data;
}

export async function signInWithPassword(email: string, password: string) {
  const session = (await authRequest("token?grant_type=password", { email, password })) as SupabaseSession;
  storeSession(session);
  return session;
}

export async function signOut() {
  const session = readStoredSession();
  try {
    if (session && supabaseConfigured) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
        },
      });
    }
  } finally {
    storeSession(null);
  }
}

async function refreshSession(session: SupabaseSession) {
  const refreshed = (await authRequest("token?grant_type=refresh_token", { refresh_token: session.refresh_token })) as SupabaseSession;
  storeSession(refreshed);
  return refreshed;
}

export async function getSession() {
  let session = readStoredSession();
  if (!session) return null;
  if (session.expires_at && session.expires_at * 1000 > Date.now() + 60_000) return session;
  try {
    session = await refreshSession(session);
    return session;
  } catch {
    storeSession(null);
    return null;
  }
}

function buildHeaders(token?: string, extra: Record<string, string> = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
    ...extra,
  };
}

export async function restFetch<T = unknown>(table: string, options: {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  query?: string;
  body?: unknown;
  auth?: boolean;
  prefer?: string;
} = {}): Promise<T> {
  if (!supabaseConfigured) throw new Error("Supabase is not configured.");
  const session = options.auth ? await getSession() : null;
  if (options.auth && !session) throw new Error("Your admin session has expired. Please sign in again.");

  const query = options.query ? `?${options.query}` : "";
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    method: options.method || "GET",
    headers: buildHeaders(session?.access_token, options.prefer ? { Prefer: options.prefer } : {}),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.message || data?.hint || data?.error || `Supabase request failed (${response.status}).`);
  }
  return data as T;
}

export async function getAdminProfile() {
  const session = await getSession();
  if (!session?.user?.id) return null;
  const rows = await restFetch<Array<{ id: string; email: string; role: string }>>("profiles", {
    query: `id=eq.${encodeURIComponent(session.user.id)}&select=id,email,role`,
    auth: true,
  });
  const profile = rows[0];
  return profile?.role === "admin" && profile.email.toLowerCase() === "jembevalentin@gmail.com" ? profile : null;
}

export async function uploadPublicFile(bucket: string, file: File, folder: string) {
  const session = await getSession();
  if (!session) throw new Error("Admin sign-in required for uploads.");
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "false",
    },
    body: file,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || data?.error || "Upload failed.");
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

export function getSupabaseUrl() {
  return SUPABASE_URL;
}

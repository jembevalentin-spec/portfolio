import { useState } from "react";
import { Navigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAdminAuth } from "../../hooks/useAdminAuth";

export default function AdminLogin() {
  const { login, isAuthenticated, loading, error, adminEmail } = useAdminAuth();
  const [email, setEmail] = useState(adminEmail);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await login(email, password);
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-md border border-stroke rounded-3xl p-8 bg-surface shadow-2xl">
        <div className="w-12 h-12 rounded-2xl accent-gradient flex items-center justify-center mb-6">
          <ShieldCheck size={22} className="text-bg" />
        </div>
        <p className="text-xs uppercase tracking-[.25em] text-muted">Jembe control room</p>
        <h1 className="font-display text-4xl mt-2">Sign in</h1>
        <p className="text-sm text-muted mt-3 mb-8">Manage the live website from <code>/admin</code>.</p>
        <label className="block text-xs text-muted mb-2">Admin email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="focus-ring w-full rounded-lg bg-bg border border-stroke px-3 py-2.5 text-sm" />
        <label className="block text-xs text-muted mt-5 mb-2">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="focus-ring w-full rounded-lg bg-bg border border-stroke px-3 py-2.5 text-sm" placeholder="Your Supabase password" required />
        {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
        <button disabled={busy || loading} className="focus-ring mt-6 w-full bg-ink text-bg rounded-xl py-3 text-sm font-medium disabled:opacity-50">
          {busy ? "Signing in…" : "Enter admin"}
        </button>
        <p className="text-[11px] text-muted/70 mt-5">Authorized administrator: {adminEmail}</p>
      </form>
    </div>
  );
}

import type { ReactNode } from "react";
import { Navigate, NavLink } from "react-router-dom";
import { LayoutDashboard, Package, FolderKanban, FileText, LogOut } from "lucide-react";
import { useAdminAuth } from "../hooks/useAdminAuth";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/content", label: "Site content", icon: FileText },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, logout } = useAdminAuth();

  if (loading) return <div className="min-h-screen bg-bg text-ink flex items-center justify-center text-sm text-muted">Loading Jembe admin…</div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-bg text-ink flex">
      <aside className="w-64 shrink-0 border-r border-stroke p-5 flex flex-col">
        <p className="font-display text-lg mb-8 px-2">Jembe admin</p>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `focus-ring flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-stroke/60 text-ink" : "text-muted hover:text-ink hover:bg-stroke/30"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="focus-ring mt-auto flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-ink hover:bg-stroke/30 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </aside>
      <main className="flex-1 p-8 max-w-5xl">{children}</main>
    </div>
  );
}

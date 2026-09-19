import { useEffect, useState, type ReactNode } from "react";
import { Navigate, NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, FolderKanban, FileText, LogOut, LayoutTemplate, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAdminAuth } from "../hooks/useAdminAuth";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/content", label: "Site content", icon: FileText },
  { to: "/admin/visual", label: "Visual Studio", icon: LayoutTemplate },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, logout } = useAdminAuth();
  const location = useLocation();
  const isVisualStudio = location.pathname === "/admin/visual";
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = window.localStorage.getItem("jembe-admin-sidebar-collapsed");
    return saved === null ? isVisualStudio : saved === "1";
  });

  useEffect(() => {
    window.localStorage.setItem("jembe-admin-sidebar-collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  // Visual Studio gets a wider canvas by default. The sidebar can still be reopened any time.
  useEffect(() => {
    if (isVisualStudio && window.localStorage.getItem("jembe-admin-sidebar-collapsed") === null) {
      setCollapsed(true);
    }
  }, [isVisualStudio]);

  if (loading) return <div className="min-h-screen bg-bg text-ink flex items-center justify-center text-sm text-muted">Loading Jembe admin…</div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const widthClass = collapsed ? "w-[76px]" : "w-64";

  return (
    <div className="min-h-screen bg-bg text-ink flex overflow-hidden">
      <aside className={`relative ${widthClass} shrink-0 border-r border-stroke p-3 flex flex-col transition-[width] duration-300 ease-out bg-bg/95 backdrop-blur-xl z-40`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} mb-7 px-1`}>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-display text-lg truncate">Jembe admin</p>
              <p className="text-[10px] text-muted mt-0.5">Control room</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="icon-btn shrink-0"
            title={collapsed ? "Expand admin navigation" : "Minimize admin navigation"}
            aria-label={collapsed ? "Expand admin navigation" : "Minimize admin navigation"}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        <nav className="flex flex-col gap-1" aria-label="Admin navigation">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `focus-ring flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-stroke/60 text-ink" : "text-muted hover:text-ink hover:bg-stroke/30"
                }`
              }
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={logout}
          title={collapsed ? "Sign out" : undefined}
          aria-label="Sign out"
          className={`focus-ring mt-auto flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm text-muted hover:text-ink hover:bg-stroke/30 transition-colors`}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>

        {collapsed && isVisualStudio && (
          <div className="mt-3 text-[9px] text-muted/70 text-center leading-tight">
            <span className="block">Focus</span>
            <span className="block">mode</span>
          </div>
        )}
      </aside>

      <main className={`flex-1 min-w-0 overflow-y-auto ${isVisualStudio ? "p-2 lg:p-3 max-w-none" : "p-8 max-w-5xl"}`}>
        {isVisualStudio && (
          <div className="mb-2 flex items-center justify-between px-2 text-[10px] text-muted">
            <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> Visual Studio workspace</span>
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-stroke px-2.5 py-1.5 hover:text-ink hover:bg-white/[.03] transition-colors"
              title={collapsed ? "Open admin navigation" : "Minimize admin navigation for more canvas space"}
            >
              {collapsed ? <PanelLeftOpen size={12} /> : <PanelLeftClose size={12} />}
              {collapsed ? "Show navigation" : "Hide navigation"}
            </button>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

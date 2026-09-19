import { Link } from "react-router-dom";
import { useProductsStore, useProjectsStore } from "../../hooks/useContentStore";
import { supabaseConfigured } from "../../lib/supabase";

export default function AdminDashboard() {
  const { items: products } = useProductsStore();
  const { items: projects } = useProjectsStore();

  const stats = [
    { label: "Products", value: products.length, to: "/admin/products" },
    { label: "Featured products", value: products.filter((p) => p.featured).length, to: "/admin/products" },
    { label: "Projects", value: projects.length, to: "/admin/projects" },
  ];

  return (
    <div>
      <p className="font-display text-2xl mb-1">Dashboard</p>
      <p className="text-sm text-muted mb-8">
        {supabaseConfigured ? "Connected to Supabase. Changes here can control the live Jembe website." : "Supabase is not configured yet. Add the values from .env.example before signing in on a production build."}
      </p>
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="focus-ring border border-stroke rounded-xl p-5 hover:bg-surface transition-colors">
            <p className="font-display text-3xl">{s.value}</p>
            <p className="text-sm text-muted mt-1">{s.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

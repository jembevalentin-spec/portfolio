import { useCallback, useEffect, useState } from "react";
import { products as seedProducts } from "../data/products";
import { projects as seedProjects } from "../data/projects";
import type { Product, Project } from "../data/types";
import { restFetch, supabaseConfigured } from "../lib/supabase";

function productFromRow(row: any): Product {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    description: String(row.description ?? ""),
    longDescription: String(row.long_description ?? ""),
    category: row.category,
    price: Number(row.price ?? 0),
    currency: String(row.currency ?? "USD"),
    isFree: Boolean(row.is_free),
    image: String(row.image ?? ""),
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    file: row.file ?? undefined,
    liveUrl: row.live_url ?? undefined,
    version: String(row.version ?? ""),
    compatibility: String(row.compatibility ?? ""),
    features: Array.isArray(row.features) ? row.features : [],
    featured: Boolean(row.featured),
    status: row.status,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function projectFromRow(row: any): Project {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    slug: String(row.slug ?? ""),
    description: String(row.description ?? ""),
    longDescription: String(row.long_description ?? ""),
    category: row.category,
    technologies: Array.isArray(row.technologies) ? row.technologies : [],
    image: String(row.image ?? ""),
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    liveUrl: row.live_url ?? undefined,
    githubUrl: row.github_url ?? undefined,
    role: row.role ?? undefined,
    duration: row.duration ?? undefined,
    problem: row.problem ?? undefined,
    solution: row.solution ?? undefined,
    results: row.results ?? undefined,
    featured: Boolean(row.featured),
    createdAt: String(row.created_at ?? ""),
  };
}

const productToRow = (p: Product) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  description: p.description,
  long_description: p.longDescription,
  category: p.category,
  price: p.price,
  currency: p.currency,
  is_free: p.isFree,
  image: p.image,
  gallery: p.gallery,
  file: p.file ?? "",
  live_url: p.liveUrl ?? "",
  version: p.version,
  compatibility: p.compatibility,
  features: p.features,
  featured: p.featured,
  status: p.status,
  sort_order: 0,
});

const projectToRow = (p: Project) => ({
  id: p.id,
  title: p.title,
  slug: p.slug,
  description: p.description,
  long_description: p.longDescription,
  category: p.category,
  technologies: p.technologies,
  image: p.image,
  gallery: p.gallery,
  live_url: p.liveUrl ?? "",
  github_url: p.githubUrl ?? "",
  role: p.role ?? "",
  duration: p.duration ?? "",
  problem: p.problem ?? "",
  solution: p.solution ?? "",
  results: p.results ?? "",
  featured: p.featured,
  visible: true,
  sort_order: 0,
});

export function useProductsStore() {
  const [items, setItems] = useState<Product[]>(seedProducts);
  const [loading, setLoading] = useState(supabaseConfigured);

  const load = useCallback(async () => {
    if (!supabaseConfigured) {
      setItems(seedProducts);
      setLoading(false);
      return;
    }
    try {
      const rows = await restFetch<any[]>("products", { query: "select=*&order=sort_order.asc,created_at.desc" });
      setItems(rows.length ? rows.map(productFromRow) : seedProducts);
    } catch {
      setItems(seedProducts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const upsert = async (product: Product) => {
    if (!supabaseConfigured) {
      setItems(prev => prev.some(p => p.id === product.id) ? prev.map(p => p.id === product.id ? product : p) : [product, ...prev]);
      return;
    }
    await restFetch("products", { method: "POST", body: productToRow(product), auth: true, prefer: "resolution=merge-duplicates,return=representation" });
    await load();
  };

  const remove = async (id: string) => {
    if (!supabaseConfigured) {
      setItems(prev => prev.filter(p => p.id !== id));
      return;
    }
    await restFetch("products", { method: "DELETE", query: `id=eq.${encodeURIComponent(id)}`, auth: true });
    await load();
  };

  return { items, upsert, remove, loading, reload: load };
}

export function useProjectsStore() {
  const [items, setItems] = useState<Project[]>(seedProjects);
  const [loading, setLoading] = useState(supabaseConfigured);

  const load = useCallback(async () => {
    if (!supabaseConfigured) {
      setItems(seedProjects);
      setLoading(false);
      return;
    }
    try {
      const rows = await restFetch<any[]>("projects", { query: "select=*&order=sort_order.asc,created_at.desc" });
      setItems(rows.length ? rows.map(projectFromRow) : seedProjects);
    } catch {
      setItems(seedProjects);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const upsert = async (project: Project) => {
    if (!supabaseConfigured) {
      setItems(prev => prev.some(p => p.id === project.id) ? prev.map(p => p.id === project.id ? project : p) : [project, ...prev]);
      return;
    }
    await restFetch("projects", { method: "POST", body: projectToRow(project), auth: true, prefer: "resolution=merge-duplicates,return=representation" });
    await load();
  };

  const remove = async (id: string) => {
    if (!supabaseConfigured) {
      setItems(prev => prev.filter(p => p.id !== id));
      return;
    }
    await restFetch("projects", { method: "DELETE", query: `id=eq.${encodeURIComponent(id)}`, auth: true });
    await load();
  };

  return { items, upsert, remove, loading, reload: load };
}

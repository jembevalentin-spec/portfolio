import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useProductsStore } from "../../hooks/useContentStore";
import type { Product, ProductCategory } from "../../data/types";

const emptyProduct: Product = {
  id: "",
  name: "",
  slug: "",
  description: "",
  longDescription: "",
  category: "Digital Tool",
  price: 0,
  currency: "USD",
  isFree: true,
  image: "https://picsum.photos/seed/new-product/900/700",
  gallery: [],
  liveUrl: "",
  version: "1.0.0",
  compatibility: "",
  features: [],
  featured: false,
  status: "draft",
  createdAt: new Date().toISOString().slice(0, 10),
  updatedAt: new Date().toISOString().slice(0, 10),
};

const categories: ProductCategory[] = ["Android App", "Website", "Digital Tool", "Template", "Experiment"];

export default function AdminProducts() {
  const { items, upsert, remove } = useProductsStore();
  const [editing, setEditing] = useState<Product | null>(null);

  const startNew = () => setEditing({ ...emptyProduct, id: crypto.randomUUID() });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const slug = editing.slug || editing.name.toLowerCase().replace(/\s+/g, "-");
    upsert({ ...editing, slug, updatedAt: new Date().toISOString().slice(0, 10) });
    setEditing(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-display text-2xl mb-1">Products</p>
          <p className="text-sm text-muted">{items.length} total</p>
        </div>
        <button
          onClick={startNew}
          className="focus-ring inline-flex items-center gap-2 bg-ink text-bg rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90"
        >
          <Plus size={15} /> Add product
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="border border-stroke rounded-xl p-6 mb-8 bg-surface space-y-4">
          <p className="text-sm text-muted">{items.some((p) => p.id === editing.id) ? "Edit product" : "New product"}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name">
              <input
                required
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="admin-input"
              />
            </Field>
            <Field label="Category">
              <select
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value as ProductCategory })}
                className="admin-input"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Price (USD)">
              <input
                type="number"
                min={0}
                value={editing.price}
                onChange={(e) => setEditing({ ...editing, price: Number(e.target.value), isFree: Number(e.target.value) === 0 })}
                className="admin-input"
              />
            </Field>
            <Field label="Version">
              <input
                value={editing.version}
                onChange={(e) => setEditing({ ...editing, version: e.target.value })}
                className="admin-input"
              />
            </Field>
            <Field label="Image URL">
              <input
                value={editing.image}
                onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                className="admin-input"
              />
            </Field>
            <Field label="Compatibility">
              <input
                value={editing.compatibility}
                onChange={(e) => setEditing({ ...editing, compatibility: e.target.value })}
                className="admin-input"
              />
            </Field>
            <Field label="Live demo URL">
              <input value={editing.liveUrl ?? ""} onChange={(e) => setEditing({ ...editing, liveUrl: e.target.value })} className="admin-input" />
            </Field>
            <Field label="Download file URL/path">
              <input value={editing.file ?? ""} onChange={(e) => setEditing({ ...editing, file: e.target.value })} className="admin-input" placeholder="/downloads/app.apk" />
            </Field>
          </div>
          <Field label="Short description">
            <textarea
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              className="admin-input"
              rows={2}
            />
          </Field>
          <Field label="Full description"><textarea value={editing.longDescription} onChange={(e)=>setEditing({ ...editing, longDescription:e.target.value })} className="admin-input" rows={5}/></Field>
          <Field label="Features (one per line)"><textarea value={editing.features.join("\n")} onChange={(e)=>setEditing({ ...editing, features:e.target.value.split(/\n|,/).map(v=>v.trim()).filter(Boolean) })} className="admin-input" rows={4}/></Field>
          <Field label="Gallery image URLs (one per line)"><textarea value={editing.gallery.join("\n")} onChange={(e)=>setEditing({ ...editing, gallery:e.target.value.split(/\n/).map(v=>v.trim()).filter(Boolean) })} className="admin-input" rows={3}/></Field>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={editing.featured}
                onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={editing.status === "live"}
                onChange={(e) => setEditing({ ...editing, status: e.target.checked ? "live" : "draft" })}
              />
              Published
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="focus-ring bg-ink text-bg rounded-lg px-5 py-2.5 text-sm font-medium">
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="focus-ring border border-stroke rounded-lg px-5 py-2.5 text-sm text-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="border border-stroke rounded-xl divide-y divide-stroke overflow-hidden">
        {items.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-4 gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <img src={p.image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
              <div className="min-w-0">
                <p className="text-sm truncate">{p.name}</p>
                <p className="text-xs text-muted">
                  {p.category} · {p.isFree ? "Free" : `$${p.price}`} · {p.status}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setEditing(p)}
                className="focus-ring p-2 rounded-lg text-muted hover:text-ink hover:bg-stroke/40"
                aria-label={`Edit ${p.name}`}
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => remove(p.id)}
                className="focus-ring p-2 rounded-lg text-muted hover:text-red-400 hover:bg-stroke/40"
                aria-label={`Delete ${p.name}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-muted mb-1.5">{label}</span>
      {children}
    </label>
  );
}

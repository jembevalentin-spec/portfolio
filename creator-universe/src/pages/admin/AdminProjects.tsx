import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useProjectsStore } from "../../hooks/useContentStore";
import type { Project, ProjectCategory } from "../../data/types";

const emptyProject: Project = {
  id: "",
  title: "",
  slug: "",
  description: "",
  longDescription: "",
  category: "Web App",
  technologies: [],
  image: "https://picsum.photos/seed/new-project/1200/900",
  gallery: [],
  featured: false,
  createdAt: new Date().toISOString().slice(0, 10),
};

const categories: ProjectCategory[] = [
  "Website",
  "Android App",
  "Web App",
  "Experiment",
  "Client Project",
  "Personal Project",
];

export default function AdminProjects() {
  const { items, upsert, remove } = useProjectsStore();
  const [editing, setEditing] = useState<Project | null>(null);

  const startNew = () => setEditing({ ...emptyProject, id: crypto.randomUUID() });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const slug = editing.slug || editing.title.toLowerCase().replace(/\s+/g, "-");
    upsert({ ...editing, slug });
    setEditing(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-display text-2xl mb-1">Projects</p>
          <p className="text-sm text-muted">{items.length} total</p>
        </div>
        <button
          onClick={startNew}
          className="focus-ring inline-flex items-center gap-2 bg-ink text-bg rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90"
        >
          <Plus size={15} /> Add project
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="border border-stroke rounded-xl p-6 mb-8 bg-surface space-y-4">
          <p className="text-sm text-muted">{items.some((p) => p.id === editing.id) ? "Edit project" : "New project"}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Title">
              <input
                required
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="admin-input"
              />
            </Field>
            <Field label="Category">
              <select
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value as ProjectCategory })}
                className="admin-input"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Image URL">
              <input
                value={editing.image}
                onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                className="admin-input"
              />
            </Field>
            <Field label="Technologies (comma-separated)">
              <input
                value={editing.technologies.join(", ")}
                onChange={(e) =>
                  setEditing({ ...editing, technologies: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })
                }
                className="admin-input"
              />
            </Field>
            <Field label="Live URL">
              <input
                value={editing.liveUrl ?? ""}
                onChange={(e) => setEditing({ ...editing, liveUrl: e.target.value })}
                className="admin-input"
              />
            </Field>
            <Field label="GitHub URL">
              <input
                value={editing.githubUrl ?? ""}
                onChange={(e) => setEditing({ ...editing, githubUrl: e.target.value })}
                className="admin-input"
              />
            </Field>
            <Field label="Role"><input value={editing.role ?? ""} onChange={(e)=>setEditing({ ...editing, role:e.target.value })} className="admin-input"/></Field>
            <Field label="Duration"><input value={editing.duration ?? ""} onChange={(e)=>setEditing({ ...editing, duration:e.target.value })} className="admin-input"/></Field>
          </div>
          <Field label="Description">
            <textarea
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              className="admin-input"
              rows={2}
            />
          </Field>
          <Field label="Full case-study description"><textarea value={editing.longDescription} onChange={(e)=>setEditing({ ...editing, longDescription:e.target.value })} className="admin-input" rows={5}/></Field>
          <div className="grid md:grid-cols-3 gap-4"><Field label="Problem"><textarea value={editing.problem ?? ""} onChange={(e)=>setEditing({ ...editing, problem:e.target.value })} className="admin-input" rows={3}/></Field><Field label="Solution"><textarea value={editing.solution ?? ""} onChange={(e)=>setEditing({ ...editing, solution:e.target.value })} className="admin-input" rows={3}/></Field><Field label="Results"><textarea value={editing.results ?? ""} onChange={(e)=>setEditing({ ...editing, results:e.target.value })} className="admin-input" rows={3}/></Field></div>
          <Field label="Gallery image URLs (one per line)"><textarea value={editing.gallery.join("\n")} onChange={(e)=>setEditing({ ...editing, gallery:e.target.value.split(/\n/).map(v=>v.trim()).filter(Boolean) })} className="admin-input" rows={3}/></Field>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={editing.featured}
              onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
            />
            Featured
          </label>
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
                <p className="text-sm truncate">{p.title}</p>
                <p className="text-xs text-muted">{p.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setEditing(p)}
                className="focus-ring p-2 rounded-lg text-muted hover:text-ink hover:bg-stroke/40"
                aria-label={`Edit ${p.title}`}
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => remove(p.id)}
                className="focus-ring p-2 rounded-lg text-muted hover:text-red-400 hover:bg-stroke/40"
                aria-label={`Delete ${p.title}`}
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

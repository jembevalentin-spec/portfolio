import { useEffect, useMemo, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import { ArrowDown, ArrowUp, Check, Eye, EyeOff, GripVertical, LayoutTemplate, Monitor, Move, Palette, Plus, Redo2, Save, Smartphone, Undo2, Trash2 } from "lucide-react";
import { saveSiteContent, useSiteContent, type SiteContent } from "../../hooks/useSiteContent";
import { defaultSiteDesign, type DesignBox, type HeroElementId, type SectionId, type SectionRef, normalizeSiteDesign, type SiteDesign } from "../../data/siteDesign";

const sectionLabels: Record<SectionId, string> = {
  hero: "Hero",
  store: "Store",
  discovery: "Discovery",
  featuredWork: "Featured work",
  services: "Services",
  contact: "Contact",
};

const heroLabels: Record<HeroElementId, string> = {
  branding: "Logo / brand",
  motto: "Motto",
  owner: "Owner photo",
  eyebrow: "Eyebrow",
  headline: "Main headline",
  description: "Description",
  buttons: "Action buttons",
  featured: "Featured product",
};

function isCustomSection(ref: SectionRef): ref is `custom:${string}` {
  return ref.startsWith("custom:");
}

function customId(ref: SectionRef) {
  return ref.slice("custom:".length);
}

function sectionLabel(design: SiteDesign, ref: SectionRef) {
  if (!isCustomSection(ref)) return sectionLabels[ref];
  return design.customSections.find(s => s.id === customId(ref))?.title || "Custom section";
}

function sectionVisible(design: SiteDesign, ref: SectionRef) {
  return isCustomSection(ref)
    ? Boolean(design.customSections.find(s => s.id === customId(ref))?.visible)
    : design.sections[ref].visible;
}


type SelectedLayer = { kind: "section"; id: SectionRef } | { kind: "hero"; id: HeroElementId } | null;

export default function VisualStudio() {
  const live = useSiteContent();
  const [draft, setDraft] = useState<SiteContent>(() => live);
  const [selected, setSelected] = useState<SelectedLayer>({ kind: "hero", id: "headline" });
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<SiteDesign[]>([]);
  const [future, setFuture] = useState<SiteDesign[]>([]);
  const [dragging, setDragging] = useState(false);

  const design = useMemo(() => normalizeSiteDesign(draft.design), [draft.design]);

  useEffect(() => {
    if (!live.loading) setDraft(live);
  }, [live.loading]);

  const patchDesign = (updater: (current: SiteDesign) => SiteDesign) => {
    setHistory(h => [...h.slice(-19), structuredClone(design)]);
    setFuture([]);
    setDraft(c => ({ ...c, design: updater(normalizeSiteDesign(c.design)) }));
    setSaved(false);
  };

  const updateBox = (id: HeroElementId, patch: Partial<DesignBox>) => {
    patchDesign(current => ({
      ...current,
      hero: {
        ...current.hero,
        elements: { ...current.hero.elements, [id]: { ...current.hero.elements[id], ...patch } },
      },
    }));
  };



  const toggleSection = (id: SectionRef) => patchDesign(current => {
    if (isCustomSection(id)) {
      const cid = customId(id);
      return { ...current, customSections: current.customSections.map(s => s.id === cid ? { ...s, visible: !s.visible } : s) };
    }
    return { ...current, sections: { ...current.sections, [id]: { visible: !current.sections[id].visible } } };
  });

  const removeSection = (id: SectionRef) => {
    if (!isCustomSection(id)) return;
    patchDesign(current => ({
      ...current,
      sectionOrder: current.sectionOrder.filter(ref => ref !== id),
      customSections: current.customSections.filter(s => s.id !== customId(id)),
    }));
    setSelected(null);
  };

  const addCustomSection = () => {
    const id = crypto.randomUUID();
    patchDesign(current => ({
      ...current,
      customSections: [...current.customSections, { id, title: "New section", body: "Add your content from Site content.", visible: true }],
      sectionOrder: [...current.sectionOrder, `custom:${id}` as SectionRef],
    }));
    setSelected({ kind: "section", id: `custom:${id}` as SectionRef });
  };

  const toggleHero = (id: HeroElementId) => updateBox(id, { visible: !design.hero.elements[id].visible });

  const moveSection = (id: SectionRef, direction: -1 | 1) => patchDesign(current => {
    const order = [...current.sectionOrder];
    const index = order.indexOf(id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= order.length) return current;
    [order[index], order[target]] = [order[target], order[index]];
    return { ...current, sectionOrder: order };
  });

  const undo = () => {
    const previous = history.at(-1);
    if (!previous) return;
    setHistory(h => h.slice(0, -1));
    setFuture(f => [structuredClone(design), ...f].slice(0, 20));
    setDraft(c => ({ ...c, design: previous }));
  };

  const redo = () => {
    const next = future.at(0);
    if (!next) return;
    setFuture(f => f.slice(1));
    setHistory(h => [...h.slice(-19), structuredClone(design)]);
    setDraft(c => ({ ...c, design: next }));
  };

  const reset = () => {
    setHistory(h => [...h.slice(-19), structuredClone(design)]);
    setFuture([]);
    setDraft(c => ({ ...c, design: structuredClone(defaultSiteDesign) }));
    setSaved(false);
  };

  const save = async () => {
    setError("");
    setBusy(true);
    try {
      await saveSiteContent({ ...draft, design });
      setSaved(true);
      window.dispatchEvent(new CustomEvent("jembe-site-content-changed"));
      setTimeout(() => setSaved(false), 1600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish the design.");
    } finally {
      setBusy(false);
    }
  };

  const selectedBox = selected?.kind === "hero" ? design.hero.elements[selected.id] : null;

  if (live.loading && draft === live) {
    return <div className="py-12 text-sm text-muted">Loading Jembe Visual Studio…</div>;
  }

  const beginDrag = (e: React.PointerEvent, id: HeroElementId) => {
    if (device === "mobile") return;
    e.preventDefault();
    setSelected({ kind: "hero", id });
    setDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const start = design.hero.elements[id];
    const target = e.currentTarget as HTMLElement;
    const preview = target.closest("[data-jembe-canvas]") as HTMLElement | null;
    const rect = preview?.getBoundingClientRect();
    if (!rect) return;

    const move = (ev: PointerEvent) => {
      const dx = ((ev.clientX - startX) / rect.width) * 100;
      const dy = ((ev.clientY - startY) / rect.height) * 100;
      setDraft(c => {
        const d = normalizeSiteDesign(c.design);
        d.hero.elements[id] = {
          ...start,
          x: Math.max(0, Math.min(100 - start.w, start.x + dx)),
          y: Math.max(0, Math.min(100 - start.h, start.y + dy)),
        };
        return { ...c, design: d };
      });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setDragging(false);
      setHistory(h => [...h.slice(-19), structuredClone(design)]);
      setFuture([]);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  };

  return (
    <div className="-m-2 min-h-[calc(100vh-2rem)]">
      <div className="sticky top-0 z-30 border-b border-stroke/80 bg-bg/90 backdrop-blur-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center text-bg"><LayoutTemplate size={18} /></div>
          <div>
            <p className="font-display text-xl">Jembe Visual Studio</p>
            <p className="text-[11px] text-muted">Design the actual website visually — then publish it.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={undo} disabled={!history.length} className="icon-btn" title="Undo"><Undo2 size={15} /></button>
          <button onClick={redo} disabled={!future.length} className="icon-btn" title="Redo"><Redo2 size={15} /></button>
          <button onClick={reset} className="px-3 py-2 rounded-lg border border-stroke text-xs text-muted hover:text-ink">Reset layout</button>
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink text-bg text-xs font-medium disabled:opacity-50">
            {saved ? <Check size={14} /> : <Save size={14} />}{busy ? "Publishing…" : saved ? "Published" : "Publish design"}
          </button>
        </div>
      </div>

      {error && <div className="mx-4 mt-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">{error}</div>}

      <div className="grid xl:grid-cols-[250px_minmax(0,1fr)_285px] min-h-[calc(100vh-6rem)]">
        <aside className="border-r border-stroke p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-[.18em] text-muted">Layers</p>
            <span className="text-[10px] text-muted">drag the canvas</span>
          </div>
          <div className="space-y-2">
            {design.sectionOrder.map((sectionId, index) => {
              const visible = sectionVisible(design, sectionId);
              return (
                <div key={sectionId} className="rounded-xl border border-stroke bg-surface overflow-hidden">
                  <div role="button" tabIndex={0} onClick={() => setSelected({ kind: "section", id: sectionId })} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setSelected({ kind: "section", id: sectionId }); }} className={`w-full px-3 py-3 flex items-center gap-2 text-left text-xs cursor-pointer ${selected?.kind === "section" && selected.id === sectionId ? "bg-white/7" : ""}`}>
                    <GripVertical size={14} className="text-muted" />
                    <span className="flex-1 font-medium">{sectionLabel(design, sectionId)}</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); toggleSection(sectionId); }} className="p-1 text-muted hover:text-ink" title="Show/hide">
                      {visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                  </div>
                  <div className="flex border-t border-stroke">
                    <button onClick={() => moveSection(sectionId, -1)} disabled={index === 0} className="flex-1 py-1.5 text-muted disabled:opacity-20 hover:text-ink"><ArrowUp size={13} className="mx-auto" /></button>
                    <button onClick={() => moveSection(sectionId, 1)} disabled={index === design.sectionOrder.length - 1} className="flex-1 py-1.5 text-muted disabled:opacity-20 hover:text-ink"><ArrowDown size={13} className="mx-auto" /></button>
                    {isCustomSection(sectionId) && <button onClick={() => removeSection(sectionId)} className="flex-1 py-1.5 text-muted hover:text-red-300"><Trash2 size={13} className="mx-auto" /></button>}
                  </div>
                  {sectionId === "hero" && (
                    <div className="border-t border-stroke p-2 space-y-1">
                      {(Object.keys(heroLabels) as HeroElementId[]).map(id => {
                        const el = design.hero.elements[id];
                        return (
                          <button key={id} onClick={() => setSelected({ kind: "hero", id })} className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] ${selected?.kind === "hero" && selected.id === id ? "bg-white/8 text-ink" : "text-muted hover:text-ink"}`}>
                            <Move size={11} />
                            <span className="flex-1 text-left">{heroLabels[id]}</span>
                            <span onClick={(e) => { e.stopPropagation(); toggleHero(id); }} className="p-0.5">{el.visible ? <Eye size={12} /> : <EyeOff size={12} />}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button onClick={addCustomSection} className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 px-3 py-3 text-xs text-muted hover:text-ink hover:bg-white/[.03]"><Plus size={14} /> Add custom section</button>
        </aside>

        <main className="p-4 md:p-6 overflow-auto bg-black/20">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-1 rounded-xl border border-stroke bg-surface p-1">
              <button onClick={() => setDevice("desktop")} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs ${device === "desktop" ? "bg-white/10 text-ink" : "text-muted"}`}><Monitor size={13} /> Desktop</button>
              <button onClick={() => setDevice("mobile")} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs ${device === "mobile" ? "bg-white/10 text-ink" : "text-muted"}`}><Smartphone size={13} /> Mobile</button>
            </div>
            <p className="text-[11px] text-muted">Changes are live in the preview. Publish when ready.</p>
          </div>

          <div className={`mx-auto ${device === "mobile" ? "max-w-[390px]" : "max-w-[1240px]"}`}>
            <div data-jembe-canvas className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0a0a] shadow-2xl ${device === "mobile" ? "aspect-[9/16]" : "aspect-[16/9]"}`}>
              <div className="absolute inset-0">
                <video src={draft.heroBackgroundVideo || undefined} poster={draft.heroBackgroundImage || "/media/jembe-background-poster.jpg"} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-55" />
                <div className="absolute inset-0 bg-black" style={{ opacity: design.hero ? draft.heroOverlay / 100 : 0.62 }} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/80" />
              </div>

              <PreviewHero draft={draft} design={design} device={device} selected={selected} onSelect={setSelected} onPointerDown={beginDrag} dragging={dragging} />

              {design.sectionOrder.filter(id => id !== "hero").map(sectionId => {
                const visible = sectionVisible(design, sectionId);
                return (
                  <button type="button" key={sectionId} onClick={() => setSelected({ kind: "section", id: sectionId })} className={`absolute left-5 right-5 rounded-2xl border border-white/10 bg-white/[.04] backdrop-blur-sm flex items-center justify-center ${visible ? "opacity-100" : "opacity-20"}`} style={{
                    top: `${16 + (design.sectionOrder.indexOf(sectionId) - 1) * 14}%`,
                    height: "10%",
                  }}>
                    <span className="font-display text-sm tracking-tight">{sectionLabel(design, sectionId)}</span>
                  </button>
                );
              })}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] text-white/40 uppercase tracking-[.22em]">Live visual preview</div>
            </div>
          </div>
        </main>

        <aside className="border-l border-stroke p-4 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4"><Palette size={14} className="text-muted" /><p className="text-xs uppercase tracking-[.18em] text-muted">Properties</p></div>

          {selected?.kind === "section" && (
            <section className="panel-card space-y-4">
              <div><p className="font-display text-lg">{sectionLabel(design, selected.id)}</p><p className="text-[11px] text-muted mt-1">Control the public section.</p></div>
              <button onClick={() => toggleSection(selected.id)} className="w-full rounded-xl border border-stroke px-3 py-3 text-left text-xs flex items-center justify-between"><span>{sectionVisible(design, selected.id) ? "Visible" : "Hidden"}</span>{sectionVisible(design, selected.id) ? <Eye size={14} /> : <EyeOff size={14} />}</button>
              {isCustomSection(selected.id) && (() => { const custom = design.customSections.find(s => s.id === customId(selected.id)); if (!custom) return null; return <><label className="block"><span className="block text-[11px] text-muted mb-1.5">Section title</span><input value={custom.title} onChange={e => patchDesign(d => ({ ...d, customSections: d.customSections.map(s => s.id === custom.id ? { ...s, title: e.target.value } : s) }))} className="admin-input" /></label><label className="block"><span className="block text-[11px] text-muted mb-1.5">Section content</span><textarea rows={5} value={custom.body} onChange={e => patchDesign(d => ({ ...d, customSections: d.customSections.map(s => s.id === custom.id ? { ...s, body: e.target.value } : s) }))} className="admin-input" /></label><button onClick={() => removeSection(selected.id)} className="w-full rounded-xl border border-red-400/20 text-red-300 px-3 py-2.5 text-xs">Delete section</button></>} )}
              <div className="rounded-xl border border-dashed border-stroke p-3 text-[11px] text-muted">Use the up/down buttons in Layers to reorder sections. The public homepage follows this order after publishing.</div>
            </section>
          )}

          {selected?.kind === "hero" && selectedBox && (
            <section className="panel-card space-y-4">
              <div className="flex items-center justify-between"><div><p className="font-display text-lg">{heroLabels[selected.id]}</p><p className="text-[11px] text-muted mt-1">Drag it in the preview.</p></div><button onClick={() => toggleHero(selected.id)} className="p-2 rounded-lg border border-stroke text-muted hover:text-ink">{selectedBox.visible ? <Eye size={14} /> : <EyeOff size={14} />}</button></div>
              <NumberField label="X" value={selectedBox.x} step={0.5} onChange={v => updateBox(selected.id, { x: clamp(v, 0, 100 - selectedBox.w) })} suffix="%" />
              <NumberField label="Y" value={selectedBox.y} step={0.5} onChange={v => updateBox(selected.id, { y: clamp(v, 0, 100 - selectedBox.h) })} suffix="%" />
              <NumberField label="Width" value={selectedBox.w} step={0.5} onChange={v => updateBox(selected.id, { w: clamp(v, 3, 100 - selectedBox.x) })} suffix="%" />
              <NumberField label="Height" value={selectedBox.h} step={0.5} onChange={v => updateBox(selected.id, { h: clamp(v, 3, 100 - selectedBox.y) })} suffix="%" />
              {selected.id === "headline" && <NumberField label="Headline scale" value={selectedBox.fontSize ?? 1} min={0.65} max={1.5} step={0.05} onChange={v => updateBox(selected.id, { fontSize: clamp(v, 0.65, 1.5) })} suffix="×" />}
              {(selected.id === "description" || selected.id === "motto") && <NumberField label="Opacity" value={selectedBox.opacity ?? 85} min={20} max={100} step={1} onChange={v => updateBox(selected.id, { opacity: clamp(v, 20, 100) })} suffix="%" />}
              {(selected.id === "owner" || selected.id === "featured") && <NumberField label="Corner radius" value={selectedBox.radius ?? 24} min={0} max={48} step={1} onChange={v => updateBox(selected.id, { radius: clamp(v, 0, 48) })} suffix="px" />}
              <button onClick={() => { updateBox(selected.id, { x: defaultSiteDesign.hero.elements[selected.id].x, y: defaultSiteDesign.hero.elements[selected.id].y, w: defaultSiteDesign.hero.elements[selected.id].w, h: defaultSiteDesign.hero.elements[selected.id].h }); }} className="w-full rounded-xl border border-stroke px-3 py-2.5 text-xs text-muted hover:text-ink">Reset this element</button>
            </section>
          )}

          <section className="panel-card mt-4 space-y-4">
            <p className="font-display text-lg">Global look</p>
            <ColorField label="Background HSL" value={design.theme.bg} onChange={v => patchDesign(d => ({ ...d, theme: { ...d.theme, bg: v } }))} />
            <ColorField label="Surface HSL" value={design.theme.surface} onChange={v => patchDesign(d => ({ ...d, theme: { ...d.theme, surface: v } }))} />
            <ColorField label="Accent A HSL" value={design.theme.accentA} onChange={v => patchDesign(d => ({ ...d, theme: { ...d.theme, accentA: v } }))} />
            <ColorField label="Accent B HSL" value={design.theme.accentB} onChange={v => patchDesign(d => ({ ...d, theme: { ...d.theme, accentB: v } }))} />
            <NumberField label="Global radius" value={design.theme.radius} min={6} max={40} step={1} onChange={v => patchDesign(d => ({ ...d, theme: { ...d.theme, radius: clamp(v, 6, 40) } }))} suffix="px" />
          </section>
        </aside>
      </div>
    </div>
  );
}

function PreviewHero({ draft, design, device, selected, onSelect, onPointerDown, dragging }: { draft: SiteContent; design: SiteDesign; device: "desktop" | "mobile"; selected: SelectedLayer; onSelect: (x: SelectedLayer) => void; onPointerDown: (e: PointerEvent, id: HeroElementId) => void; dragging: boolean }) {
  const el = design.hero.elements;
  const frame = (id: HeroElementId, child: ReactNode) => {
    const b = el[id];
    if (!b.visible) return null;
    return <button type="button" onClick={() => onSelect({ kind: "hero", id })} onPointerDown={e => onPointerDown(e, id)} className={`absolute text-left select-none ${selected?.kind === "hero" && selected.id === id ? "ring-2 ring-cyan-300/80" : "ring-1 ring-white/10 hover:ring-white/30"} ${dragging && selected?.kind === "hero" && selected.id === id ? "cursor-grabbing" : "cursor-grab"}`} style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%`, opacity: (b.opacity ?? 100) / 100, transform: `scale(${design.hero.contentScale})`, transformOrigin: "top left", borderRadius: `${b.radius ?? 20}px` }}>{child}</button>;
  };

  return (
    <div className={`absolute inset-0 ${device === "mobile" ? "scale-[.9] origin-top" : ""}`}>
      {frame("branding", <div className="h-full flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-xs font-display">{draft.logoText || "JM"}</div><div><p className="font-display text-sm">{draft.siteName}</p></div></div>)}
      {frame("motto", <p className="text-[9px] leading-relaxed text-white/65">{draft.motto || "Your brand motto"}</p>)}
      {frame("owner", <div className="h-full w-full overflow-hidden bg-white/5 border border-white/15" style={{ borderRadius: `${el.owner.radius ?? 24}px` }}>{draft.heroOwnerImage ? <img src={draft.heroOwnerImage} alt="Owner" className="w-full h-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-[9px] text-white/45">Owner photo</div>}</div>)}
      {frame("eyebrow", <p className="text-[10px] uppercase tracking-[.14em] text-white/60">{draft.heroEyebrow}</p>)}
      {frame("headline", <div className="h-full overflow-hidden"><p className="font-display text-[clamp(1.4rem,4.1vw,4.2rem)] leading-[.88] tracking-[-.045em]">{draft.heroHeadline}</p></div>)}
      {frame("description", <p className="text-[10px] leading-relaxed text-white/75">{draft.heroDescription}</p>)}
      {frame("buttons", <div className="flex gap-2 flex-wrap"><span className="px-3 py-1.5 bg-white text-black text-[9px] rounded-full">Browse store ↗</span><span className="px-3 py-1.5 bg-white/10 border border-white/15 text-white text-[9px] rounded-full">See the work</span></div>)}
      {frame("featured", <div className="h-full p-2 bg-black/55 backdrop-blur-xl border border-white/15" style={{ borderRadius: `${el.featured.radius ?? 24}px` }}><div className="h-[72%] rounded-2xl overflow-hidden bg-white/10"><img src="/media/jembe-background-poster.jpg" alt="Featured" className="h-full w-full object-cover" /></div><p className="font-display text-[11px] mt-2">Featured product</p><p className="text-[8px] text-white/45 mt-1">Digital product • Jembe</p></div>)}
    </div>
  );
}

function NumberField({ label, value, onChange, step = 1, min = 0, max = 100, suffix = "" }: { label: string; value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number; suffix?: string }) {
  return <label className="flex items-center justify-between gap-3"><span className="text-[11px] text-muted">{label}</span><span className="flex items-center gap-1 w-28"><input type="number" value={Number.isFinite(value) ? value : 0} step={step} min={min} max={max} onChange={e => onChange(Number(e.target.value))} className="admin-input text-right" /><span className="text-[10px] text-muted w-5">{suffix}</span></span></label>;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <label className="block"><span className="block text-[11px] text-muted mb-1.5">{label}</span><input value={value} onChange={e => onChange(e.target.value)} className="admin-input" placeholder="0 0% 4%" /></label>;
}

function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min)); }

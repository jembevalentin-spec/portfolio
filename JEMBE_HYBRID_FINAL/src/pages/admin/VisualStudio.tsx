import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  GripVertical,
  Image as ImageIcon,
  Layers3,
  LayoutTemplate,
  Lock,
  LockOpen,
  Maximize2,
  Monitor,
  Move,
  Palette,
  Play,
  Plus,
  Redo2,
  Save,
  Smartphone,
  Tablet,
  Trash2,
  Type,
  Undo2,
  Upload,
  Video,
} from "lucide-react";
import { saveSiteContent, uploadSiteMedia, useSiteContent, type SiteContent } from "../../hooks/useSiteContent";
import {
  defaultSiteDesign,
  type DesignBox,
  type HeroElementId,
  type SectionId,
  type SectionRef,
  normalizeSiteDesign,
  type SiteDesign,
} from "../../data/siteDesign";

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

const textFields: Partial<Record<HeroElementId, keyof SiteContent>> = {
  motto: "motto",
  eyebrow: "heroEyebrow",
  headline: "heroHeadline",
  description: "heroDescription",
};

function isCustomSection(ref: SectionRef): ref is `custom:${string}` {
  return ref.startsWith("custom:");
}

function customId(ref: SectionRef) {
  return ref.slice("custom:".length);
}

function sectionLabel(design: SiteDesign, ref: SectionRef) {
  if (!isCustomSection(ref)) return sectionLabels[ref];
  return design.customSections.find((s) => s.id === customId(ref))?.title || "Custom section";
}

function sectionVisible(design: SiteDesign, ref: SectionRef) {
  return isCustomSection(ref)
    ? Boolean(design.customSections.find((s) => s.id === customId(ref))?.visible)
    : design.sections[ref].visible;
}

type SelectedLayer =
  | { kind: "section"; id: SectionRef }
  | { kind: "hero"; id: HeroElementId }
  | null;

type Device = "desktop" | "tablet" | "mobile";

export default function VisualStudio() {
  const live = useSiteContent();
  const [draft, setDraft] = useState<SiteContent>(() => live);
  const [selected, setSelected] = useState<SelectedLayer>({ kind: "hero", id: "headline" });
  const [device, setDevice] = useState<Device>("desktop");
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [busy, setBusy] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<SiteDesign[]>([]);
  const [future, setFuture] = useState<SiteDesign[]>([]);
  const [layersOpen, setLayersOpen] = useState(true);
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [frameReady, setFrameReady] = useState(false);
  const dragSnapshot = useRef<{ id: HeroElementId; design: SiteDesign } | null>(null);
  const skipContentSyncRef = useRef(false);

  const design = useMemo(() => normalizeSiteDesign(draft.design), [draft.design]);

  useEffect(() => {
    if (!live.loading) setDraft(live);
  }, [live.loading]);

  useEffect(() => {
    const frame = iframeRef.current?.contentWindow;
    if (!frame) return;
    if (!skipContentSyncRef.current) {
      frame.postMessage(
        { type: "jembe-preview-update", content: { ...draft, design } },
        window.location.origin,
      );
    }
    skipContentSyncRef.current = false;
    if (selected) {
      frame.postMessage(
        { type: "jembe-visual-select-current", kind: selected.kind, id: selected.id },
        window.location.origin,
      );
    }
  }, [draft, design, selected, frameReady]);

  useEffect(() => {
    const receiveVisual = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !event.data) return;
      const data = event.data as Record<string, unknown>;

      if (data.type === "jembe-visual-select" && data.kind === "hero" && typeof data.id === "string") {
        setSelected({ kind: "hero", id: data.id as HeroElementId });
        return;
      }
      if (data.type === "jembe-visual-select" && data.kind === "section" && typeof data.id === "string") {
        setSelected({ kind: "section", id: data.id as SectionRef });
        return;
      }
      if (data.type === "jembe-visual-drag-start" && typeof data.id === "string") {
        dragSnapshot.current = { id: data.id as HeroElementId, design: structuredClone(design) };
        return;
      }
      if (data.type === "jembe-visual-drag-patch" && typeof data.id === "string") {
        const id = data.id as HeroElementId;
        const x = Number(data.x);
        const y = Number(data.y);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        setDraft((c) => {
          const next = normalizeSiteDesign(c.design);
          const box = next.hero.elements[id];
          if (!box) return c;
          next.hero.elements[id] = { ...box, x, y };
          return { ...c, design: next };
        });
        setPublished(false);
        return;
      }
      if (data.type === "jembe-visual-resize-patch" && typeof data.id === "string") {
        const id = data.id as HeroElementId;
        const values = ["x", "y", "w", "h"].map((key) => Number(data[key]));
        if (values.some((v) => !Number.isFinite(v))) return;
        const [x, y, w, h] = values;
        setDraft((c) => {
          const next = normalizeSiteDesign(c.design);
          const box = next.hero.elements[id];
          if (!box) return c;
          next.hero.elements[id] = { ...box, x, y, w, h };
          return { ...c, design: next };
        });
        setPublished(false);
        return;
      }
      if (data.type === "jembe-visual-drag-end" && typeof data.id === "string") {
        const snapshot = dragSnapshot.current;
        if (snapshot && snapshot.id === data.id) {
          setHistory((h) => [...h.slice(-19), snapshot.design]);
          setFuture([]);
        }
        dragSnapshot.current = null;
        return;
      }
      if (data.type === "jembe-visual-text-input" && typeof data.field === "string" && typeof data.value === "string") {
        const field = data.field as keyof SiteContent;
        if (!(field in draft) || typeof draft[field] !== "string") return;
        skipContentSyncRef.current = true;
        setDraft((c) => ({ ...c, [field]: data.value }));
        setPublished(false);
      }
    };
    window.addEventListener("message", receiveVisual);
    return () => window.removeEventListener("message", receiveVisual);
  }, [design, draft]);

  const patchDesign = (updater: (current: SiteDesign) => SiteDesign) => {
    setHistory((h) => [...h.slice(-19), structuredClone(design)]);
    setFuture([]);
    setDraft((c) => ({ ...c, design: updater(normalizeSiteDesign(c.design)) }));
    setPublished(false);
  };

  const patchContent = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setPublished(false);
  };

  const updateBox = (id: HeroElementId, patch: Partial<DesignBox>, commit = true) => {
    const updater = (current: SiteDesign) => ({
      ...current,
      hero: {
        ...current.hero,
        elements: {
          ...current.hero.elements,
          [id]: { ...current.hero.elements[id], ...patch },
        },
      },
    });
    if (commit) patchDesign(updater);
    else setDraft((c) => ({ ...c, design: updater(normalizeSiteDesign(c.design)) }));
  };

  const toggleSection = (id: SectionRef) =>
    patchDesign((current) => {
      if (isCustomSection(id)) {
        const cid = customId(id);
        return {
          ...current,
          customSections: current.customSections.map((s) => s.id === cid ? { ...s, visible: !s.visible } : s),
        };
      }
      return { ...current, sections: { ...current.sections, [id]: { visible: !current.sections[id].visible } } };
    });

  const removeSection = (id: SectionRef) => {
    if (!isCustomSection(id)) return;
    patchDesign((current) => ({
      ...current,
      sectionOrder: current.sectionOrder.filter((ref) => ref !== id),
      customSections: current.customSections.filter((s) => s.id !== customId(id)),
    }));
    setSelected(null);
  };

  const addCustomSection = (preset: "blank" | "cta" | "features" = "blank") => {
    const id = crypto.randomUUID();
    const content = {
      blank: { title: "New section", body: "Add your content from the Site content editor." },
      cta: { title: "Let's build something useful.", body: "Tell me what you're trying to make and Jembe can turn the idea into a finished digital product." },
      features: { title: "Why Jembe", body: "Clear interfaces, practical products and a focus on shipping useful work." },
    }[preset];
    patchDesign((current) => ({
      ...current,
      customSections: [...current.customSections, { id, title: content.title, body: content.body, visible: true }],
      sectionOrder: [...current.sectionOrder, `custom:${id}` as SectionRef],
    }));
    setSelected({ kind: "section", id: `custom:${id}` as SectionRef });
    setAddOpen(false);
  };

  const toggleHero = (id: HeroElementId) => updateBox(id, { visible: !design.hero.elements[id].visible });

  const toggleLock = (id: HeroElementId) => updateBox(id, { locked: !design.hero.elements[id].locked });

  const moveSection = (id: SectionRef, direction: -1 | 1) =>
    patchDesign((current) => {
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
    setHistory((h) => h.slice(0, -1));
    setFuture((f) => [structuredClone(design), ...f].slice(0, 20));
    setDraft((c) => ({ ...c, design: previous }));
    setPublished(false);
  };

  const redo = () => {
    const next = future.at(0);
    if (!next) return;
    setFuture((f) => f.slice(1));
    setHistory((h) => [...h.slice(-19), structuredClone(design)]);
    setDraft((c) => ({ ...c, design: next }));
    setPublished(false);
  };

  const reset = () => {
    setHistory((h) => [...h.slice(-19), structuredClone(design)]);
    setFuture([]);
    setDraft((c) => ({ ...c, design: structuredClone(defaultSiteDesign) }));
    setPublished(false);
  };

  const alignSelected = (kind: "left" | "center" | "right" | "top" | "middle" | "bottom") => {
    if (selected?.kind !== "hero") return;
    const box = design.hero.elements[selected.id];
    const patch: Partial<DesignBox> = {};
    if (kind === "left") patch.x = 0;
    if (kind === "center") patch.x = (100 - box.w) / 2;
    if (kind === "right") patch.x = 100 - box.w;
    if (kind === "top") patch.y = 0;
    if (kind === "middle") patch.y = (100 - box.h) / 2;
    if (kind === "bottom") patch.y = 100 - box.h;
    updateBox(selected.id, patch);
  };

  const magicArrange = () => {
    patchDesign((current) => {
      const next = structuredClone(current);
      const e = next.hero.elements;
      e.branding = { ...e.branding, x: 4, y: 7, w: 20, h: 10 };
      e.motto = { ...e.motto, x: 4, y: 18, w: 19, h: 8 };
      e.owner = { ...e.owner, x: 4, y: 28, w: 20, h: 56 };
      e.eyebrow = { ...e.eyebrow, x: 29, y: 14, w: 42, h: 6 };
      e.headline = { ...e.headline, x: 29, y: 24, w: 43, h: 27 };
      e.description = { ...e.description, x: 29, y: 57, w: 42, h: 12 };
      e.buttons = { ...e.buttons, x: 29, y: 71, w: 42, h: 11 };
      e.featured = { ...e.featured, x: 75, y: 14, w: 21, h: 61 };
      return next;
    });
  };

  const save = async () => {
    setError("");
    setBusy(true);
    try {
      await saveSiteContent({ ...draft, design });
      setPublished(true);
      window.dispatchEvent(new CustomEvent("jembe-site-content-changed"));
      window.setTimeout(() => setPublished(false), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish the design.");
    } finally {
      setBusy(false);
    }
  };

  const selectedBox = selected?.kind === "hero" ? design.hero.elements[selected.id] : null;
  const selectedCustom = selected?.kind === "section" && isCustomSection(selected.id)
    ? design.customSections.find((s) => s.id === customId(selected.id)) ?? null
    : null;
  const selectedTextField = selected?.kind === "hero" ? textFields[selected.id] : undefined;

  const editorWidth = device === "mobile" ? "max-w-[430px]" : device === "tablet" ? "max-w-[820px]" : "max-w-[1500px]";

  if (live.loading && draft === live) {
    return <div className="py-12 text-sm text-muted">Loading Jembe Visual Studio…</div>;
  }

  return (
    <div className="-m-3 min-h-[calc(100vh-1.5rem)] bg-[#050505] rounded-2xl overflow-hidden border border-stroke">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-xl px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center text-bg shrink-0"><LayoutTemplate size={18} /></div>
            <div className="min-w-0">
              <p className="font-display text-xl truncate">Jembe Visual Studio</p>
              <p className="text-[10px] text-muted truncate">Click, drag, resize and edit the real website.</p>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[.03] p-1">
            <DeviceButton active={device === "desktop"} onClick={() => setDevice("desktop")}><Monitor size={13} />Desktop</DeviceButton>
            <DeviceButton active={device === "tablet"} onClick={() => setDevice("tablet")}><Tablet size={13} />Tablet</DeviceButton>
            <DeviceButton active={device === "mobile"} onClick={() => setDevice("mobile")}><Smartphone size={13} />Mobile</DeviceButton>
          </div>

          <div className="flex items-center gap-2">
            <IconButton label="Undo" onClick={undo} disabled={!history.length}><Undo2 size={14} /></IconButton>
            <IconButton label="Redo" onClick={redo} disabled={!future.length}><Redo2 size={14} /></IconButton>
            <button type="button" onClick={reset} className="hidden md:inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-muted hover:text-ink">Reset</button>
            <button type="button" onClick={save} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-ink text-bg px-4 py-2.5 text-xs font-medium disabled:opacity-50">
              {published ? <Check size={14} /> : <Save size={14} />}
              {busy ? "Publishing…" : published ? "Published" : "Publish"}
            </button>
          </div>
        </div>
        {error && <div className="mt-3 rounded-xl border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs text-red-300">{error}</div>}
      </header>

      <div className="grid min-h-[calc(100vh-6rem)] xl:grid-cols-[auto_minmax(0,1fr)_320px]">
        <aside className={`${layersOpen ? "w-[268px]" : "w-[58px]"} border-r border-white/10 bg-[#070707] transition-[width] duration-200 shrink-0 overflow-hidden`}>
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-3 py-3 border-b border-white/10">
              {layersOpen && <span className="text-[10px] uppercase tracking-[.18em] text-muted inline-flex items-center gap-2"><Layers3 size={13} />Layers</span>}
              <button type="button" onClick={() => setLayersOpen((v) => !v)} className="icon-btn" title={layersOpen ? "Collapse layers" : "Expand layers"}>
                {layersOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
              </button>
            </div>
            {layersOpen && (
              <div className="flex-1 overflow-y-auto p-3">
                <div className="rounded-xl border border-white/10 bg-white/[.025] p-2 mb-3">
                  <div className="flex items-center justify-between px-1 pb-2">
                    <span className="text-[10px] uppercase tracking-[.15em] text-muted">Page</span>
                    <div className="relative">
                      <button type="button" onClick={() => setAddOpen((v) => !v)} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[10px] text-muted hover:text-ink"><Plus size={11} />Add</button>
                      {addOpen && <div className="absolute right-0 mt-2 z-50 w-48 rounded-xl border border-white/10 bg-[#101010] p-1 shadow-2xl">
                        <AddMenuItem icon={<LayoutTemplate size={12} />} label="Blank section" onClick={() => addCustomSection("blank")} />
                        <AddMenuItem icon={<Play size={12} />} label="Call-to-action section" onClick={() => addCustomSection("cta")} />
                        <AddMenuItem icon={<Type size={12} />} label="Feature statement" onClick={() => addCustomSection("features")} />
                      </div>}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted leading-relaxed px-1">Click a section to select it. Drag is used only for hero elements so your responsive layout stays safe.</p>
                </div>

                <div className="space-y-1.5">
                  {design.sectionOrder.map((ref, index) => {
                    const visible = sectionVisible(design, ref);
                    const active = selected?.kind === "section" && selected.id === ref;
                    return (
                      <div key={ref} className={`rounded-xl border ${active ? "border-cyan-300/35 bg-cyan-300/[.06]" : "border-white/10 bg-white/[.02]"}`}>
                        <button type="button" onClick={() => setSelected({ kind: "section", id: ref })} className="w-full px-3 py-2.5 flex items-center gap-2 text-left">
                          <GripVertical size={13} className="text-muted" />
                          <span className="flex-1 text-xs font-medium truncate">{sectionLabel(design, ref)}</span>
                          <span
                            onClick={(e) => { e.stopPropagation(); toggleSection(ref); }}
                            className="p-1 text-muted hover:text-ink"
                            title={visible ? "Hide section" : "Show section"}
                          >{visible ? <Eye size={13} /> : <EyeOff size={13} />}</span>
                        </button>
                        <div className="flex border-t border-white/10">
                          <SmallAction disabled={index === 0} onClick={() => moveSection(ref, -1)} title="Move up"><ArrowUp size={11} /></SmallAction>
                          <SmallAction disabled={index === design.sectionOrder.length - 1} onClick={() => moveSection(ref, 1)} title="Move down"><ArrowDown size={11} /></SmallAction>
                          {isCustomSection(ref) && <SmallAction onClick={() => removeSection(ref)} title="Delete section" danger><Trash2 size={11} /></SmallAction>}
                        </div>

                        {ref === "hero" && (
                          <div className="border-t border-white/10 p-2 space-y-1">
                            {(Object.keys(heroLabels) as HeroElementId[]).map((id) => {
                              const activeHero = selected?.kind === "hero" && selected.id === id;
                              const el = design.hero.elements[id];
                              return <button key={id} type="button" onClick={() => setSelected({ kind: "hero", id })} className={`w-full rounded-lg px-2.5 py-2 flex items-center gap-2 text-[11px] ${activeHero ? "bg-white/10 text-ink" : "text-muted hover:text-ink hover:bg-white/[.03]"}`}>
                                <Move size={11} />
                                <span className="flex-1 text-left truncate">{heroLabels[id]}</span>
                                {el.locked ? <Lock size={10} /> : null}
                                <span onClick={(e) => { e.stopPropagation(); toggleHero(id); }} className="p-0.5">{el.visible ? <Eye size={11} /> : <EyeOff size={11} />}</span>
                              </button>;
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="min-w-0 bg-[#080808] flex flex-col">
          <div className="px-3 pt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[.03] p-1">
              <ToolbarModeButton active={mode === "edit"} onClick={() => setMode("edit")}><Move size={12} />Edit live</ToolbarModeButton>
              <ToolbarModeButton active={mode === "preview"} onClick={() => setMode("preview")}><Eye size={12} />Preview</ToolbarModeButton>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[10px] text-muted">
              <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />Live canvas</span>
              <span>Scroll inside the website • changes update instantly</span>
            </div>
            <div className="text-[10px] text-muted">{device === "desktop" ? "100%" : device === "tablet" ? "820px" : "430px"}</div>
          </div>

          <div className="flex-1 p-3 md:p-5 overflow-auto">
            <div className={`mx-auto ${editorWidth} transition-[max-width] duration-200`}>
              <div className="relative rounded-[28px] border border-white/10 bg-black overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,.45)]">
                <div className="h-9 border-b border-white/10 bg-[#101010] flex items-center px-3 gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" /><span className="w-2.5 h-2.5 rounded-full bg-yellow-300/70" /><span className="w-2.5 h-2.5 rounded-full bg-emerald-300/70" />
                  <div className="ml-3 flex-1 rounded-md bg-white/[.04] h-5 flex items-center px-2 text-[9px] text-muted">jembe.local /</div>
                  <Maximize2 size={12} className="text-muted" />
                </div>
                <div className="h-[calc(100vh-190px)] min-h-[700px] max-h-[1100px] bg-black">
                  <iframe
                    ref={iframeRef}
                    title="Jembe live website editor"
                    src={`/?jembeVisualPreview=1&jembeVisualEdit=${mode === "edit" ? "1" : "0"}&jembeVisualChrome=1&device=${device}`}
                    onLoad={() => setFrameReady(true)}
                    className="w-full h-full border-0 bg-black"
                    scrolling="yes"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className={`${propertiesOpen ? "w-full xl:w-[320px]" : "w-[58px]"} border-l border-white/10 bg-[#070707] transition-[width] duration-200 shrink-0`}>
          <div className="h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-3 py-3 border-b border-white/10">
              {propertiesOpen && <span className="text-[10px] uppercase tracking-[.18em] text-muted inline-flex items-center gap-2"><Palette size={13} />Properties</span>}
              <button type="button" onClick={() => setPropertiesOpen((v) => !v)} className="icon-btn" title={propertiesOpen ? "Collapse properties" : "Expand properties"}>{propertiesOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}</button>
            </div>

            {propertiesOpen && <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {selected?.kind === "hero" && selectedBox && (
                <>
                  <Panel title={heroLabels[selected.id]} icon={selected.id === "headline" ? <Type size={13} /> : <Move size={13} />}>
                    <div className="flex items-center gap-1 mb-3">
                      <ActionChip icon={selectedBox.visible ? <Eye size={12} /> : <EyeOff size={12} />} label={selectedBox.visible ? "Visible" : "Hidden"} onClick={() => toggleHero(selected.id)} />
                      <ActionChip icon={selectedBox.locked ? <Lock size={12} /> : <LockOpen size={12} />} label={selectedBox.locked ? "Locked" : "Unlocked"} onClick={() => toggleLock(selected.id)} />
                    </div>

                    {selectedTextField && <label className="block mb-4">
                      <span className="block text-[10px] uppercase tracking-[.13em] text-muted mb-1.5">Edit text here or directly on the page</span>
                      <textarea value={String(draft[selectedTextField])} onChange={(e) => patchContent(selectedTextField, e.target.value)} rows={selected.id === "headline" ? 5 : 4} className="admin-input resize-y" />
                    </label>}

                    {selected.id === "branding" && <div className="space-y-3 mb-4">
                      <label className="block"><span className="field-label">Site name</span><input value={draft.siteName} onChange={(e) => patchContent("siteName", e.target.value)} className="admin-input" /></label>
                      <label className="block"><span className="field-label">Motto</span><input value={draft.motto} onChange={(e) => patchContent("motto", e.target.value)} className="admin-input" /></label>
                    </div>}

                    {selected.id === "owner" && <UploadButton label="Replace owner photo" accept="image/*" onFile={async (file) => {
                      try { patchContent("heroOwnerImage", await uploadSiteMedia(file, "owner")); setError(""); } catch (err) { setError(err instanceof Error ? err.message : "Upload failed."); }
                    }} />}
                    {selected.id === "branding" && <div className="mt-2"><UploadButton label="Replace logo" accept="image/*" onFile={async (file) => {
                      try { patchContent("logoUrl", await uploadSiteMedia(file, "logo")); setError(""); } catch (err) { setError(err instanceof Error ? err.message : "Upload failed."); }
                    }} /></div>}

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <NumberField label="X" value={selectedBox.x} onChange={(v) => updateBox(selected.id, { x: clamp(v, 0, 100 - selectedBox.w) })} suffix="%" />
                      <NumberField label="Y" value={selectedBox.y} onChange={(v) => updateBox(selected.id, { y: clamp(v, 0, 100 - selectedBox.h) })} suffix="%" />
                      <NumberField label="W" value={selectedBox.w} onChange={(v) => updateBox(selected.id, { w: clamp(v, 4, 100 - selectedBox.x) })} suffix="%" />
                      <NumberField label="H" value={selectedBox.h} onChange={(v) => updateBox(selected.id, { h: clamp(v, 4, 100 - selectedBox.y) })} suffix="%" />
                    </div>

                    <p className="field-label mt-4 mb-2">Quick alignment</p>
                    <div className="grid grid-cols-6 gap-1">
                      <SquareButton title="Align left" onClick={() => alignSelected("left")}><AlignLeft size={13} /></SquareButton>
                      <SquareButton title="Center horizontally" onClick={() => alignSelected("center")}><AlignCenter size={13} /></SquareButton>
                      <SquareButton title="Align right" onClick={() => alignSelected("right")}><AlignRight size={13} /></SquareButton>
                      <SquareButton title="Align top" onClick={() => alignSelected("top")}><ArrowUp size={13} /></SquareButton>
                      <SquareButton title="Center vertically" onClick={() => alignSelected("middle")}><Move size={13} /></SquareButton>
                      <SquareButton title="Align bottom" onClick={() => alignSelected("bottom")}><ArrowDown size={13} /></SquareButton>
                    </div>

                    {(selected.id === "headline" || selected.id === "motto" || selected.id === "description" || selected.id === "eyebrow") && <>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {selected.id === "headline" && <NumberField label="Text scale" value={selectedBox.fontSize ?? 1} min={0.65} max={1.5} step={0.05} onChange={(v) => updateBox(selected.id, { fontSize: clamp(v, 0.65, 1.5) })} suffix="×" />}
                        {selected.id !== "headline" && <NumberField label="Opacity" value={selectedBox.opacity ?? 85} min={20} max={100} step={1} onChange={(v) => updateBox(selected.id, { opacity: clamp(v, 20, 100) })} suffix="%" />}
                      </div>
                      <div className="flex gap-1 mt-2">
                        {(["left", "center", "right"] as const).map((align) => <button key={align} type="button" onClick={() => updateBox(selected.id, { textAlign: align })} className={`flex-1 py-2 rounded-lg border text-[10px] ${selectedBox.textAlign === align ? "border-white/20 bg-white/10 text-ink" : "border-white/10 text-muted"}`}>{align}</button>)}
                      </div>
                    </>}

                    {(selected.id === "owner" || selected.id === "featured") && <NumberField label="Radius" value={selectedBox.radius ?? 24} min={0} max={48} step={1} onChange={(v) => updateBox(selected.id, { radius: clamp(v, 0, 48) })} suffix="px" />}

                    <button type="button" onClick={() => updateBox(selected.id, {
                      x: defaultSiteDesign.hero.elements[selected.id].x,
                      y: defaultSiteDesign.hero.elements[selected.id].y,
                      w: defaultSiteDesign.hero.elements[selected.id].w,
                      h: defaultSiteDesign.hero.elements[selected.id].h,
                      fontSize: defaultSiteDesign.hero.elements[selected.id].fontSize,
                      opacity: defaultSiteDesign.hero.elements[selected.id].opacity,
                      radius: defaultSiteDesign.hero.elements[selected.id].radius,
                      textAlign: defaultSiteDesign.hero.elements[selected.id].textAlign,
                    })} className="w-full mt-3 rounded-xl border border-white/10 px-3 py-2.5 text-[10px] text-muted hover:text-ink">Reset this element</button>
                  </Panel>

                  <Panel title="Smart arrange" icon={<Maximize2 size={13} />}>
                    <button type="button" onClick={magicArrange} className="w-full rounded-xl border border-cyan-300/20 bg-cyan-300/[.05] px-3 py-2.5 text-xs text-cyan-100 hover:bg-cyan-300/[.08]">Auto arrange hero</button>
                    <p className="text-[10px] text-muted mt-2">Keeps the owner, headline and featured card aligned to a balanced responsive composition.</p>
                  </Panel>
                </>
              )}

              {selected?.kind === "section" && <Panel title={sectionLabel(design, selected.id)} icon={<Layers3 size={13} />}>
                <div className="flex gap-2 mb-3">
                  <ActionChip icon={sectionVisible(design, selected.id) ? <Eye size={12} /> : <EyeOff size={12} />} label={sectionVisible(design, selected.id) ? "Visible" : "Hidden"} onClick={() => toggleSection(selected.id)} />
                  {isCustomSection(selected.id) && <button type="button" onClick={() => removeSection(selected.id)} className="flex-1 rounded-lg border border-red-400/20 text-red-300 text-[10px]">Delete</button>}
                </div>
                {selectedCustom && <>
                  <label className="block"><span className="field-label">Section title</span><input value={selectedCustom.title} onChange={(e) => patchDesign((d) => ({ ...d, customSections: d.customSections.map((s) => s.id === selectedCustom.id ? { ...s, title: e.target.value } : s) }))} className="admin-input" /></label>
                  <label className="block mt-3"><span className="field-label">Section content</span><textarea rows={6} value={selectedCustom.body} onChange={(e) => patchDesign((d) => ({ ...d, customSections: d.customSections.map((s) => s.id === selectedCustom.id ? { ...s, body: e.target.value } : s) }))} className="admin-input resize-y" /></label>
                </>}
                <p className="text-[10px] text-muted mt-3 leading-relaxed">Reorder this section from the Layers panel. Built-in sections remain responsive and safe.</p>
              </Panel>}

              <Panel title="Background media" icon={<Video size={13} />}>
                <MediaControl title="Hero" type={draft.heroBackgroundType} video={draft.heroBackgroundVideo} image={draft.heroBackgroundImage} onTypeChange={(v) => patchContent("heroBackgroundType", v)} onVideoChange={(v) => patchContent("heroBackgroundVideo", v)} onImageChange={(v) => patchContent("heroBackgroundImage", v)} onUpload={async (file, kind) => {
                  const url = await uploadSiteMedia(file, kind === "video" ? "background-video" : "background-image");
                  patchContent(kind === "video" ? "heroBackgroundVideo" : "heroBackgroundImage", url);
                  patchContent("heroBackgroundType", kind === "video" ? "video" : "image");
                }} />
                <MediaControl title="Lower page" type={draft.lowerBackgroundType} video={draft.lowerBackgroundVideo} image={draft.lowerBackgroundImage} onTypeChange={(v) => patchContent("lowerBackgroundType", v)} onVideoChange={(v) => patchContent("lowerBackgroundVideo", v)} onImageChange={(v) => patchContent("lowerBackgroundImage", v)} onUpload={async (file, kind) => {
                  const url = await uploadSiteMedia(file, kind === "video" ? "lower-video" : "lower-image");
                  patchContent(kind === "video" ? "lowerBackgroundVideo" : "lowerBackgroundImage", url);
                  patchContent("lowerBackgroundType", kind === "video" ? "video" : "image");
                }} />
                <div className="grid grid-cols-2 gap-2 mt-3"><NumberField label="Hero overlay" value={draft.heroOverlay} min={0} max={100} onChange={(v) => patchContent("heroOverlay", clamp(v, 0, 100))} suffix="%" /><NumberField label="Lower overlay" value={draft.lowerOverlay} min={0} max={100} onChange={(v) => patchContent("lowerOverlay", clamp(v, 0, 100))} suffix="%" /></div>
              </Panel>

              <Panel title="Global look" icon={<Palette size={13} />}>
                <ColorField label="Background" value={design.theme.bg} onChange={(v) => patchDesign((d) => ({ ...d, theme: { ...d.theme, bg: v } }))} />
                <ColorField label="Surface" value={design.theme.surface} onChange={(v) => patchDesign((d) => ({ ...d, theme: { ...d.theme, surface: v } }))} />
                <ColorField label="Accent A" value={design.theme.accentA} onChange={(v) => patchDesign((d) => ({ ...d, theme: { ...d.theme, accentA: v } }))} />
                <ColorField label="Accent B" value={design.theme.accentB} onChange={(v) => patchDesign((d) => ({ ...d, theme: { ...d.theme, accentB: v } }))} />
              </Panel>
            </div>}
          </div>
        </aside>
      </div>
    </div>
  );
}

function DeviceButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[10px] ${active ? "bg-white/10 text-ink" : "text-muted hover:text-ink"}`}>{children}</button>;
}
function ToolbarModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] ${active ? "bg-white/10 text-ink" : "text-muted hover:text-ink"}`}>{children}</button>;
}
function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return <button type="button" title={label} aria-label={label} onClick={onClick} disabled={disabled} className="icon-btn disabled:opacity-20">{children}</button>;
}
function SmallAction({ onClick, disabled, title, danger, children }: { onClick: () => void; disabled?: boolean; title: string; danger?: boolean; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} disabled={disabled} title={title} className={`flex-1 py-1.5 text-muted disabled:opacity-20 hover:text-ink ${danger ? "hover:text-red-300" : ""}`}>{children}</button>;
}
function AddMenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[10px] text-muted hover:text-ink hover:bg-white/[.05]">{icon}<span>{label}</span></button>;
}
function Panel({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-white/10 bg-white/[.025] p-3.5"> <div className="flex items-center gap-2 mb-3"><span className="text-muted">{icon}</span><p className="font-display text-base">{title}</p></div>{children}</section>;
}
function ActionChip({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex-1 rounded-lg border border-white/10 px-2.5 py-2 text-[10px] text-muted hover:text-ink inline-flex items-center justify-center gap-1.5">{icon}{label}</button>;
}
function SquareButton({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" title={title} aria-label={title} onClick={onClick} className="rounded-lg border border-white/10 bg-white/[.02] py-2 text-muted hover:text-ink hover:bg-white/[.05]">{children}</button>;
}
function UploadButton({ label, accept, onFile }: { label: string; accept: string; onFile: (file: File) => Promise<void> }) {
  return <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 px-3 py-3 text-[10px] text-muted hover:text-ink hover:bg-white/[.03] cursor-pointer"><Upload size={12} />{label}<input type="file" accept={accept} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void onFile(file); e.currentTarget.value = ""; }} /></label>;
}
function MediaControl({ title, type, video, image, onTypeChange, onVideoChange, onImageChange, onUpload }: {
  title: string; type: "video" | "image" | "none"; video: string; image: string;
  onTypeChange: (value: "video" | "image" | "none") => void;
  onVideoChange: (value: string) => void; onImageChange: (value: string) => void;
  onUpload: (file: File, kind: "video" | "image") => Promise<void>;
}) {
  return <div className="rounded-xl border border-white/10 p-3 mt-3 first:mt-0">
    <div className="flex items-center justify-between gap-2 mb-2"><p className="text-[11px] font-medium">{title}</p><select value={type} onChange={(e) => onTypeChange(e.target.value as "video" | "image" | "none")} className="admin-input w-auto text-[10px]"><option value="video">Video</option><option value="image">Photo</option><option value="none">None</option></select></div>
    {type === "video" && <input value={video} onChange={(e) => onVideoChange(e.target.value)} className="admin-input text-[10px]" placeholder="Video URL" />}
    {type === "image" && <input value={image} onChange={(e) => onImageChange(e.target.value)} className="admin-input text-[10px]" placeholder="Photo URL" />}
    <div className="grid grid-cols-2 gap-2 mt-2">
      <label className="cursor-pointer rounded-lg border border-dashed border-white/10 px-2 py-2 text-center text-[10px] text-muted hover:text-ink"><Video size={11} className="inline mr-1" />Upload video<input type="file" accept="video/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void onUpload(file, "video"); e.currentTarget.value = ""; }} /></label>
      <label className="cursor-pointer rounded-lg border border-dashed border-white/10 px-2 py-2 text-center text-[10px] text-muted hover:text-ink"><ImageIcon size={11} className="inline mr-1" />Upload photo<input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void onUpload(file, "image"); e.currentTarget.value = ""; }} /></label>
    </div>
  </div>;
}
function NumberField({ label, value, onChange, step = 1, min = 0, max = 100, suffix = "" }: { label: string; value: number; onChange: (value: number) => void; step?: number; min?: number; max?: number; suffix?: string }) {
  return <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/10 px-2 py-1.5"><span className="text-[9px] uppercase tracking-[.1em] text-muted flex-1">{label}</span><input type="number" value={Number.isFinite(value) ? value : 0} step={step} min={min} max={max} onChange={(e) => onChange(Number(e.target.value))} className="w-16 bg-transparent outline-none text-right text-[10px] text-ink" /><span className="text-[9px] text-muted w-3">{suffix}</span></label>;
}
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block mt-2"><span className="field-label">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} className="admin-input text-[10px]" /></label>;
}
function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

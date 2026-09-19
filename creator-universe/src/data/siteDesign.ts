export type SectionId = "hero" | "store" | "discovery" | "featuredWork" | "services" | "contact";
export type SectionRef = SectionId | `custom:${string}`;
export type HeroElementId = "branding" | "motto" | "owner" | "eyebrow" | "headline" | "description" | "buttons" | "featured";

export interface DesignBox {
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize?: number;
  opacity?: number;
  radius?: number;
  visible: boolean;
}

export interface SiteDesign {
  version: 1;
  sectionOrder: SectionRef[];
  sections: Record<SectionId, { visible: boolean }>;
  customSections: Array<{ id: string; title: string; body: string; visible: boolean }>;
  hero: {
    elements: Record<HeroElementId, DesignBox>;
    canvasMaxWidth: number;
    contentScale: number;
  };
  theme: {
    bg: string;
    surface: string;
    surface2: string;
    ink: string;
    muted: string;
    accentA: string;
    accentB: string;
    radius: number;
  };
}

export const defaultSiteDesign: SiteDesign = {
  version: 1,
  sectionOrder: ["hero", "store", "discovery", "featuredWork", "services", "contact"],
  sections: {
    hero: { visible: true },
    store: { visible: true },
    discovery: { visible: true },
    featuredWork: { visible: true },
    services: { visible: true },
    contact: { visible: true },
  },
  customSections: [],
  hero: {
    canvasMaxWidth: 1240,
    contentScale: 1,
    elements: {
      branding: { x: 5, y: 9, w: 17, h: 11, fontSize: 1, visible: true },
      motto: { x: 5, y: 21, w: 18, h: 8, fontSize: 0.82, visible: true, opacity: 72 },
      owner: { x: 4.4, y: 30, w: 18, h: 53, fontSize: 1, visible: true, radius: 24 },
      eyebrow: { x: 28, y: 13, w: 41, h: 6, fontSize: 0.9, visible: true },
      headline: { x: 28, y: 22, w: 47, h: 31, fontSize: 1.08, visible: true },
      description: { x: 28, y: 58, w: 44, h: 13, fontSize: 1, visible: true, opacity: 85 },
      buttons: { x: 28, y: 73, w: 44, h: 10, fontSize: 1, visible: true },
      featured: { x: 76, y: 13, w: 20, h: 61, fontSize: 1, visible: true, radius: 24 },
    },
  },
  theme: {
    bg: "0 0% 4%",
    surface: "0 0% 8%",
    surface2: "0 0% 11%",
    ink: "40 20% 96%",
    muted: "0 0% 55%",
    accentA: "190 90% 70%",
    accentB: "239 84% 67%",
    radius: 24,
  },
};

export function normalizeSiteDesign(value: unknown): SiteDesign {
  if (!value || typeof value !== "object") return structuredClone(defaultSiteDesign);
  const incoming = value as Partial<SiteDesign>;
  const base = structuredClone(defaultSiteDesign);
  if (Array.isArray(incoming.sectionOrder)) base.sectionOrder = incoming.sectionOrder.filter(Boolean) as SectionRef[];
  if (Array.isArray(incoming.customSections)) base.customSections = incoming.customSections.filter((s): s is { id: string; title: string; body: string; visible: boolean } => Boolean(s && typeof s === "object" && typeof (s as any).id === "string"));
  if (incoming.sections && typeof incoming.sections === "object") {
    for (const key of Object.keys(base.sections) as SectionId[]) {
      const incomingSection = (incoming.sections as Record<string, { visible?: boolean }>)[key];
      if (incomingSection && typeof incomingSection.visible === "boolean") base.sections[key].visible = incomingSection.visible;
    }
  }
  if (incoming.hero && typeof incoming.hero === "object") {
    const hero = incoming.hero as Partial<SiteDesign["hero"]>;
    if (typeof hero.canvasMaxWidth === "number") base.hero.canvasMaxWidth = Math.max(900, Math.min(1600, hero.canvasMaxWidth));
    if (typeof hero.contentScale === "number") base.hero.contentScale = Math.max(0.8, Math.min(1.2, hero.contentScale));
    if (hero.elements && typeof hero.elements === "object") {
      for (const key of Object.keys(base.hero.elements) as HeroElementId[]) {
        const src = (hero.elements as Record<string, Partial<DesignBox>>)[key];
        if (!src) continue;
        const target = base.hero.elements[key];
        for (const prop of ["x", "y", "w", "h", "fontSize", "opacity", "radius"] as const) {
          const n = src[prop];
          if (typeof n === "number" && Number.isFinite(n)) target[prop] = n;
        }
        if (typeof src.visible === "boolean") target.visible = src.visible;
      }
    }
  }
  if (incoming.theme && typeof incoming.theme === "object") {
    const theme = incoming.theme as Partial<SiteDesign["theme"]>;
    for (const key of Object.keys(base.theme) as (keyof SiteDesign["theme"])[]) {
      const v = theme[key];
      if (typeof v === "string") (base.theme[key] as string) = v;
      if (typeof v === "number") (base.theme[key] as number) = v;
    }
  }
  base.sectionOrder = Array.from(new Set([...base.sectionOrder, ...defaultSiteDesign.sectionOrder])) as SectionRef[];
  for (const custom of base.customSections) {
    const ref = `custom:${custom.id}` as SectionRef;
    if (!base.sectionOrder.includes(ref)) base.sectionOrder.push(ref);
  }
  return base;
}

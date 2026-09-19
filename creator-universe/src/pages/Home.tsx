import React, { useEffect } from "react";
import Hero from "../sections/Hero";
import StorePreview from "../sections/StorePreview";
import Discovery from "../sections/Discovery";
import FeaturedWork from "../sections/FeaturedWork";
import Services from "../sections/Services";
import Contact from "../sections/Contact";
import { useSiteContent } from "../hooks/useSiteContent";

export default function Home() {
  const site = useSiteContent();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bg", site.design.theme.bg);
    root.style.setProperty("--surface", site.design.theme.surface);
    root.style.setProperty("--surface-2", site.design.theme.surface2);
    root.style.setProperty("--ink", site.design.theme.ink);
    root.style.setProperty("--muted", site.design.theme.muted);
    root.style.setProperty("--accent-a", site.design.theme.accentA);
    root.style.setProperty("--accent-b", site.design.theme.accentB);
  }, [site.design]);

  const builtIn: Record<string, React.ReactNode> = {
    hero: site.heroVisible && site.design.sections.hero.visible ? <Hero /> : null,
    store: site.design.sections.store.visible ? <StorePreview /> : null,
    discovery: site.design.sections.discovery.visible ? <Discovery /> : null,
    featuredWork: site.design.sections.featuredWork.visible ? <FeaturedWork /> : null,
    services: site.design.sections.services.visible ? <Services /> : null,
    contact: site.design.sections.contact.visible ? <Contact /> : null,
  };
  const customById = new Map(site.design.customSections.map(s => [s.id, s]));

  return <>{site.design.sectionOrder.map(id => {
    const isCustom = id.startsWith("custom:");
    if (!isCustom) return <React.Fragment key={id}>{builtIn[id]}</React.Fragment>;
    const custom = customById.get(id.slice(7));
    if (!custom?.visible) return null;
    return <section key={id} className="px-6 py-24"><div className="max-w-content mx-auto"><p className="text-xs uppercase tracking-[.2em] text-muted mb-4">Jembe</p><h2 className="font-display text-4xl md:text-6xl tracking-tight max-w-4xl">{custom.title}</h2><p className="mt-6 text-muted max-w-2xl leading-relaxed whitespace-pre-line">{custom.body}</p></div></section>;
  })}</>;
}

import React, { useEffect, useRef } from "react";
import Hero from "../sections/Hero";
import StorePreview from "../sections/StorePreview";
import Discovery from "../sections/Discovery";
import FeaturedWork from "../sections/FeaturedWork";
import Services from "../sections/Services";
import Contact from "../sections/Contact";
import { useSiteContent } from "../hooks/useSiteContent";

function LowerBackground({
  type,
  video,
  image,
  overlay,
  children,
}: {
  type: "video" | "image" | "none";
  video: string;
  image: string;
  overlay: number;
  children: React.ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || type !== "video" || !video) return;
    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;
    const play = () => el.play().catch(() => undefined);
    play();
    const onVisibility = () => { if (document.visibilityState === "visible") play(); };
    const onPause = () => { if (document.visibilityState === "visible") play(); };
    document.addEventListener("visibilitychange", onVisibility);
    el.addEventListener("canplay", play);
    el.addEventListener("pause", onPause);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      el.removeEventListener("canplay", play);
      el.removeEventListener("pause", onPause);
    };
  }, [type, video]);

  return (
    <div className="relative isolate overflow-hidden">
      {type !== "none" && (
        <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
          {type === "video" && video ? (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay loop muted playsInline preload="metadata"
              poster={image || undefined}
            >
              <source src={video} type="video/mp4" />
            </video>
          ) : null}
          {type === "image" && image ? (
            <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-black" style={{ opacity: Math.max(0, Math.min(100, overlay)) / 100 }} />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/55 via-bg/55 to-bg/90" />
          <div className="absolute inset-0 noise opacity-30" />
        </div>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

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

  const renderSection = (id: string) => {
    const isCustom = id.startsWith("custom:");
    if (!isCustom) return <React.Fragment key={id}>{builtIn[id]}</React.Fragment>;
    const custom = customById.get(id.slice(7));
    if (!custom?.visible) return null;
    return (
      <section key={id} className="px-6 py-24">
        <div className="max-w-content mx-auto">
          <p className="text-xs uppercase tracking-[.2em] text-muted mb-4">Jembe</p>
          <h2 className="font-display text-4xl md:text-6xl tracking-tight max-w-4xl">{custom.title}</h2>
          <p className="mt-6 text-muted max-w-2xl leading-relaxed whitespace-pre-line">{custom.body}</p>
        </div>
      </section>
    );
  };

  const nonHero = site.design.sectionOrder.filter((id) => id !== "hero");
  const heroPresent = site.design.sectionOrder.includes("hero");

  return (
    <>
      {site.design.sectionOrder.map((id) => (id === "hero" ? renderSection(id) : null))}
      {nonHero.length > 0 && (
        <LowerBackground
          type={site.lowerBackgroundType}
          video={site.lowerBackgroundVideo}
          image={site.lowerBackgroundImage}
          overlay={site.lowerOverlay}
        >
          {nonHero.map(renderSection)}
        </LowerBackground>
      )}
      {!heroPresent && nonHero.length === 0 ? null : null}
    </>
  );
}

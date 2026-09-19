import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ReactNode, PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import MagneticButton from "../components/MagneticButton";
import AnimatedText from "../components/AnimatedText";
import { useProductsStore } from "../hooks/useContentStore";
import { useSiteContent } from "../hooks/useSiteContent";
import type { DesignBox, HeroElementId } from "../data/siteDesign";

function isVisualEditMode() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("jembeVisualPreview") === "1" && params.get("jembeVisualEdit") === "1";
}

function visualDevice() {
  if (typeof window === "undefined") return "desktop";
  return new URLSearchParams(window.location.search).get("device") || "desktop";
}

export default function Hero() {
  const site = useSiteContent();
  const { items } = useProductsStore();
  const featured = items.find((p) => p.featured && p.status === "live") ?? items.find((p) => p.status === "live");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const visualEdit = isVisualEditMode();
  const [selectedVisualId, setSelectedVisualId] = useState<HeroElementId | null>(null);

  useEffect(() => {
    if (!visualEdit) return;
    const receiveSelection = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !event.data) return;
      if (event.data.type === "jembe-visual-select-current" && typeof event.data.id === "string") {
        setSelectedVisualId(event.data.id as HeroElementId);
      }
    };
    window.addEventListener("message", receiveSelection);
    return () => window.removeEventListener("message", receiveSelection);
  }, [visualEdit]);

  const updateInline = (field: string, value: string) => {
    postVisual({ type: "jembe-visual-text-input", field, value });
  };

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 150, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 150, damping: 18 });
  const translateX = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 18 });
  const translateY = useSpring(useTransform(y, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 18 });

  const handleMouseMove = (e: ReactMouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || site.heroBackgroundType !== "video" || !site.heroBackgroundVideo) return;
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    const forcePlay = () => {
      if (document.visibilityState !== "visible") return;
      video.play().catch(() => undefined);
    };
    const listeners = ["canplay", "loadeddata", "stalled", "waiting"] as const;
    listeners.forEach((event) => video.addEventListener(event, forcePlay));
    const onVisibility = () => forcePlay();
    const onPause = () => forcePlay();
    document.addEventListener("visibilitychange", onVisibility);
    video.addEventListener("pause", onPause);
    forcePlay();
    return () => {
      listeners.forEach((event) => video.removeEventListener(event, forcePlay));
      document.removeEventListener("visibilitychange", onVisibility);
      video.removeEventListener("pause", onPause);
    };
  }, [site.heroBackgroundType, site.heroBackgroundVideo]);

  const postVisual = (message: Record<string, unknown>) => {
    if (!visualEdit || window.parent === window) return;
    window.parent.postMessage(message, window.location.origin);
  };

  return (
    <section
      data-jembe-section-id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      className="relative isolate min-h-[100svh] flex flex-col justify-center overflow-hidden pt-28 pb-16"
    >
      <div className="absolute inset-0 z-0 overflow-hidden bg-black" aria-hidden="true">
        {site.heroBackgroundType === "video" && site.heroBackgroundVideo ? (
          <video
            ref={videoRef}
            key={site.heroBackgroundVideo}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay loop muted playsInline disablePictureInPicture preload="auto"
            poster={site.heroBackgroundImage || "/media/jembe-background-poster.jpg"}
            onPause={(e) => {
              if (document.visibilityState === "visible") e.currentTarget.play().catch(() => undefined);
            }}
          >
            <source src={site.heroBackgroundVideo} type="video/mp4" />
          </video>
        ) : site.heroBackgroundType === "image" && site.heroBackgroundImage ? (
          <img src={site.heroBackgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-black" style={{ opacity: Math.max(0, Math.min(100, site.heroOverlay)) / 100 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/25 to-bg" />
        <div className="absolute inset-0 noise opacity-60" />
      </div>

      <div className="relative z-10 max-w-content mx-auto px-6 w-full" style={{ maxWidth: `${site.design.hero.canvasMaxWidth}px` }}>
        <div data-jembe-hero-canvas className="relative min-h-[72svh] lg:min-h-[78svh]">
          <HeroLayer box={site.design.hero.elements.branding} visualId="branding" visualEdit={visualEdit} selected={selectedVisualId === "branding"} postVisual={postVisual} className="hidden lg:block">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="flex items-center gap-3">
              {site.logoUrl ? (
                <img src={site.logoUrl} alt={site.logoText || site.siteName} className="w-16 h-16 rounded-[1.35rem] object-cover border border-white/20 shadow-2xl" />
              ) : (
                <div className="w-16 h-16 rounded-[1.35rem] accent-gradient p-px shadow-2xl"><div className="w-full h-full rounded-[1.3rem] bg-black/80 backdrop-blur flex items-center justify-center font-display text-lg">{site.logoText || site.siteName.slice(0, 2).toUpperCase()}</div></div>
              )}
              <p className="font-display text-base">{site.siteName}</p>
            </motion.div>
          </HeroLayer>

          <HeroLayer box={site.design.hero.elements.motto} visualId="motto" visualEdit={visualEdit} selected={selectedVisualId === "motto"} postVisual={postVisual} className="hidden lg:block">
            {site.motto && <p contentEditable={visualEdit} suppressContentEditableWarning onInput={(e) => updateInline("motto", e.currentTarget.innerText)} className="text-[11px] leading-relaxed text-white/65 max-w-[220px] outline-none">{site.motto}</p>}
          </HeroLayer>

          {site.showOwnerPhoto && (
            <HeroLayer box={site.design.hero.elements.owner} visualId="owner" visualEdit={visualEdit} selected={selectedVisualId === "owner"} postVisual={postVisual} className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}
                style={{ rotateX, rotateY, x: translateX, y: translateY, transformStyle: "preserve-3d", borderRadius: `${site.design.hero.elements.owner.radius ?? 24}px` }}
                className="relative h-full w-full border border-white/15 bg-white/5 backdrop-blur-xl p-2 shadow-2xl overflow-hidden"
              >
                <div className="h-full rounded-[1.35rem] overflow-hidden relative bg-white/5">
                  {site.heroOwnerImage ? <img src={site.heroOwnerImage} alt={`Owner of ${site.siteName}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-center px-5 bg-[radial-gradient(circle_at_50%_25%,rgba(255,255,255,.15),transparent_36%),linear-gradient(145deg,#171717,#050505)]"><div className="w-20 h-20 rounded-full accent-gradient mb-4" /><p className="font-display text-lg">Owner portrait</p><p className="text-white/45 text-xs mt-2 leading-relaxed">Upload the owner photo from Admin → Visual Studio.</p></div>}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent"><p className="text-[10px] text-white/55 uppercase tracking-[.2em]">Founder</p><p className="font-display text-sm mt-1">{site.siteName}</p></div>
                </div>
              </motion.div>
            </HeroLayer>
          )}

          <HeroLayer box={site.design.hero.elements.eyebrow} visualId="eyebrow" visualEdit={visualEdit} selected={selectedVisualId === "eyebrow"} postVisual={postVisual}><motion.p contentEditable={visualEdit} suppressContentEditableWarning onInput={(e) => updateInline("heroEyebrow", e.currentTarget.innerText)} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="text-sm text-white/75 outline-none">{site.heroEyebrow}</motion.p></HeroLayer>

          <HeroLayer box={site.design.hero.elements.headline} visualId="headline" visualEdit={visualEdit} selected={selectedVisualId === "headline"} postVisual={postVisual}>
            {visualEdit ? (
              <motion.h1 contentEditable suppressContentEditableWarning onInput={(e) => updateInline("heroHeadline", e.currentTarget.innerText)} className="font-display text-[clamp(4rem,8.2vw,8.8rem)] leading-[0.86] tracking-[-.055em] drop-shadow-2xl outline-none" style={{ transform: `scale(${site.design.hero.elements.headline.fontSize ?? 1})`, transformOrigin: "left top" }}>{site.heroHeadline}</motion.h1>
            ) : (
              <AnimatedText as="h1" text={site.heroHeadline} delay={0.15} className="font-display text-[clamp(4rem,8.2vw,8.8rem)] leading-[0.86] tracking-[-.055em] drop-shadow-2xl" style={{ transform: `scale(${site.design.hero.elements.headline.fontSize ?? 1})`, transformOrigin: "left top" }} />
            )}
          </HeroLayer>

          <HeroLayer box={site.design.hero.elements.description} visualId="description" visualEdit={visualEdit} selected={selectedVisualId === "description"} postVisual={postVisual}><motion.p contentEditable={visualEdit} suppressContentEditableWarning onInput={(e) => updateInline("heroDescription", e.currentTarget.innerText)} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.7 }} className="text-white text-base md:text-lg max-w-2xl leading-relaxed outline-none">{site.heroDescription}</motion.p></HeroLayer>

          <HeroLayer box={site.design.hero.elements.buttons} visualId="buttons" visualEdit={visualEdit} selected={selectedVisualId === "buttons"} postVisual={postVisual}><motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.85 }} className="flex flex-wrap items-center gap-4"><MagneticButton href="/store" className="bg-white text-black rounded-full px-7 py-3.5 text-sm font-medium gap-2 hover:bg-white/90 transition-colors">Browse the store <ArrowUpRight size={15} /></MagneticButton><MagneticButton href="/portfolio" className="border border-white/20 rounded-full px-7 py-3.5 text-sm gap-2 bg-white/5 backdrop-blur">See the work</MagneticButton></motion.div></HeroLayer>

          {site.showFeaturedProduct && featured ? (
            <HeroLayer box={site.design.hero.elements.featured} visualId="featured" visualEdit={visualEdit} selected={selectedVisualId === "featured"} postVisual={postVisual} className="hidden lg:block"><motion.div initial={{ opacity: 0, scale: 0.94, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1, delay: 0.45 }} className="h-full w-full rounded-[1.8rem] border border-white/15 bg-black/55 backdrop-blur-xl p-3 shadow-2xl" style={{ borderRadius: `${site.design.hero.elements.featured.radius ?? 24}px` }}><div className="aspect-[4/3] rounded-[1.4rem] overflow-hidden bg-white/5"><img src={featured.image} alt={featured.name} className="w-full h-full object-cover" /></div><div className="p-4"><p className="text-xs text-white/45">{featured.category}</p><p className="font-display text-xl mt-1">{featured.name}</p><p className="text-xs text-white/55 mt-2">{featured.isFree ? "Free download" : `${featured.currency} ${featured.price}`}</p></div></motion.div></HeroLayer>
          ) : null}

          <div className="lg:hidden pt-10 space-y-7">{site.showOwnerPhoto && site.heroOwnerImage && <div className="max-w-sm rounded-3xl overflow-hidden border border-white/15 bg-white/5 p-2"><img src={site.heroOwnerImage} alt={`Owner of ${site.siteName}`} className="w-full aspect-[4/5] object-cover rounded-2xl" /></div>}{site.logoUrl && <img src={site.logoUrl} alt={site.siteName} className="w-16 h-16 rounded-2xl object-cover border border-white/20" />}{site.motto && <p className="text-xs text-white/55 max-w-xs">{site.motto}</p>}</div>
        </div>
      </div>

      <div className="absolute z-10 bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"><span className="text-[11px] text-white/50 tracking-wide">Scroll</span><span className="relative w-px h-10 bg-white/20 overflow-hidden"><span className="absolute inset-x-0 top-0 h-3 bg-white animate-scrolldown" /></span></div>
    </section>
  );
}

function HeroLayer({
  box,
  children,
  className = "",
  visualId,
  visualEdit = false,
  selected = false,
  postVisual = () => undefined,
}: {
  box: DesignBox;
  children: ReactNode;
  className?: string;
  visualId?: HeroElementId;
  visualEdit?: boolean;
  selected?: boolean;
  postVisual?: (message: Record<string, unknown>) => void;
}) {
  if (!box.visible) return null;

  const startRef = { x: box.x, y: box.y, w: box.w, h: box.h };

  const postDrag = (event: ReactPointerEvent<HTMLElement>, mode: "move" | "resize", direction = "se") => {
    if (!visualEdit || visualDevice() === "mobile" || !visualId || box.locked) return;
    const editable = (event.target as HTMLElement | null)?.closest('[contenteditable="true"]');
    if (editable) {
      event.stopPropagation();
      postVisual({ type: "jembe-visual-select", kind: "hero", id: visualId });
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const canvas = event.currentTarget.closest("[data-jembe-hero-canvas]") as HTMLElement | null;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    postVisual({ type: "jembe-visual-select", kind: "hero", id: visualId });
    postVisual({ type: "jembe-visual-drag-start", id: visualId, box: startRef });

    const snap = (value: number) => Math.round(value / 2) * 2;
    const onMove = (ev: PointerEvent) => {
      const dx = ((ev.clientX - startX) / rect.width) * 100;
      const dy = ((ev.clientY - startY) / rect.height) * 100;
      if (mode === "move") {
        postVisual({
          type: "jembe-visual-drag-patch",
          id: visualId,
          x: Math.max(0, Math.min(100 - box.w, snap(startRef.x + dx))),
          y: Math.max(0, Math.min(100 - box.h, snap(startRef.y + dy))),
        });
        return;
      }
      let nextW = startRef.w;
      let nextH = startRef.h;
      let nextX = startRef.x;
      let nextY = startRef.y;
      const sx = direction.includes("w") ? -dx : dx;
      const sy = direction.includes("n") ? -dy : dy;
      if (direction.includes("e")) nextW = snap(startRef.w + dx);
      if (direction.includes("w")) { nextW = snap(startRef.w - dx); nextX = snap(startRef.x + dx); }
      if (direction.includes("s")) nextH = snap(startRef.h + dy);
      if (direction.includes("n")) { nextH = snap(startRef.h - dy); nextY = snap(startRef.y + dy); }
      if (!Number.isFinite(sx) || !Number.isFinite(sy)) return;
      nextW = Math.max(4, Math.min(100 - nextX, nextW));
      nextH = Math.max(4, Math.min(100 - nextY, nextH));
      nextX = Math.max(0, Math.min(100 - nextW, nextX));
      nextY = Math.max(0, Math.min(100 - nextH, nextY));
      postVisual({ type: "jembe-visual-resize-patch", id: visualId, x: nextX, y: nextY, w: nextW, h: nextH });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      postVisual({ type: "jembe-visual-drag-end", id: visualId });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
  };

  return (
    <div
      data-jembe-visual-id={visualId}
      onPointerDown={(event) => postDrag(event, "move")}
      onClick={(event) => {
        if (!visualEdit || !visualId) return;
        event.stopPropagation();
        postVisual({ type: "jembe-visual-select", kind: "hero", id: visualId });
      }}
      className={`${visualEdit && visualId ? "cursor-grab select-none" : ""} ${className}`}
      style={{
        left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%`,
        opacity: (box.opacity ?? 100) / 100,
        textAlign: box.textAlign ?? "left",
        touchAction: visualEdit ? "none" : undefined,
      }}
    >
      {visualEdit && visualId ? (
        <>
          <div className={`absolute -inset-1 z-50 rounded-xl border pointer-events-none ${selected ? "border-cyan-200 shadow-[0_0_0_2px_rgba(103,232,249,.12),0_0_28px_rgba(34,211,238,.12)]" : "border-cyan-300/25 hover:border-cyan-200/70"}`} />
          {selected && !box.locked ? (
            <div className="absolute -inset-2 z-[60] pointer-events-none">
              {(["nw","ne","sw","se"] as const).map((direction) => {
                const position = direction === "nw" ? "-left-1 -top-1" : direction === "ne" ? "-right-1 -top-1" : direction === "sw" ? "-left-1 -bottom-1" : "-right-1 -bottom-1";
                return <button key={direction} type="button" data-resize={direction} aria-label={`Resize ${direction}`} onPointerDown={(event) => { event.stopPropagation(); postDrag(event, "resize", direction); }} className={`pointer-events-auto absolute ${position} w-3 h-3 rounded-[3px] bg-cyan-200 border border-slate-900 shadow-lg`} />;
              })}
              <div className="absolute -top-7 left-0 pointer-events-none rounded-md bg-black/85 px-2 py-1 text-[9px] uppercase tracking-[.12em] text-cyan-100 border border-cyan-300/20 whitespace-nowrap">
                {box.locked ? "Locked" : "Drag · resize"}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
      {children}
    </div>
  );
}

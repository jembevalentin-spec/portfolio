import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import { ArrowUpRight, PlayCircle } from "lucide-react";
import MagneticButton from "../components/MagneticButton";
import AnimatedText from "../components/AnimatedText";
import { useProductsStore } from "../hooks/useContentStore";
import { useSiteContent } from "../hooks/useSiteContent";

export default function Hero() {
  const site = useSiteContent();
  const { items } = useProductsStore();
  const featured = items.find((p) => p.featured && p.status === "live") ?? items.find((p) => p.status === "live");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 150, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 150, damping: 18 });
  const translateX = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 18 });
  const translateY = useSpring(useTransform(y, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 18 });

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
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
    if (!video || !site.heroBackgroundVideo) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");

    const forcePlay = () => {
      if (document.visibilityState !== "visible") return;
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") attempt.catch(() => undefined);
    };

    const onCanPlay = () => forcePlay();
    const onLoadedData = () => forcePlay();
    const onVisibility = () => forcePlay();
    const onStalled = () => forcePlay();
    const onWaiting = () => forcePlay();

    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("stalled", onStalled);
    video.addEventListener("waiting", onWaiting);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointerdown", forcePlay, { once: true, passive: true });

    forcePlay();

    return () => {
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("stalled", onStalled);
      video.removeEventListener("waiting", onWaiting);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointerdown", forcePlay);
    };
  }, [site.heroBackgroundVideo]);

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      className="relative isolate min-h-[100svh] flex flex-col justify-center overflow-hidden pt-28 pb-16"
    >
      <div className="absolute inset-0 z-0 overflow-hidden bg-black" aria-hidden="true">
        {site.heroBackgroundVideo ? (
          <video
            ref={videoRef}
            key={site.heroBackgroundVideo}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
            preload="auto"
            poster={site.heroBackgroundImage || "/media/jembe-background-poster.jpg"}
            onPause={(e) => {
              if (document.visibilityState === "visible") {
                e.currentTarget.play().catch(() => undefined);
              }
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          >
            <source src={site.heroBackgroundVideo} type="video/mp4" />
          </video>
        ) : null}
        {!site.heroBackgroundVideo && site.heroBackgroundImage ? (
          <img src={site.heroBackgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : null}
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: Math.max(0, Math.min(100, site.heroOverlay)) / 100 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/25 to-bg" />
        <div className="absolute inset-0 noise opacity-60" />
      </div>

      <div className="relative z-10 max-w-content mx-auto px-6 w-full grid lg:grid-cols-[220px_minmax(0,1fr)_310px] gap-8 lg:gap-10 items-center">
        <div className="order-1 flex flex-col items-center lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center lg:items-start"
          >
            {site.logoUrl ? (
              <img
                src={site.logoUrl}
                alt={site.logoText || site.siteName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.35rem] object-cover border border-white/20 shadow-2xl"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.35rem] accent-gradient p-px shadow-2xl">
                <div className="w-full h-full rounded-[1.3rem] bg-black/80 backdrop-blur flex items-center justify-center font-display text-base sm:text-lg">
                  {site.logoText || site.siteName.slice(0, 2).toUpperCase()}
                </div>
              </div>
            )}
            <p className="font-display text-base mt-4">{site.siteName}</p>
            {site.motto && <p className="text-[11px] leading-relaxed text-white/55 mt-1.5 max-w-[190px]">{site.motto}</p>}
          </motion.div>

          {site.showOwnerPhoto && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              style={{ rotateX, rotateY, x: translateX, y: translateY, transformStyle: "preserve-3d" }}
              className="relative mt-6 w-[190px] sm:w-[210px] h-[240px] sm:h-[275px] rounded-[1.7rem] border border-white/15 bg-white/5 backdrop-blur-xl p-2 shadow-2xl overflow-hidden"
            >
              <div className="h-full rounded-[1.35rem] overflow-hidden relative bg-white/5">
                {site.heroOwnerImage ? (
                  <img
                    src={site.heroOwnerImage}
                    alt={`Owner of ${site.siteName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center px-5 bg-[radial-gradient(circle_at_50%_25%,rgba(255,255,255,.15),transparent_36%),linear-gradient(145deg,#171717,#050505)]">
                    <div className="w-20 h-20 rounded-full accent-gradient mb-4" />
                    <p className="font-display text-lg">Owner portrait</p>
                    <p className="text-white/45 text-xs mt-2 leading-relaxed">Upload the owner photo from Admin → Site content.</p>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-[10px] text-white/55 uppercase tracking-[.2em]">Founder</p>
                  <p className="font-display text-sm mt-1">{site.siteName}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="order-2 lg:pl-2">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-sm text-white/75 mb-5"
          >
            {site.heroEyebrow}
          </motion.p>
          <AnimatedText
            as="h1"
            text={site.heroHeadline}
            delay={0.15}
            className="font-display text-[clamp(4.2rem,8vw,8.5rem)] leading-[0.86] tracking-[-.055em] max-w-5xl drop-shadow-2xl"
          />
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-8 text-white/80 text-base md:text-lg max-w-2xl leading-relaxed"
          >
            {site.heroDescription}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <MagneticButton href="/store" className="bg-white text-black rounded-full px-7 py-3.5 text-sm font-medium gap-2 hover:bg-white/90 transition-colors">
              Browse the store <ArrowUpRight size={15} />
            </MagneticButton>
            <MagneticButton href="/portfolio" className="border border-white/20 rounded-full px-7 py-3.5 text-sm gap-2 bg-white/5 backdrop-blur">
              See the work
            </MagneticButton>
          </motion.div>
          <div className="mt-8 flex items-center gap-3 text-[11px] uppercase tracking-[.24em] text-white/45">
            <PlayCircle size={14} />
            <span>Live background • muted</span>
          </div>
        </div>

        <div className="order-3 relative hidden lg:block min-h-[520px]" style={{ perspective: 1400 }}>
          {site.showFeaturedProduct && featured ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.45 }}
              className="absolute right-0 bottom-4 w-[310px] rounded-[1.8rem] border border-white/15 bg-black/55 backdrop-blur-xl p-3 shadow-2xl"
            >
              <div className="aspect-[4/3] rounded-[1.4rem] overflow-hidden bg-white/5">
                <img src={featured.image} alt={featured.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <p className="text-xs text-white/45">{featured.category}</p>
                <p className="font-display text-xl mt-1">{featured.name}</p>
                <p className="text-xs text-white/55 mt-2">
                  {featured.isFree ? "Free download" : `${featured.currency} ${featured.price}`}
                </p>
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>

      <div className="absolute z-10 bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <span className="text-[11px] text-white/50 tracking-wide">Scroll</span>
        <span className="relative w-px h-10 bg-white/20 overflow-hidden">
          <span className="absolute inset-x-0 top-0 h-3 bg-white animate-scrolldown" />
        </span>
      </div>
    </section>
  );
}

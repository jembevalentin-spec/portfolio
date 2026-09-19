import { useState } from "react";
import { motion } from "framer-motion";
import SectionHeading from "../components/SectionHeading";

const services = [
  {
    n: "01",
    title: "Android apps",
    desc: "Native, offline-first apps built with Kotlin and Jetpack Compose.",
    image: "https://picsum.photos/seed/service-android/700/500",
  },
  {
    n: "02",
    title: "Websites",
    desc: "Fast, motion-driven sites and web apps built with React and Tailwind.",
    image: "https://picsum.photos/seed/service-web/700/500",
  },
  {
    n: "03",
    title: "Digital products",
    desc: "Templates, toolkits, and components sold ready to use.",
    image: "https://picsum.photos/seed/service-products/700/500",
  },
  {
    n: "04",
    title: "UI/UX experiments",
    desc: "Interaction studies exploring motion, layout, and interface ideas.",
    image: "https://picsum.photos/seed/service-uiux/700/500",
  },
];

export default function Services() {
  const [hovered, setHovered] = useState<string | null>(null);
  const active = services.find((s) => s.n === hovered);

  return (
    <section data-jembe-section-id="services" className="py-24 md:py-32 border-t border-stroke">
      <div className="max-w-content mx-auto px-6">
        <SectionHeading label="What I create" heading="Four kinds of work." />

        <div className="mt-16 grid lg:grid-cols-[1.3fr_1fr] gap-12 items-start">
          <div className="border-t border-stroke">
            {services.map((s) => (
              <div
                key={s.n}
                onMouseEnter={() => setHovered(s.n)}
                onMouseLeave={() => setHovered(null)}
                className="group border-b border-stroke py-7 flex items-center justify-between cursor-default transition-colors hover:pl-3"
              >
                <div className="flex items-baseline gap-6">
                  <span className="font-display text-sm text-muted">{s.n}</span>
                  <h3 className="font-display text-2xl md:text-4xl group-hover:accent-text transition-colors">
                    {s.title}
                  </h3>
                </div>
                <span className="hidden md:block text-sm text-muted max-w-[220px] text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  {s.desc}
                </span>
              </div>
            ))}
          </div>

          <div className="hidden lg:block sticky top-32 aspect-[4/3] rounded-2xl overflow-hidden border border-stroke bg-surface">
            {services.map((s) => (
              <motion.img
                key={s.n}
                src={s.image}
                alt={s.title}
                animate={{ opacity: active?.n === s.n || (!active && s.n === "01") ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

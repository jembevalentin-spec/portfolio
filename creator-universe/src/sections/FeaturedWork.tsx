import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import SectionHeading from "../components/SectionHeading";
import { useProjectsStore } from "../hooks/useContentStore";

function StackCard({ project, i, total }: { project: any; i: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [0.3, 0.6, 1]);

  return (
    <div
      ref={ref}
      className="sticky"
      style={{ top: `${96 + i * 18}px`, zIndex: i + 1 }}
    >
      <motion.div
        style={{ scale, opacity }}
        className="rounded-3xl border border-stroke bg-surface overflow-hidden grid md:grid-cols-2 shadow-2xl shadow-black/40"
      >
        <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
          <img src={project.image} alt={project.title} className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <span className="text-xs text-muted mb-4">
            {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} — {project.category}
          </span>
          <h3 className="font-display text-3xl md:text-4xl leading-tight">{project.title}</h3>
          <p className="mt-4 text-muted text-sm md:text-base leading-relaxed">{project.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {project.technologies.map((t) => (
              <span key={t} className="text-xs px-3 py-1 rounded-full border border-stroke text-muted">
                {t}
              </span>
            ))}
          </div>
          <Link
            to={`/portfolio/${project.slug}`}
            className="focus-ring mt-8 inline-flex items-center gap-2 text-sm w-fit border-b border-stroke pb-1 hover:border-ink transition-colors"
          >
            View case study →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function FeaturedWork() {
  const { items } = useProjectsStore();
  const projects = items.filter((p) => p.featured);

  return (
    <section className="py-24 md:py-32 border-t border-stroke">
      <div className="max-w-content mx-auto px-6">
        <SectionHeading
          label="Featured work"
          heading="A few things worth a longer look."
          description="Selected builds — scroll to move through each one."
        />
      </div>
      <div className="max-w-content mx-auto px-6 mt-16 relative space-y-10">
        {projects.map((project, i) => (
          <StackCard key={project.id} project={project} i={i} total={projects.length} />
        ))}
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import type { Project } from "../data/types";

export default function ProjectCard({ project, className = "" }: { project: Project; className?: string }) {
  return (
    <Link
      to={`/portfolio/${project.slug}`}
      className={`focus-ring group relative block overflow-hidden rounded-2xl border border-stroke bg-surface ${className}`}
    >
      <img
        src={project.image}
        alt={project.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/10 to-transparent" />
      <div className="relative h-full flex flex-col justify-end p-6">
        <span className="text-xs text-white/70 mb-2">{project.category}</span>
        <h3 className="font-display text-2xl md:text-3xl text-white">{project.title}</h3>
        <p className="mt-2 text-sm text-white/70 max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {project.description}
        </p>
      </div>
    </Link>
  );
}

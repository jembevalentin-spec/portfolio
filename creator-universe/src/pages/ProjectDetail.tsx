import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, GitFork } from "lucide-react";
import { useProjectsStore } from "../hooks/useContentStore";
import FadeIn from "../components/FadeIn";

export default function ProjectDetail() {
  const { slug } = useParams();
  const { items } = useProjectsStore();
  const project = slug ? items.find((p) => p.slug === slug) : undefined;

  if (!project) return <Navigate to="/portfolio" replace />;

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-content mx-auto px-6">
        <Link
          to="/portfolio"
          className="focus-ring inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors mb-10"
        >
          <ArrowLeft size={14} />
          Back to portfolio
        </Link>

        <FadeIn>
          <span className="text-xs text-muted">{project.category}</span>
          <h1 className="font-display text-4xl md:text-6xl mt-3 leading-tight max-w-3xl">
            {project.title}
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-10 rounded-3xl overflow-hidden border border-stroke aspect-video">
            <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
          </div>
        </FadeIn>

        <div className="mt-10 grid sm:grid-cols-3 gap-4">{project.role&&<Info label="Role" value={project.role}/>} {project.duration&&<Info label="Duration" value={project.duration}/>}<Info label="Category" value={project.category}/></div>

        {(project.problem||project.solution||project.results) && <div className="mt-12 grid lg:grid-cols-3 gap-5">{project.problem&&<Case title="The problem" text={project.problem}/>} {project.solution&&<Case title="The solution" text={project.solution}/>} {project.results&&<Case title="The outcome" text={project.results}/>}</div>}

        {project.gallery.length>0 && <div className="mt-12 grid sm:grid-cols-2 gap-5">{project.gallery.map((g)=><div key={g} className="rounded-2xl overflow-hidden border border-stroke aspect-video bg-surface"><img src={g} alt="" className="w-full h-full object-cover" loading="lazy"/></div>)}</div>}

        <div className="mt-12 grid lg:grid-cols-[1fr_320px] gap-12">
          <FadeIn delay={0.15}>
            <p className="text-muted leading-relaxed text-base md:text-lg">{project.longDescription}</p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="rounded-2xl border border-stroke p-6 space-y-6">
              <div>
                <p className="text-xs text-muted mb-2">Technologies</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((t) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-full border border-stroke">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {project.liveUrl && project.liveUrl !== "#" && (
                  <a
                    href={project.liveUrl}
                    className="focus-ring accent-ring inline-flex items-center justify-center gap-2 border border-stroke rounded-full px-5 py-2.5 text-sm"
                  >
                    Visit live site <ExternalLink size={14} />
                  </a>
                )}
                {project.githubUrl && project.githubUrl !== "#" && (
                  <a
                    href={project.githubUrl}
                    className="focus-ring inline-flex items-center justify-center gap-2 border border-stroke rounded-full px-5 py-2.5 text-sm text-muted hover:text-ink transition-colors"
                  >
                    View source <GitFork size={14} />
                  </a>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}

function Info({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-stroke p-5 bg-surface"><p className="text-xs text-muted">{label}</p><p className="mt-2 text-sm">{value}</p></div>}
function Case({title,text}:{title:string;text:string}){return <article className="rounded-2xl border border-stroke p-6 bg-surface"><p className="text-xs uppercase tracking-[.18em] text-muted">{title}</p><p className="mt-4 text-sm leading-7 text-muted">{text}</p></article>}

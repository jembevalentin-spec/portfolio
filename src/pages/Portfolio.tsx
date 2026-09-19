import SectionHeading from "../components/SectionHeading";
import ProjectCard from "../components/ProjectCard";
import FadeIn from "../components/FadeIn";
import { useProjectsStore } from "../hooks/useContentStore";
import { useSiteContent } from "../hooks/useSiteContent";
export default function Portfolio(){ const site=useSiteContent(); const {items}=useProjectsStore(); const projects=items;
return <div className="pt-36 pb-24"><div className="max-w-content mx-auto px-6"><SectionHeading label={site.portfolioLabel} heading={site.portfolioHeadline} description={site.portfolioDescription}/><div className="mt-14 grid md:grid-cols-2 gap-6">{projects.map((project,i)=><FadeIn key={project.id} delay={i*.08}><ProjectCard project={project} className="aspect-[4/3]"/></FadeIn>)}</div></div></div> }

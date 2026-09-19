import type { Project } from "./types";

export const projects: Project[] = [
  {
    id: "pr1",
    title: "Sano Marketplace",
    slug: "sano-marketplace-case-study",
    description: "A digital-goods storefront built for independent creators, from concept to launch.",
    longDescription:
      "Sano started as a weekend experiment in checkout flows and grew into a full marketplace template now used as the base for the Store section of this site. The brief was simple: make buying a digital product feel as considered as buying a physical one — clear pricing, honest previews, and a checkout that never makes you guess what happens next.",
    category: "Web App",
    technologies: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"],
    image: "https://picsum.photos/seed/proj-sano/1200/900",
    gallery: [
      "https://picsum.photos/seed/proj-sano1/1200/900",
      "https://picsum.photos/seed/proj-sano2/1200/900",
    ],
    liveUrl: undefined,
    githubUrl: undefined,
    featured: true,
    createdAt: "2026-01-20",
  },
  {
    id: "pr2",
    title: "Project Organizer",
    slug: "project-organizer-case-study",
    description: "An offline-first Android app for tracking side projects without the overhead.",
    longDescription:
      "Built out of frustration with task apps that demand an account before you've written a single to-do. Project Organizer is deliberately small: boards, notes, a widget, done. The whole build leaned on Jetpack Compose and a local Room database, with an emphasis on cold-start speed.",
    category: "Android App",
    technologies: ["Kotlin", "Jetpack Compose", "Room"],
    image: "https://picsum.photos/seed/proj-organizer/1200/900",
    gallery: ["https://picsum.photos/seed/proj-organizer1/1200/900"],
    liveUrl: undefined,
    githubUrl: undefined,
    featured: true,
    createdAt: "2025-11-02",
  },
  {
    id: "pr3",
    title: "Future Experiments",
    slug: "future-experiments",
    description: "A running log of interface experiments — widgets, motion studies, and half-finished ideas.",
    longDescription:
      "Not every build needs to ship. This is the sketchbook: motion studies, odd widget shapes, and interface ideas tested in isolation before (sometimes) making their way into a real product.",
    category: "Experiment",
    technologies: ["React", "Framer Motion", "Canvas"],
    image: "https://picsum.photos/seed/proj-experiments/1200/900",
    gallery: ["https://picsum.photos/seed/proj-experiments1/1200/900"],
    liveUrl: undefined,
    githubUrl: undefined,
    featured: true,
    createdAt: "2026-06-01",
  },
  {
    id: "pr4",
    title: "Field Notes",
    slug: "field-notes-case-study",
    description: "A minimal local-first journaling template built to be forked and themed.",
    longDescription:
      "Field Notes exists because most note apps are too loud. This template strips the interface down to a single column and a clean local data model, so the writing is the only thing competing for attention.",
    category: "Personal Project",
    technologies: ["React", "TypeScript", "IndexedDB"],
    image: "https://picsum.photos/seed/proj-fieldnotes/1200/900",
    gallery: ["https://picsum.photos/seed/proj-fieldnotes1/1200/900"],
    liveUrl: undefined,
    githubUrl: undefined,
    featured: false,
    createdAt: "2026-02-14",
  },
];

export const getProjectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
export const getFeaturedProjects = () => projects.filter((p) => p.featured);

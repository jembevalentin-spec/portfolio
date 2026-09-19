export type ProductCategory =
  | "Android App"
  | "Website"
  | "Digital Tool"
  | "Template"
  | "Experiment";

export type ProductStatus = "live" | "draft" | "archived";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  category: ProductCategory;
  price: number;
  currency: string;
  isFree: boolean;
  image: string;
  gallery: string[];
  file?: string;
  liveUrl?: string;
  version: string;
  compatibility: string;
  features: string[];
  featured: boolean;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export type ProjectCategory =
  | "Website"
  | "Android App"
  | "Web App"
  | "Experiment"
  | "Client Project"
  | "Personal Project";

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  category: ProjectCategory;
  technologies: string[];
  image: string;
  gallery: string[];
  liveUrl?: string;
  githubUrl?: string;
  role?: string;
  duration?: string;
  problem?: string;
  solution?: string;
  results?: string;
  featured: boolean;
  createdAt: string;
}

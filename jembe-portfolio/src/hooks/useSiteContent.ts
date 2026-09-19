import { useEffect, useState } from "react";
import { restFetch, supabaseConfigured, uploadPublicFile } from "../lib/supabase";
import { defaultSiteDesign, normalizeSiteDesign, type SiteDesign } from "../data/siteDesign";

export interface SiteContent {
  siteName: string;
  logoText: string;
  logoUrl: string;
  motto: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroDescription: string;
  heroOwnerImage: string;
  heroBackgroundVideo: string;
  heroBackgroundImage: string;
  heroBackgroundType: "video" | "image" | "none";
  heroOverlay: number;
  lowerBackgroundType: "video" | "image" | "none";
  lowerBackgroundVideo: string;
  lowerBackgroundImage: string;
  lowerOverlay: number;
  heroVisible: boolean;
  showOwnerPhoto: boolean;
  showFeaturedProduct: boolean;
  storeLabel: string;
  storeHeadline: string;
  storeDescription: string;
  portfolioLabel: string;
  portfolioHeadline: string;
  portfolioDescription: string;
  aboutLabel: string;
  aboutHeadline: string;
  aboutText: string;
  contactLabel: string;
  contactHeadline: string;
  contactDescription: string;
  contactEmail: string;
  github: string;
  twitter: string;
  linkedin: string;
  footerText: string;
  announcementText: string;
  announcementVisible: boolean;
  design: SiteDesign;
}

export const defaultSiteContent: SiteContent = {
  siteName: "Jembe",
  logoText: "JM",
  logoUrl: "",
  motto: "Build it. Ship it. Make it useful.",
  heroEyebrow: "Independent creator — apps, sites & digital tools",
  heroHeadline: "Digital products built to be useful.",
  heroDescription: "I design and build Android apps, websites, and focused digital tools — then ship the finished work here. Practical ideas, polished execution, no unnecessary noise.",
  heroOwnerImage: "",
  heroBackgroundVideo: "",
  heroBackgroundImage: "",
  heroBackgroundType: "none",
  heroOverlay: 62,
  lowerBackgroundType: "none",
  lowerBackgroundVideo: "",
  lowerBackgroundImage: "",
  lowerOverlay: 78,
  heroVisible: true,
  showOwnerPhoto: true,
  showFeaturedProduct: true,
  storeLabel: "The store",
  storeHeadline: "Useful products, ready to use.",
  storeDescription: "Apps, websites, templates and tools made by Jembe — ready to download, license or explore.",
  portfolioLabel: "Portfolio",
  portfolioHeadline: "Selected work, with the thinking behind it.",
  portfolioDescription: "Case studies that show the problem, process, technology and outcome — not just the final screenshot.",
  aboutLabel: "About Jembe",
  aboutHeadline: "I build small, useful things — then I finish them.",
  aboutText: "Jembe is an independent developer studio focused on Android apps, modern websites and digital tools. Ideas are turned into real products with a bias toward clarity, speed and usefulness.",
  contactLabel: "Get in touch",
  contactHeadline: "Have something worth building?",
  contactDescription: "Open to selected freelance work, collaborations and product conversations.",
  contactEmail: "jembevalentin@gmail.com",
  github: "",
  twitter: "",
  linkedin: "",
  footerText: "Building Android apps, web tools, and focused digital products — and shipping the ones worth sharing.",
  announcementText: "",
  announcementVisible: false,
  design: defaultSiteDesign,
};

// The bundled traffic video/poster were removed from the project.
// Ignore any saved reference to them (e.g. old Supabase rows) so nothing tries to load them.
const REMOVED_MEDIA = ["/media/jembe-background.mp4", "/media/jembe-background-poster.jpg"];
const cleanMedia = (value: unknown) => {
  const v = String(value ?? "");
  return REMOVED_MEDIA.includes(v) ? "" : v;
};
const bgType = (type: unknown, video: string, image: string): "video" | "image" | "none" => {
  if (type === "video" && video) return "video";
  if (type === "image" && image) return "image";
  return "none";
};

const fromRow = (row: Record<string, unknown>): SiteContent => ({
  siteName: String(row.site_name ?? defaultSiteContent.siteName),
  logoText: String(row.logo_text ?? defaultSiteContent.logoText),
  logoUrl: String(row.logo_url ?? ""),
  motto: String(row.motto ?? ""),
  heroEyebrow: String(row.hero_eyebrow ?? ""),
  heroHeadline: String(row.hero_headline ?? ""),
  heroDescription: String(row.hero_description ?? ""),
  heroOwnerImage: String(row.hero_owner_image ?? ""),
  heroBackgroundVideo: cleanMedia(row.hero_background_video),
  heroBackgroundImage: cleanMedia(row.hero_background_image),
  heroBackgroundType: bgType(row.hero_background_type, cleanMedia(row.hero_background_video), cleanMedia(row.hero_background_image)),
  heroOverlay: Number(row.hero_overlay ?? defaultSiteContent.heroOverlay),
  lowerBackgroundType: bgType(row.lower_background_type, cleanMedia(row.lower_background_video), cleanMedia(row.lower_background_image)),
  lowerBackgroundVideo: cleanMedia(row.lower_background_video),
  lowerBackgroundImage: cleanMedia(row.lower_background_image),
  lowerOverlay: Number(row.lower_overlay ?? defaultSiteContent.lowerOverlay),
  heroVisible: Boolean(row.hero_visible),
  showOwnerPhoto: Boolean(row.show_owner_photo),
  showFeaturedProduct: Boolean(row.show_featured_product),
  storeLabel: String(row.store_label ?? ""),
  storeHeadline: String(row.store_headline ?? ""),
  storeDescription: String(row.store_description ?? ""),
  portfolioLabel: String(row.portfolio_label ?? ""),
  portfolioHeadline: String(row.portfolio_headline ?? ""),
  portfolioDescription: String(row.portfolio_description ?? ""),
  aboutLabel: String(row.about_label ?? ""),
  aboutHeadline: String(row.about_headline ?? ""),
  aboutText: String(row.about_text ?? ""),
  contactLabel: String(row.contact_label ?? ""),
  contactHeadline: String(row.contact_headline ?? ""),
  contactDescription: String(row.contact_description ?? ""),
  contactEmail: String(row.contact_email ?? defaultSiteContent.contactEmail),
  github: String(row.github ?? ""),
  twitter: String(row.twitter ?? ""),
  linkedin: String(row.linkedin ?? ""),
  footerText: String(row.footer_text ?? ""),
  announcementText: String(row.announcement_text ?? ""),
  announcementVisible: Boolean(row.announcement_visible),
  design: normalizeSiteDesign(row.design_json),
});

const toRow = (c: SiteContent) => ({
  site_key: "main",
  site_name: c.siteName,
  logo_text: c.logoText,
  logo_url: c.logoUrl,
  motto: c.motto,
  hero_eyebrow: c.heroEyebrow,
  hero_headline: c.heroHeadline,
  hero_description: c.heroDescription,
  hero_owner_image: c.heroOwnerImage,
  hero_background_video: c.heroBackgroundVideo,
  hero_background_image: c.heroBackgroundImage,
  hero_background_type: c.heroBackgroundType,
  hero_overlay: c.heroOverlay,
  lower_background_type: c.lowerBackgroundType,
  lower_background_video: c.lowerBackgroundVideo,
  lower_background_image: c.lowerBackgroundImage,
  lower_overlay: c.lowerOverlay,
  hero_visible: c.heroVisible,
  show_owner_photo: c.showOwnerPhoto,
  show_featured_product: c.showFeaturedProduct,
  store_label: c.storeLabel,
  store_headline: c.storeHeadline,
  store_description: c.storeDescription,
  portfolio_label: c.portfolioLabel,
  portfolio_headline: c.portfolioHeadline,
  portfolio_description: c.portfolioDescription,
  about_label: c.aboutLabel,
  about_headline: c.aboutHeadline,
  about_text: c.aboutText,
  contact_label: c.contactLabel,
  contact_headline: c.contactHeadline,
  contact_description: c.contactDescription,
  contact_email: c.contactEmail,
  github: c.github,
  twitter: c.twitter,
  linkedin: c.linkedin,
  footer_text: c.footerText,
  announcement_text: c.announcementText,
  announcement_visible: c.announcementVisible,
  design_json: c.design,
});

export async function saveSiteContent(next: SiteContent) {
  if (!supabaseConfigured) throw new Error("Supabase is not configured.");
  await restFetch("site_content", {
    method: "POST",
    body: toRow(next),
    auth: true,
    prefer: "resolution=merge-duplicates,return=representation",
  });
  window.dispatchEvent(new CustomEvent("jembe-site-content-changed"));
}

export async function uploadSiteMedia(file: File, kind: "logo" | "owner" | "background-image" | "background-video" | "lower-image" | "lower-video") {
  const folder = kind === "logo" ? "brand" : kind === "owner" ? "owner" : kind.startsWith("lower-") ? "lower" : "hero";
  const bucket = kind.includes("video") || kind.includes("image") ? "jembe-backgrounds" : "jembe-media";
  return uploadPublicFile(bucket, file, folder);
}


function isVisualPreviewMode() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("jembeVisualPreview") === "1";
}

function previewContent(value: unknown): SiteContent | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<SiteContent>;
  return {
    ...defaultSiteContent,
    ...raw,
    heroOverlay: Number(raw.heroOverlay ?? defaultSiteContent.heroOverlay),
    heroBackgroundType: raw.heroBackgroundType === "image" || raw.heroBackgroundType === "none" ? raw.heroBackgroundType : defaultSiteContent.heroBackgroundType,
    lowerBackgroundType: raw.lowerBackgroundType === "video" || raw.lowerBackgroundType === "none" ? raw.lowerBackgroundType : defaultSiteContent.lowerBackgroundType,
    lowerOverlay: Number(raw.lowerOverlay ?? defaultSiteContent.lowerOverlay),
    heroVisible: raw.heroVisible ?? defaultSiteContent.heroVisible,
    showOwnerPhoto: raw.showOwnerPhoto ?? defaultSiteContent.showOwnerPhoto,
    showFeaturedProduct: raw.showFeaturedProduct ?? defaultSiteContent.showFeaturedProduct,
    announcementVisible: raw.announcementVisible ?? defaultSiteContent.announcementVisible,
    design: normalizeSiteDesign(raw.design),
  };
}

export function useSiteContent() {
  const visualPreview = isVisualPreviewMode();
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [loading, setLoading] = useState(!visualPreview);

  useEffect(() => {
    if (visualPreview) return;

    let cancelled = false;
    (async () => {
      if (!supabaseConfigured) {
        setContent(defaultSiteContent);
        setLoading(false);
        return;
      }
      try {
        const rows = await restFetch<Record<string, unknown>[]>("site_content", {
          query: "site_key=eq.main&limit=1",
        });
        if (!cancelled) setContent(rows[0] ? fromRow(rows[0]) : defaultSiteContent);
      } catch {
        if (!cancelled) setContent(defaultSiteContent);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const sync = () => {
      void restFetch<Record<string, unknown>[]>("site_content", { query: "site_key=eq.main&limit=1" })
        .then(rows => { if (!cancelled && rows[0]) setContent(fromRow(rows[0])); })
        .catch(() => undefined);
    };
    window.addEventListener("jembe-site-content-changed", sync);
    return () => {
      cancelled = true;
      window.removeEventListener("jembe-site-content-changed", sync);
    };
  }, [visualPreview]);

  useEffect(() => {
    if (!visualPreview) return;

    const receivePreview = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data || event.data.type !== "jembe-preview-update") return;
      const next = previewContent(event.data.content);
      if (next) setContent(next);
    };

    window.addEventListener("message", receivePreview);
    if (window.parent === window) setLoading(false);
    return () => window.removeEventListener("message", receivePreview);
  }, [visualPreview]);

  return { ...content, loading };
}

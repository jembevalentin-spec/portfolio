import type { ReactNode } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useSiteContent } from "../hooks/useSiteContent";
import { useEffect } from "react";

function SiteThemeRuntime() {
  const site = useSiteContent();
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bg", site.design.theme.bg);
    root.style.setProperty("--surface", site.design.theme.surface);
    root.style.setProperty("--surface-2", site.design.theme.surface2);
    root.style.setProperty("--ink", site.design.theme.ink);
    root.style.setProperty("--muted", site.design.theme.muted);
    root.style.setProperty("--accent-a", site.design.theme.accentA);
    root.style.setProperty("--accent-b", site.design.theme.accentB);
  }, [site.design]);
  return null;
}

export default function MainLayout({ children }: { children: ReactNode }) {
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const visualPreview = params?.get("jembeVisualPreview") === "1";
  const visualEdit = params?.get("jembeVisualEdit") === "1";

  useEffect(() => {
    if (!visualPreview || !visualEdit) return;
    const stopNavigation = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]");
      if (anchor) event.preventDefault();
    };
    document.addEventListener("click", stopNavigation, true);
    return () => document.removeEventListener("click", stopNavigation, true);
  }, [visualPreview, visualEdit]);
  return (
    <div className={`min-h-screen bg-bg text-ink noise ${visualPreview ? "jembe-visual-preview" : ""}`}>
      <SiteThemeRuntime />
      {!visualPreview && <Navbar />}
      <main>{children}</main>
      {!visualPreview && <Footer />}
    </div>
  );
}

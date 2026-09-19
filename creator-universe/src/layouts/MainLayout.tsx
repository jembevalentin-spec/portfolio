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
  const visualPreview = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("jembeVisualPreview") === "1";
  return (
    <div className={`min-h-screen bg-bg text-ink noise ${visualPreview ? "jembe-visual-preview" : ""}`}>
      <SiteThemeRuntime />
      {!visualPreview && <Navbar />}
      <main>{children}</main>
      {!visualPreview && <Footer />}
    </div>
  );
}

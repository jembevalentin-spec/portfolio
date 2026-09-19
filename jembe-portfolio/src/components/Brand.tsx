import { Link } from "react-router-dom";
import { useSiteContent } from "../hooks/useSiteContent";

export default function Brand({ compact = false }: { compact?: boolean }) {
  const site = useSiteContent();
  return (
    <Link to="/" className="focus-ring flex items-center gap-3 group">
      <span className="relative w-9 h-9 rounded-full accent-gradient flex items-center justify-center overflow-hidden">
        {site.logoUrl ? (
          <img src={site.logoUrl} alt={site.logoText || site.siteName} className="w-full h-full object-cover" />
        ) : (
          <span className="w-[calc(100%-2px)] h-[calc(100%-2px)] rounded-full bg-bg flex items-center justify-center font-display text-xs">
            {site.logoText || site.siteName.slice(0, 2).toUpperCase()}
          </span>
        )}
      </span>
      <span className={`font-display text-sm ${compact ? "" : "hidden sm:inline"}`}>{site.siteName}</span>
    </Link>
  );
}

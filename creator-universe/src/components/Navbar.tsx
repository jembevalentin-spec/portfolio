import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag } from "lucide-react";
import MagneticButton from "./MagneticButton";
import Brand from "./Brand";

const links = [
  { label: "Home", to: "/" },
  { label: "Store", to: "/store" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "py-3" : "py-6"}`}>
      <div className="max-w-content mx-auto px-6 flex items-center justify-between">
        <Brand />
        <nav className={`hidden md:flex items-center gap-1 rounded-full border border-stroke px-2 py-2 transition-all duration-300 ${scrolled ? "bg-surface/90 backdrop-blur-md shadow-lg shadow-black/30" : "bg-surface/40 backdrop-blur"}`}>
          {links.map((link) => {
            const active = location.pathname === link.to;
            return <Link key={link.to} to={link.to} className={`focus-ring text-sm rounded-full px-4 py-2 transition-colors ${active ? "text-ink bg-stroke/60" : "text-muted hover:text-ink hover:bg-stroke/40"}`}>{link.label}</Link>;
          })}
        </nav>
        <div className="flex items-center gap-3">
          <MagneticButton href="/store" className="hidden sm:inline-flex accent-ring border border-stroke rounded-full px-5 py-2.5 text-sm gap-2 bg-surface/60 backdrop-blur"><ShoppingBag size={14}/>Store</MagneticButton>
          <button onClick={() => setOpen((o) => !o)} className="focus-ring md:hidden w-10 h-10 rounded-full border border-stroke flex items-center justify-center bg-surface/70 backdrop-blur" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>{open ? <X size={18}/> : <Menu size={18}/>}</button>
        </div>
      </div>
      <AnimatePresence>
        {open && <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} transition={{duration:.35,ease:[.16,1,.3,1]}} className="md:hidden overflow-hidden mt-4 mx-4"><div className="rounded-2xl border border-stroke bg-surface/95 backdrop-blur-md p-4 flex flex-col gap-1">{links.map((link)=><Link key={link.to} to={link.to} className="focus-ring text-base py-3 px-3 rounded-xl text-ink hover:bg-stroke/40">{link.label}</Link>)}</div></motion.div>}
      </AnimatePresence>
    </header>
  );
}

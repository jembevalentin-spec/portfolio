import { useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import FadeIn from "../components/FadeIn";
import { useProductsStore } from "../hooks/useContentStore";
import { useSiteContent } from "../hooks/useSiteContent";
import type { ProductCategory } from "../data/types";

const categories: (ProductCategory | "All")[] = ["All","Android App","Website","Digital Tool","Template","Experiment"];
export default function Store() {
  const site=useSiteContent(); const {items}=useProductsStore(); const [active,setActive]=useState<(typeof categories)[number]>("All"); const [query,setQuery]=useState("");
  const filtered=useMemo(()=>items.filter(p=>p.status==="live" && (active==="All" || p.category===active) && (`${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase()))),[items,active,query]);
  const live=items.filter(p=>p.status==="live");
  return <div className="pt-36 pb-24"><div className="max-w-content mx-auto px-6">
    <div className="mb-14"><p className="text-sm text-muted mb-4">{site.storeLabel}</p><h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[.95] tracking-tight max-w-5xl">{site.storeHeadline}</h1><p className="mt-6 text-muted max-w-2xl text-base md:text-lg">{site.storeDescription}</p></div>
    <div className="grid sm:grid-cols-3 gap-4 mb-8">{[{n:String(live.length),l:"Live products"},{n:String(live.filter(p=>p.isFree).length),l:"Free downloads"},{n:String(live.filter(p=>p.featured).length),l:"Featured picks"}].map(s=><div key={s.l} className="rounded-2xl border border-stroke bg-surface/60 p-5"><p className="font-display text-3xl">{s.n}</p><p className="text-xs text-muted mt-1">{s.l}</p></div>)}</div>
    <div className="grid lg:grid-cols-[1fr_auto] gap-4 items-center"><div className="relative"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search apps, websites, tools..." className="admin-input pl-4 py-3 bg-surface"/></div><p className="text-xs text-muted">Browse, compare and open a product to see the full details.</p></div>
    <div className="mt-6 flex flex-wrap gap-2">{categories.map(c=><button key={c} onClick={()=>setActive(c)} className={`focus-ring text-sm px-4 py-2 rounded-full border transition-colors ${active===c?"border-transparent bg-ink text-bg":"border-stroke text-muted hover:text-ink hover:bg-surface"}`}>{c}</button>)}</div>
    <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map((product,i)=><FadeIn key={product.id} delay={Math.min(i*.06,.3)}><ProductCard product={product}/></FadeIn>)}</div>
    {filtered.length===0&&<p className="text-muted mt-16 text-center">No products match that view yet.</p>}
  </div></div>;
}

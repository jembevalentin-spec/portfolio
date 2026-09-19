import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, ExternalLink, ArrowLeft } from "lucide-react";
import { useProductsStore } from "../hooks/useContentStore";
import FadeIn from "../components/FadeIn";
import ProductCard from "../components/ProductCard";
import MagneticButton from "../components/MagneticButton";

export default function ProductDetail() {
  const { slug } = useParams();
  const { items } = useProductsStore();
  const product = slug ? items.find((p) => p.slug === slug && p.status === "live") : undefined;

  if (!product) return <Navigate to="/store" replace />;

  const related = items.filter((p) => p.id !== product.id && p.status === "live" && p.category === product.category).slice(0, 3);

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-content mx-auto px-6">
        <Link
          to="/store"
          className="focus-ring inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors mb-10"
        >
          <ArrowLeft size={14} />
          Back to store
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <FadeIn>
            <div className="rounded-3xl overflow-hidden border border-stroke aspect-[4/3]">
              <motion.img
                key={product.image}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {product.gallery.slice(1).map((g) => (
                  <div key={g} className="rounded-xl overflow-hidden border border-stroke aspect-square">
                    <img src={g} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            )}
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="flex items-center gap-3 text-xs text-muted mb-4">
              <span className="px-2.5 py-1 rounded-full border border-stroke">{product.category}</span>
              <span>v{product.version}</span>
              {product.featured && <span className="accent-text">Featured</span>}
            </div>
            <h1 className="font-display text-4xl md:text-5xl leading-tight">{product.name}</h1>
            <p className="mt-5 text-muted leading-relaxed">{product.longDescription}</p>

            <ul className="mt-6 space-y-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-ink shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-end justify-between border-t border-stroke pt-6">
              <div>
                <p className="text-xs text-muted mb-1">Compatibility</p>
                <p className="text-sm">{product.compatibility}</p>
              </div>
              <p className="font-display text-3xl">
                {product.isFree ? "Free" : `$${product.price}`}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              {product.isFree && product.file ? (
                <a href={product.file.startsWith("http") ? product.file : `/${product.file}`} download className="bg-ink text-bg rounded-full px-7 py-3.5 text-sm font-medium gap-2 hover:opacity-90 transition-opacity inline-flex items-center">
                  <Download size={15} /> Download
                </a>
              ) : (
                <MagneticButton className="bg-ink text-bg rounded-full px-7 py-3.5 text-sm font-medium gap-2 hover:opacity-90 transition-opacity">
                  {product.isFree ? "Download" : `Buy — $${product.price}`}
                </MagneticButton>
              )}
              {product.liveUrl && <a href={product.liveUrl} target="_blank" rel="noreferrer" className="accent-ring inline-flex items-center border border-stroke rounded-full px-7 py-3.5 text-sm gap-2 bg-surface/40">View live demo <ExternalLink size={15}/></a>}
            </div>
          </FadeIn>
        </div>

        {related.length > 0 && (
          <div className="mt-28 pt-16 border-t border-stroke">
            <p className="text-sm text-muted mb-8">More in {product.category}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

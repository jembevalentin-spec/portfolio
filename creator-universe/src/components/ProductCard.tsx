import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../data/types";

export default function ProductCard({ product }: { product: Product }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), { stiffness: 220, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-7, 7]), { stiffness: 220, damping: 20 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Link
      to={`/store/${product.slug}`}
      className="focus-ring group block"
      style={{ perspective: 1200 }}
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative rounded-2xl border border-stroke bg-surface overflow-hidden"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
          {product.featured && (
            <span className="absolute top-4 left-4 text-xs px-2.5 py-1 rounded-full bg-bg/70 backdrop-blur border border-stroke text-ink">
              Featured
            </span>
          )}
          <span className="absolute top-4 right-4 text-xs px-2.5 py-1 rounded-full bg-bg/70 backdrop-blur border border-stroke text-muted">
            {product.isFree ? "Free" : `$${product.price}`}
          </span>
        </div>
        <div className="p-5" style={{ transform: "translateZ(30px)" }}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-xl">{product.name}</h3>
            <span className="text-xs text-muted whitespace-nowrap">{product.category}</span>
          </div>
          <p className="mt-2 text-sm text-muted leading-relaxed line-clamp-2">{product.description}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-muted">
            <span>v{product.version}</span>
            <span className="inline-flex items-center gap-1 text-ink opacity-0 group-hover:opacity-100 transition-opacity">
              View product
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

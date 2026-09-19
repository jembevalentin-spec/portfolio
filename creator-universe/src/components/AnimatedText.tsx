import { motion } from "framer-motion";
import type { CSSProperties } from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p";
  style?: CSSProperties;
}

export default function AnimatedText({ text, className, delay = 0, as = "p", style }: AnimatedTextProps) {
  const words = text.split(" ");
  const Tag = motion[as];

  return (
    <Tag className={className} style={style} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.28em]" aria-hidden="true">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.7,
              delay: delay + i * 0.045,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

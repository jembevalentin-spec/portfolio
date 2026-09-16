import type { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  reverse?: boolean;
  className?: string;
}

export default function Marquee({ children, reverse = false, className = "" }: MarqueeProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className={`flex w-max gap-5 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>
        <div className="flex gap-5 shrink-0">{children}</div>
        <div className="flex gap-5 shrink-0" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

import FadeIn from "./FadeIn";
import AnimatedText from "./AnimatedText";

interface SectionHeadingProps {
  label: string;
  heading: string;
  description?: string;
  align?: "left" | "center";
}

export default function SectionHeading({
  label,
  heading,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "text-center mx-auto max-w-2xl" : ""}>
      <FadeIn>
        <p className={`text-sm text-muted mb-4 ${align === "center" ? "" : ""}`}>{label}</p>
      </FadeIn>
      <AnimatedText
        as="h2"
        text={heading}
        className="font-display text-4xl md:text-6xl leading-[1.05] tracking-tight"
      />
      {description && (
        <FadeIn delay={0.15}>
          <p className="mt-5 text-muted text-base md:text-lg max-w-lg">{description}</p>
        </FadeIn>
      )}
    </div>
  );
}

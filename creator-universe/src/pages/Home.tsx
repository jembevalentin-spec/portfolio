import Hero from "../sections/Hero";
import StorePreview from "../sections/StorePreview";
import Discovery from "../sections/Discovery";
import FeaturedWork from "../sections/FeaturedWork";
import Services from "../sections/Services";
import Contact from "../sections/Contact";
import { useSiteContent } from "../hooks/useSiteContent";

export default function Home() {
  const site = useSiteContent();
  return (
    <>
      {site.heroVisible && <Hero />}
      <StorePreview />
      <Discovery />
      <FeaturedWork />
      <Services />
      <Contact />
    </>
  );
}

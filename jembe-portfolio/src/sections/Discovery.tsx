import Marquee from "../components/Marquee";
import { products } from "../data/products";
import { projects } from "../data/projects";

const rowOne = [...products].slice(0, 4);
const rowTwo = [...projects, ...products].slice(0, 4);

export default function Discovery() {
  return (
    <section data-jembe-section-id="discovery" className="py-20 md:py-28 border-t border-stroke overflow-hidden">
      <div className="max-w-content mx-auto px-6 mb-10">
        <p className="text-sm text-muted">Keep exploring</p>
      </div>
      <div className="space-y-5">
        <Marquee>
          {rowOne.map((item) => (
            <div
              key={item.id}
              className="w-64 sm:w-80 aspect-[4/3] rounded-2xl overflow-hidden border border-stroke shrink-0 group"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          ))}
        </Marquee>
        <Marquee reverse>
          {rowTwo.map((item) => (
            <div
              key={item.id}
              className="w-64 sm:w-80 aspect-[4/3] rounded-2xl overflow-hidden border border-stroke shrink-0 group"
            >
              <img
                src={item.image}
                alt={"title" in item ? item.title : item.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

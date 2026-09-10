import { useState } from "react";
import Reveal from "./Reveal";
import { Branch, SectionHeader } from "./decor";
import { cn } from "../utils/cn";
import { GALLERY, GALLERY_FILTERS, type GalleryFilterId } from "../data/content";

const CAT_LABEL: Record<GalleryFilterId, string> = {
  todos: "Todos",
  pizzas: "Pizzas",
  ambiente: "Ambiente",
  eventos: "Eventos",
};

export default function Gallery() {
  const [filter, setFilter] = useState<GalleryFilterId>("todos");
  const items = filter === "todos" ? GALLERY : GALLERY.filter((g) => g.cat === filter);

  return (
    <section id="galeria" className="texture-dark relative scroll-mt-24 overflow-hidden bg-forest-900/25">
      <div
        className="pointer-events-none absolute -top-32 right-[10%] h-[420px] w-[420px] animate-glow rounded-full bg-[radial-gradient(circle,rgba(226,112,58,0.1),transparent_65%)]"
        aria-hidden="true"
      />
      <Branch className="absolute -left-8 bottom-0 h-[400px] text-gold-500/25" />

      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Reveal>
          <SectionHeader
            kicker="Galeria"
            title={
              <>
                Um pedacinho da <em className="text-gold-grad italic">nossa casa</em>
              </>
            }
            description="Forno aceso, mesa posta e aquele cheiro que não sai da memória. Espie um pouco do que sai da nossa cozinha."
          />
        </Reveal>

        <Reveal delay={150}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2.5" role="group" aria-label="Filtrar galeria">
            {GALLERY_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={cn(
                  "rounded-full border px-5 py-2.5 text-sm font-bold transition-all duration-300",
                  filter === f.id
                    ? "border-gold-500 bg-gold-500 text-forest-950 shadow-[0_10px_28px_rgba(226,112,58,0.35)]"
                    : "border-cream-100/20 text-cream-200/70 hover:-translate-y-0.5 hover:border-gold-500/60 hover:text-gold-300"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* keyed by filter so items re-animate on change */}
        <div key={filter} className="mt-12 columns-2 gap-4 md:columns-3 lg:columns-4 [column-fill:_balance]">
          {items.map((item, i) => (
            <figure
              key={item.src}
              className="group relative mb-4 animate-pop overflow-hidden rounded-2xl break-inside-avoid"
              style={{ animationDelay: `${i * 55}ms` }}
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                className={cn(
                  "w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]",
                  item.tall ? "aspect-[3/4]" : "aspect-square"
                )}
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                aria-hidden="true"
              />
              <figcaption className="absolute inset-x-0 bottom-0 translate-y-3 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="text-[10px] font-extrabold tracking-[0.24em] text-gold-400 uppercase">
                  {CAT_LABEL[item.cat]}
                </span>
                <p className="mt-1 font-display text-lg leading-snug text-cream-50">{item.alt}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

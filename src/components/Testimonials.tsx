import Reveal from "./Reveal";
import { Branch, SectionHeader, Stars } from "./decor";
import { TESTIMONIALS } from "../data/content";

export default function Testimonials() {
  return (
    <section id="depoimentos" className="texture-dark relative scroll-mt-24 overflow-hidden bg-forest-950/25">
      <Branch className="absolute top-0 -left-8 h-[360px] text-gold-500/20" />
      <Branch flip className="absolute right-0 bottom-0 h-[320px] text-gold-500/15" />

      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Reveal>
          <SectionHeader
            kicker="Quem já provou"
            title={
              <>
                Depoimentos de quem <em className="text-gold-grad italic">volta</em> por mais
              </>
            }
            description="Nada fala mais alto do que o cliente que pede de novo. E de novo. E de novo."
          />
        </Reveal>

        <Reveal delay={150}>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Stars value={4.9} />
            <p className="text-sm font-semibold text-cream-200/70">
              4.9 de 5 — baseado em 480+ avaliações no Google e Instagram
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 150} as="figure" className="h-full">
              <div className="group flex h-full flex-col rounded-3xl border border-forest-700/60 bg-forest-850/55 p-8 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-gold-500/40">
                <span className="font-display text-6xl leading-none text-gold-500/60" aria-hidden="true">
                  “
                </span>
                <Stars value={5} className="mt-3" />
                <blockquote className="mt-4 flex-1">
                  <p className="font-display text-lg leading-relaxed text-cream-100/90 italic">{t.text}</p>
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-4 border-t border-forest-700/50 pt-6">
                  <img
                    src={t.img}
                    alt={`Foto de ${t.name}`}
                    loading="lazy"
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-gold-500/60 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div>
                    <p className="font-bold text-cream-50">{t.name}</p>
                    <p className="text-xs font-semibold tracking-[0.14em] text-cream-200/50 uppercase">{t.area}</p>
                  </div>
                </figcaption>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

import Reveal from "./Reveal";
import { ArrowUpRight } from "./icons";
import { Branch, SectionHeader } from "./decor";
import { CATEGORIES } from "../data/content";

export default function Categories() {
  return (
    <section id="categorias" className="texture-dark relative scroll-mt-24 overflow-hidden bg-forest-950/25">
      <Branch className="absolute top-0 right-4 h-[360px] text-gold-500/20" />
      <Branch flip className="absolute bottom-0 -left-10 h-[300px] text-gold-500/15" />

      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Reveal>
          <SectionHeader
            kicker="Explore o cardápio"
            title={
              <>
                Escolha o seu <em className="text-gold-grad italic">caminho</em>
              </>
            }
            description="Do clássico imbatível ao ousado que conquista na primeira fatia: quatro portas de entrada para a melhor noite da semana."
          />
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat, i) => (
            <Reveal key={cat.name} delay={i * 150} as="div">
              <a
                href={cat.href}
                className="group relative flex h-full flex-col items-center rounded-3xl border border-forest-700/60 bg-forest-850/55 p-7 text-center backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-gold-500/50 hover:bg-forest-800/60"
              >
                <span
                  className="absolute top-5 right-5 grid h-9 w-9 place-items-center rounded-full bg-forest-800 text-gold-400 transition-all duration-300 group-hover:rotate-45 group-hover:bg-gold-500 group-hover:text-forest-950"
                  aria-hidden="true"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </span>

                <span className="relative">
                  <span
                    className="absolute -inset-2.5 rounded-full border border-dashed border-gold-500/0 transition-all duration-500 group-hover:rotate-45 group-hover:border-gold-500/50"
                    aria-hidden="true"
                  />
                  <img
                    src={cat.img}
                    alt={cat.name}
                    loading="lazy"
                    className="aspect-square w-40 rounded-full object-cover shadow-lg ring-4 ring-forest-800 transition-all duration-500 group-hover:scale-[1.04] group-hover:ring-gold-500/40"
                  />
                </span>

                <h3 className="mt-6 font-display text-2xl font-semibold text-cream-50">{cat.name}</h3>
                <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-cream-200/60">{cat.desc}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold tracking-[0.22em] text-gold-300 uppercase transition-colors group-hover:text-gold-200">
                  Ver mais
                  <span className="h-px w-6 bg-gold-500/50 transition-all duration-300 group-hover:w-10" aria-hidden="true" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

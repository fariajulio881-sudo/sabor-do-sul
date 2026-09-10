import Reveal from "./Reveal";
import { Kicker } from "./decor";
import { ArrowUpRight, ClockIcon, MapPinIcon } from "./icons";
import { MAPS_DIRECTIONS_URL, MAPS_EMBED_URL } from "../data/content";
import { usePublicData } from "../lib/publicData";

/**
 * Faixa "Onde estamos" com mapa do Google Maps embutido (sem chave de API)
 * e card flutuante com endereço, horário e botão de rota.
 */
export default function MapSection() {
  const { contact: CONTACT } = usePublicData();
  return (
    <section id="onde-estamos" className="texture-dark relative scroll-mt-24 overflow-hidden bg-forest-950/25">
      <div
        className="pointer-events-none absolute -top-20 left-1/2 h-[380px] w-[760px] -translate-x-1/2 animate-glow rounded-full bg-[radial-gradient(ellipse,rgba(226,112,58,0.1),transparent_65%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 pt-24 pb-24 sm:px-8 lg:pb-32">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <Kicker className="justify-center">Onde estamos</Kicker>
            <h2 className="shimmer-light mt-5 font-display text-[clamp(1.85rem,5.5vw,3rem)] leading-[1.12] font-semibold text-balance text-cream-50">
              Vem buscar a sua <em className="text-gold-grad italic">quentinha</em>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-cream-200/70 sm:text-lg">
              Retirada no balcão é rapidinha — a pizza sai do forno direto para as suas mãos. E se preferir,
              entregamos em toda João Pessoa.
            </p>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="relative mt-14 overflow-hidden rounded-[2rem] border border-gold-500/25 bg-forest-900/70 shadow-[0_30px_90px_rgba(0,0,0,0.5)]">
            {/* Mapa */}
            <div className="relative h-[420px] w-full sm:h-[480px]">
              <iframe
                src={MAPS_EMBED_URL}
                title="Mapa do Google — Sabor do Sul, Rua Orlando Di Cavalcanti Villar, 111, Altiplano Cabo Branco, João Pessoa/PB"
                className="absolute inset-0 h-full w-full border-0 grayscale-[35%] contrast-[1.05] transition-all duration-700 hover:grayscale-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
              {/* Vinheta para integrar com o fundo */}
              <div
                className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(12,10,8,0.65)]"
                aria-hidden="true"
              />
            </div>

            {/* Card flutuante */}
            <div className="pointer-events-none absolute inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-sm">
              <div className="pointer-events-auto rounded-2xl border border-gold-500/30 bg-forest-950/85 p-6 backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-500/15 text-gold-400">
                    <MapPinIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.24em] text-cream-200/50 uppercase">
                      Endereço oficial
                    </p>
                    <p className="mt-1.5 font-display text-lg leading-snug font-semibold text-cream-50">
                      {CONTACT.address}
                    </p>
                    <p className="text-sm text-cream-200/60">{CONTACT.city}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2.5 border-t border-cream-100/10 pt-4 text-sm text-cream-200/70">
                  <ClockIcon className="h-4.5 w-4.5 shrink-0 text-gold-400" />
                  {CONTACT.hours}
                </div>

                <a
                  href={MAPS_DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shine mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-3.5 text-sm font-bold text-forest-950 shadow-[0_12px_32px_rgba(226,112,58,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-400"
                >
                  Traçar rota no Google Maps
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import Reveal from "./Reveal";
import { Branch, SectionHeader, Stars } from "./decor";
import { Star, WhatsAppIcon } from "./icons";
import { cn } from "../utils/cn";
import { FEATURED, waLink } from "../data/content";
import { usePublicData } from "../lib/publicData";
import { buildOrderMessage } from "../lib/payment";
import PaymentPicker from "./PaymentPicker";

export default function Featured() {
  // disponibilidade vinda do painel admin (Supabase) quando configurado
  const { availability, live } = usePublicData();

  return (
    <section id="sabores" className="texture-dark relative scroll-mt-24 overflow-hidden bg-forest-900/25">
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[820px] -translate-x-1/2 animate-glow rounded-full bg-[radial-gradient(ellipse,rgba(226,112,58,0.09),transparent_65%)]"
        aria-hidden="true"
      />
      <Branch className="absolute top-10 -left-8 h-[460px] text-gold-500/25" />
      <Branch flip className="absolute -right-10 bottom-0 h-[420px] text-gold-500/20" />

      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Reveal>
          <SectionHeader
            kicker="Os mais pedidos"
            title={
              <>
                Sabores que viraram <em className="text-gold-grad italic">lenda</em>
              </>
            }
            description="Massa de fermentação lenta, molho caseiro e ingredientes generosos — do clássico imbatível ao ousado que conquista na primeira fatia."
          />
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((pizza, i) => {
            const isUnavailable = live && availability[pizza.name] === false;
            return (
              <Reveal key={pizza.name} delay={(i % 3) * 150} as="article" className="h-full">
                <div
                  className={cn(
                    "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-forest-700/70 bg-forest-850/70 transition-all duration-500",
                    isUnavailable
                      ? "opacity-60"
                      : "hover:-translate-y-2 hover:border-gold-500/45 hover:shadow-[0_28px_70px_rgba(0,0,0,0.5)]"
                  )}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={pizza.img}
                      alt={`Pizza ${pizza.name}`}
                      loading="lazy"
                      className={cn(
                        "aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]",
                        isUnavailable && "grayscale"
                      )}
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-forest-900/70 via-transparent to-transparent opacity-80"
                      aria-hidden="true"
                    />
                    <span className="absolute top-4 left-4 rounded-full bg-gold-500 px-3.5 py-1.5 text-[10px] font-extrabold tracking-[0.16em] text-forest-950 uppercase shadow-lg">
                      {isUnavailable ? "Esgotado" : pizza.tag}
                    </span>
                    {!isUnavailable && (
                      <span className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-forest-950/70 px-3 py-1.5 text-xs font-bold text-gold-300 backdrop-blur-md">
                        <Star className="h-3.5 w-3.5" />
                        {pizza.rating}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="shimmer-light font-display text-2xl font-semibold text-cream-50 transition-[filter] duration-300 group-hover:brightness-125">
                      {pizza.name}
                    </h3>
                    <p className="mt-2.5 flex-1 text-sm leading-relaxed text-cream-200/65">{pizza.desc}</p>

                    {/* forma de pagamento antes de pedir */}
                    {!isUnavailable && <PaymentPicker compact className="mt-4" />}

                    <div className="mt-6 flex items-center justify-between border-t border-cream-100/10 pt-5">
                      <div>
                        <p className="text-[10px] font-bold tracking-[0.22em] text-cream-200/45 uppercase">
                          Direto do forno
                        </p>
                        <p
                          className={cn(
                            "mt-0.5 font-display leading-none font-bold text-gold-400",
                            pizza.price.length > 12 ? "text-lg" : "text-[26px]"
                          )}
                        >
                          {pizza.price}
                        </p>
                      </div>
                      {isUnavailable ? (
                        <span className="inline-flex items-center rounded-full border border-cream-100/15 px-5 py-2.5 text-sm font-bold text-cream-200/40">
                          Indisponível
                        </span>
                      ) : (
                        <a
                          href={waLink(buildOrderMessage(pizza.name))}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-gold-500/60 px-5 py-2.5 text-sm font-bold text-gold-300 transition-all duration-300 hover:bg-gold-500 hover:text-forest-950 hover:shadow-[0_10px_28px_rgba(226,112,58,0.35)]"
                        >
                          <WhatsAppIcon className="h-4 w-4" />
                          Pedir
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={150}>
          <div className="mt-14 flex flex-col items-center gap-5">
            <Stars value={4.9} />
            <p className="max-w-md text-center text-sm text-cream-200/55">
              Pizzas grandes com até 2 sabores • Borda recheada de catupiry ou mussarela —{" "}
              <strong className="text-gold-300">confirme o valor no WhatsApp</strong>
            </p>
            <a
              href={waLink("Olá! Quero ver o cardápio completo do Sabor do Sul 🍕")}
              target="_blank"
              rel="noopener noreferrer"
              className="shine inline-flex items-center gap-2.5 rounded-full bg-gold-500 px-8 py-4 text-sm font-bold text-forest-950 shadow-[0_14px_38px_rgba(226,112,58,0.3)] transition-all duration-300 hover:-translate-y-1 hover:bg-gold-400"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Receber cardápio completo no WhatsApp
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

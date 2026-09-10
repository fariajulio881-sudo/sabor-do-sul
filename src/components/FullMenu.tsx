import { useState } from "react";
import Reveal from "./Reveal";
import { Branch, SectionHeader } from "./decor";
import { WhatsAppIcon } from "./icons";
import { cn } from "../utils/cn";
import { waLink } from "../data/content";
import { usePublicData } from "../lib/publicData";
import { buildOrderMessage } from "../lib/payment";
import PaymentPicker from "./PaymentPicker";

/**
 * Cardápio completo em estilo "menu de restaurante" — linha elegante com
 * foto circular, nome + tag, linha pontilhada até o preço e botão "Pedir"
 * por item (abre o WhatsApp com mensagem pré-preenchida com o nome exato).
 *
 * Itens marcados como indisponíveis no painel admin aparecem como
 * "Esgotado" (esmaecidos, com botão desabilitado).
 */
export default function FullMenu() {
  const { rows, tabs } = usePublicData();
  const [tab, setTab] = useState<string>("todos");
  const [query, setQuery] = useState("");
  const shown = rows.filter(
    (r) =>
      (tab === "todos" || r.tab === tab) &&
      r.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section id="cardapio" className="texture-dark relative scroll-mt-24 overflow-hidden bg-forest-950/25">
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 animate-glow rounded-full bg-[radial-gradient(ellipse,rgba(226,112,58,0.1),transparent_65%)]"
        aria-hidden="true"
      />
      <Branch className="absolute -left-10 top-24 h-[500px] text-gold-500/20" />
      <Branch flip className="absolute -right-8 bottom-24 h-[440px] text-gold-500/15" />

      <div className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
        <Reveal>
          <SectionHeader
            kicker="Cardápio completo"
            title={
              <>
                Do clássico ao ousado, <em className="text-gold-grad italic">tudo</em> na ponta do dedo
              </>
            }
            description="Este é o cardápio oficial da casa — o mesmo que você encontra no nosso menu digital. Escolha, chame no WhatsApp e boa noite."
          />
        </Reveal>

        <Reveal delay={150}>
          <div className="mt-12 flex flex-col items-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-2.5" role="group" aria-label="Filtrar cardápio">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-pressed={tab === t.id}
                  className={cn(
                    "rounded-full border px-5 py-2.5 text-sm font-bold transition-all duration-300",
                    tab === t.id
                      ? "border-gold-500 bg-gold-500 text-forest-950 shadow-[0_10px_28px_rgba(226,112,58,0.35)]"
                      : "border-cream-100/20 text-cream-200/70 hover:-translate-y-0.5 hover:border-gold-500/60 hover:text-gold-300"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {/* busca por sabor */}
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="🔍 Buscar sabor… ex.: calabresa"
              aria-label="Buscar sabor no cardápio"
              className="w-full max-w-sm rounded-full border border-cream-100/15 bg-forest-950/60 px-5 py-2.5 text-sm text-cream-50 placeholder:text-cream-200/35 focus:border-gold-500 focus:outline-none"
            />
          </div>
        </Reveal>

        {/* keyed by tab so items re-animate on change */}
        <div key={tab} className="mt-14 grid gap-x-12 gap-y-2 lg:grid-cols-2">
          {shown.map((item, i) => (
            <article
              key={`${tab}-${item.id}`}
              className={cn(
                "group animate-pop flex gap-4 rounded-2xl border border-transparent p-4 transition-all duration-300",
                item.available
                  ? "hover:border-gold-500/30 hover:bg-forest-900/60"
                  : "opacity-60 hover:border-transparent hover:bg-transparent",
                "sm:gap-5"
              )}
              style={{ animationDelay: `${Math.min(i, 10) * 60}ms` }}
            >
              {/* Foto circular */}
              <div className="relative shrink-0">
                <img
                  src={item.img}
                  alt={item.name}
                  loading="lazy"
                  className={cn(
                    "aspect-square w-20 rounded-full object-cover ring-2 ring-forest-700 transition-all duration-500 sm:w-24",
                    item.available ? "group-hover:scale-105 group-hover:ring-gold-500/70" : "grayscale"
                  )}
                />
                {item.available && (
                  <span
                    className="absolute -top-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-gold-500 text-forest-950 opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100"
                    aria-hidden="true"
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>

              {/* Conteúdo */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <h3 className="min-w-0 font-display text-lg leading-snug font-semibold text-cream-50 transition-colors duration-300 group-hover:text-gold-300 sm:text-xl">
                    {item.name}
                  </h3>
                  {item.tag && (
                    <span className="shrink-0 rounded-full bg-gold-500/15 px-2.5 py-0.5 text-[9px] font-extrabold tracking-[0.14em] whitespace-nowrap text-gold-300 uppercase">
                      {item.tag}
                    </span>
                  )}
                  {!item.available && (
                    <span className="shrink-0 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[9px] font-extrabold tracking-[0.14em] whitespace-nowrap text-red-300 uppercase">
                      Esgotado
                    </span>
                  )}
                  <span className="mx-1 min-w-4 flex-1 border-b border-dotted border-cream-100/25" aria-hidden="true" />
                  {item.price === "Preço no WhatsApp" ? (
                    <a
                      href={waLink(`Olá! Qual o preço de "${item.name}"? 🍕`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-[10px] font-extrabold tracking-[0.12em] whitespace-nowrap text-gold-300 uppercase underline decoration-gold-500/40 underline-offset-4 transition-colors hover:text-gold-200"
                    >
                      Preço no WhatsApp
                    </a>
                  ) : (
                    <span className="shrink-0 font-display text-lg font-bold whitespace-nowrap text-gold-400">
                      {item.price}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-cream-200/60">{item.desc}</p>
                {item.note && (
                  <p className="mt-1.5 text-[11px] font-bold tracking-[0.16em] text-gold-400/80 uppercase">{item.note}</p>
                )}

                {/* Forma de pagamento + botão de pedido por item */}
                <div className="mt-2.5">
                  {item.available ? (
                    <div className="space-y-2.5">
                      <PaymentPicker compact />
                      <a
                        href={waLink(buildOrderMessage(item.name))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/50 px-3.5 py-1.5 text-[11px] font-bold text-gold-300 transition-all duration-300 hover:bg-gold-500 hover:text-forest-950"
                      >
                        <WhatsAppIcon className="h-3.5 w-3.5" />
                        Pedir
                      </a>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cream-100/10 px-3.5 py-1.5 text-[11px] font-bold text-cream-200/40">
                      Indisponível no momento
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <Reveal delay={150}>
          <p className="mt-14 text-center text-sm text-cream-200/55">
            Não achou seu sabor favorito? A lista completa com promoções do dia está sempre no WhatsApp —{" "}
            <a
              href={waLink("Olá! Quero ver o cardápio completo do Sabor do Sul 🍕")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-gold-300 underline decoration-gold-500/40 underline-offset-4 transition-colors hover:text-gold-200"
            >
              é só chamar
            </a>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}

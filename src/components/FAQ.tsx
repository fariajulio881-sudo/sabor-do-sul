import { useState } from "react";
import Reveal from "./Reveal";
import { Branch, SectionHeader } from "./decor";
import { ChevronDown, WhatsAppIcon } from "./icons";
import { cn } from "../utils/cn";
import { FAQS, waLink } from "../data/content";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="texture-dark relative scroll-mt-24 overflow-hidden bg-forest-950/25">
      <Branch className="absolute right-0 top-10 h-[340px] text-gold-500/20" />

      <div className="relative mx-auto max-w-4xl px-5 py-24 sm:px-8 lg:py-32">
        <Reveal>
          <SectionHeader
            kicker="Dúvidas frequentes"
            title={
              <>
                Perguntas rápidas, respostas <em className="text-gold-grad italic">direto ao ponto</em>
              </>
            }
          />
        </Reveal>

        <div className="mt-14 space-y-4">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={faq.q} delay={i * 150}>
                <div
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-forest-850/55 backdrop-blur-md transition-all duration-500",
                    isOpen
                      ? "border-gold-500/60 shadow-[0_16px_44px_rgba(0,0,0,0.35)]"
                      : "border-forest-700/60 hover:border-gold-500/40"
                  )}
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      id={`faq-button-${i}`}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left sm:px-8"
                    >
                      <span className="font-display text-lg font-semibold text-cream-50 sm:text-xl">{faq.q}</span>
                      <span
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-500",
                          isOpen
                            ? "rotate-180 border-gold-500 bg-gold-500 text-forest-950"
                            : "border-cream-100/25 text-cream-200/60"
                        )}
                        aria-hidden="true"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-button-${i}`}
                    className="grid transition-[grid-template-rows] duration-500 ease-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 text-[15px] leading-relaxed text-cream-200/70 sm:px-8">{faq.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={150}>
          <p className="mt-12 text-center text-cream-200/70">
            Ainda com dúvida?{" "}
            <a
              href={waLink("Olá! Tenho uma dúvida sobre o Sabor do Sul 🍕")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-gold-300 underline decoration-gold-500/40 underline-offset-4 transition-colors hover:text-gold-200"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Chama a gente no WhatsApp
            </a>{" "}
            — respondemos rapidinho.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import EmberField from "./EmberField";
import { Branch, Kicker, Stamp, Stars } from "./decor";
import { ArrowRight, ClockIcon, Star, WhatsAppIcon } from "./icons";
import { waLink } from "../data/content";
import { heroDelay } from "./timing";
import { buildOrderMessage } from "../lib/payment";
import PaymentPicker from "./PaymentPicker";

function CountUp({ value, className }: { value: number; className?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 1800;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <span ref={ref} className={className}>
      +{n.toLocaleString("pt-BR")}
    </span>
  );
}

const METRICS = [
  { value: "4.9★", label: "Nota média dos clientes", count: false },
  { value: 1200, label: "Pizzas servidas com orgulho", count: true },
  { value: "18h–22h30", label: "Forno aceso todos os dias", count: false },
] as const;

export default function Hero() {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const plateWrapRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = plateWrapRef.current;
    if (!el || e.pointerType === "touch") return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: py * -7, ry: px * 9 });
  };
  const handleLeave = () => setTilt({ rx: 0, ry: 0 });

  return (
    <section id="inicio" className="texture-dark relative overflow-hidden bg-forest-950/25">
      {/* Brasas interativas do forno */}
      <EmberField className="pointer-events-none absolute inset-0 h-full w-full" />

      {/* Luzes ambientes com deriva animada */}
      <div
        className="pointer-events-none absolute -top-40 right-[-10%] h-[560px] w-[560px] animate-drift rounded-full bg-[radial-gradient(circle,rgba(226,112,58,0.17),transparent_65%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-40 bottom-[-20%] h-[620px] w-[620px] animate-drift-late rounded-full bg-[radial-gradient(circle,rgba(158,94,44,0.20),transparent_65%)]"
        aria-hidden="true"
      />
      {/* Decorações botânicas */}
      <Branch className="absolute -left-8 bottom-0 h-[420px] text-gold-500/30" />
      <Branch flip className="absolute -right-6 -top-10 h-[380px] text-gold-500/20" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 pt-32 pb-16 sm:px-8 lg:grid-cols-2 lg:gap-10 lg:pt-44 lg:pb-28">
        {/* ---------------- Copy ---------------- */}
        <div className="text-center lg:text-left">
          <Reveal immediate delay={heroDelay(0)}>
            <Kicker className="justify-center lg:justify-start">Pizzaria artesanal — João Pessoa, PB</Kicker>
          </Reveal>

          <Reveal immediate delay={heroDelay(1)}>
            <h1 className="shimmer-light mt-6 font-display text-[clamp(2.2rem,9vw,4.6rem)] leading-[1.06] font-bold text-balance text-cream-50">
              Pizza artesanal que transforma a noite em{" "}
              <em className="text-gold-grad italic">memória</em>.
            </h1>
          </Reveal>

          <Reveal immediate delay={heroDelay(2)}>
            <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-cream-200/75 lg:mx-0">
              Massa de fermentação lenta, queijo que estica e ingredientes escolhidos um a um.
              O forno da casa nunca descansa — peça no WhatsApp e receba quentinha em casa.
            </p>
          </Reveal>

          <Reveal immediate delay={heroDelay(3)}>
            <div className="mt-8">
              {/* Forma de pagamento antes do botão de pedido */}
              <div className="flex justify-center lg:justify-start">
                <PaymentPicker />
              </div>
              <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <a
                  href={waLink(buildOrderMessage())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shine group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-gold-500 px-8 py-4 text-base font-bold text-forest-950 shadow-[0_14px_38px_rgba(226,112,58,0.35)] transition-all duration-300 hover:-translate-y-1 hover:bg-gold-400 hover:shadow-[0_20px_50px_rgba(226,112,58,0.45)] sm:w-auto"
                >
                  <WhatsAppIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  Peça no WhatsApp
                </a>
                <a
                  href="#sabores"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-cream-100/25 px-8 py-4 text-base font-semibold text-cream-100 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/70 hover:text-gold-300 sm:w-auto"
                >
                  Ver sabores
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal immediate delay={heroDelay(4)}>
            <dl className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 border-t border-cream-100/10 pt-8 lg:justify-start">
              {METRICS.map((m) => (
                <div key={m.label} className="text-center lg:text-left">
                  <dt className="sr-only">{m.label}</dt>
                  <dd className="font-display text-3xl font-bold text-gold-400">
                    {m.count ? <CountUp value={m.value} /> : m.value}
                  </dd>
                  <dd className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-cream-200/55">{m.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* ---------------- Visual ---------------- */}
        <Reveal immediate delay={heroDelay(5)} className="relative mx-auto w-full max-w-[480px]">
          <div ref={plateWrapRef} onPointerMove={handleMove} onPointerLeave={handleLeave} className="relative">
            {/* Prato com tilt 3D que acompanha o cursor */}
            <div
              className="relative aspect-square transition-transform duration-300 ease-out will-change-transform"
              style={{ transform: `perspective(1100px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
            >
              <div
                className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-gold-500/30"
                aria-hidden="true"
              />
              <div
                className="absolute inset-5 animate-spin-slower rounded-full border border-gold-500/20"
                aria-hidden="true"
              />
              <div className="absolute inset-10 overflow-hidden rounded-full shadow-[0_40px_120px_rgba(0,0,0,0.6),inset_0_0_60px_rgba(226,112,58,0.14)] ring-1 ring-gold-500/40">
                <img
                  src="/images/hero-pizza.png"
                  alt="Pizza artesanal do Sabor do Sul, saindo do forno da casa, coberta com mussarela dourada e manjericão fresco"
                  className="h-full w-full animate-kenburns object-cover"
                  fetchPriority="high"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-forest-950/35 via-transparent to-transparent"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Selo flutuante */}
            <div className="absolute -top-8 -right-2 animate-float sm:-right-8">
              <Stamp text="Feito na hora • Todos os dias • Massa artesanal •" size={150} />
            </div>

            {/* Badge de avaliação */}
            <div className="absolute -bottom-4 -left-2 animate-float-late rounded-2xl border border-gold-500/30 bg-forest-900/80 px-5 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:-left-10">
              <div className="flex items-center gap-1.5">
                <Star className="h-5 w-5 text-gold-400" />
                <span className="font-display text-2xl font-bold text-cream-50">4.9</span>
              </div>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cream-200/60">
                480+ avaliações
              </p>
              <Stars value={4.9} className="mt-2" />
            </div>

            {/* Chip forno aceso */}
            <div className="absolute top-10 -left-4 hidden items-center gap-2 rounded-full border border-gold-500/30 bg-forest-900/80 py-2 pr-4 pl-3 text-xs font-bold text-gold-300 backdrop-blur-xl sm:flex">
              <ClockIcon className="h-4 w-4" />
              Forno aceso agora
            </div>
          </div>
        </Reveal>
      </div>

      {/* Indicador de scroll */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 lg:block" aria-hidden="true">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-cream-100/25 p-1.5">
          <span className="h-2 w-1 animate-bounce rounded-full bg-gold-400" />
        </div>
      </div>
    </section>
  );
}

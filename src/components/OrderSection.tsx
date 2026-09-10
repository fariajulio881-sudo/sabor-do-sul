import { useState, type FormEvent } from "react";
import Reveal from "./Reveal";
import { Branch, Kicker, SectionHeader } from "./decor";
import { ArrowUpRight, ClockIcon, InstagramIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from "./icons";
import { COMBOS, FEATURED, waLink } from "../data/content";
import { usePublicData } from "../lib/publicData";
import { buildOrderMessage, buildPaymentSuffix } from "../lib/payment";
import PaymentPicker from "./PaymentPicker";

const FLAVORS = [...FEATURED.map((p) => p.name), "Outro sabor (descrevo nas observações)"];

export default function OrderSection() {
  const { contact: CONTACT } = usePublicData();
  const [nome, setNome] = useState("");
  const [whats, setWhats] = useState("");
  const [sabor, setSabor] = useState(FLAVORS[0]);
  const [bairro, setBairro] = useState("");
  const [obs, setObs] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !whats.trim()) {
      setError("Preencha seu nome e WhatsApp para enviar o pedido.");
      return;
    }
    setError("");
    const msg = [
      `Olá! Meu nome é ${nome.trim()}. 🍕`,
      `Quero pedir: ${sabor}.`,
      bairro.trim() ? `Bairro/endereço: ${bairro.trim()}.` : "",
      obs.trim() ? `Observações: ${obs.trim()}.` : "",
      buildPaymentSuffix(),
      `Meu WhatsApp: ${whats.trim()}.`,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(waLink(msg), "_blank", "noopener,noreferrer");
  };

  const inputClass =
    "w-full rounded-xl border border-cream-100/15 bg-forest-950/70 px-4 py-3.5 text-[15px] text-cream-50 placeholder:text-cream-200/30 transition-colors duration-300 focus:border-gold-500";

  return (
    <section id="pedido" className="texture-dark relative overflow-hidden bg-forest-950/25">
      <div
        className="pointer-events-none absolute top-[-10%] right-[-5%] h-[500px] w-[500px] animate-glow rounded-full bg-[radial-gradient(circle,rgba(226,112,58,0.12),transparent_65%)]"
        aria-hidden="true"
      />
      <Branch className="absolute top-32 -right-10 h-[520px] text-gold-500/20" />
      <Branch flip className="absolute bottom-10 -left-10 h-[440px] text-gold-500/20" />

      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        {/* ---------------- Combos ---------------- */}
        <div id="combos" className="scroll-mt-28">
          <Reveal>
            <SectionHeader
              kicker="Combos para compartilhar"
              title={
                <>
                  Combos que fazem a festa <em className="text-gold-grad italic">render</em>
                </>
              }
              description="Toda pizza boa merece companhia — e todo combo do Sabor do Sul sai com refrigerante de cortesia. É só escolher o tamanho da fome."
            />
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {COMBOS.map((combo, i) => (
              <Reveal key={combo.name} delay={i * 150} as="div" className="h-full">
                <div
                  className={
                    combo.popular
                      ? "relative flex h-full flex-col rounded-3xl border border-gold-500/60 bg-forest-850 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.5),0_0_50px_rgba(226,112,58,0.12)]"
                      : "relative flex h-full flex-col rounded-3xl border border-forest-700/70 bg-forest-900/70 p-8 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-500/40"
                  }
                >
                  {combo.popular && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-4 py-1.5 text-[10px] font-extrabold tracking-[0.2em] whitespace-nowrap text-forest-950 uppercase shadow-lg">
                      ✦ Mais popular
                    </span>
                  )}
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-gold-500/40 bg-gold-500/10 px-3.5 py-1.5 text-[10px] font-extrabold tracking-[0.2em] text-gold-300 uppercase">
                    Bebida grátis
                  </span>
                  <h3 className="shimmer-light mt-5 font-display text-3xl font-semibold text-cream-50">{combo.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream-200/60 italic">{combo.note}</p>

                  <ul className="mt-6 flex-1 space-y-3 border-t border-cream-100/10 pt-6">
                    {combo.includes.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-cream-200/80">
                        <span className="mt-0.5 text-gold-400" aria-hidden="true">
                          ✦
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <PaymentPicker compact className="mt-4" />

                  <div className="mt-6 flex items-end justify-between border-t border-cream-100/10 pt-6">
                    <p className="font-display text-4xl font-bold text-gold-400">{combo.price}</p>
                    <a
                      href={waLink(buildOrderMessage(combo.name))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        combo.popular
                          ? "shine inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-forest-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-400"
                          : "inline-flex items-center gap-2 rounded-full border border-gold-500/60 px-5 py-2.5 text-sm font-bold text-gold-300 transition-all duration-300 hover:bg-gold-500 hover:text-forest-950"
                      }
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      Pedir
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ---------------- Order form + contact ---------------- */}
        <div className="mt-28 grid gap-10 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <div className="h-full rounded-[2rem] border border-gold-500/25 bg-forest-900/60 p-7 backdrop-blur-xl sm:p-10">
              <Kicker>Peça agora</Kicker>
              <h3 className="shimmer-light mt-5 font-display text-[clamp(1.6rem,5vw,2.25rem)] leading-tight font-semibold text-cream-50">
                Monte seu pedido em <em className="text-gold-grad italic">1 minuto</em>
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-cream-200/65">
                Preencha os campos e clique em enviar — a mensagem vai prontinha para o nosso WhatsApp.
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="nome" className="mb-2 block text-[11px] font-bold tracking-[0.22em] text-gold-300 uppercase">
                      Seu nome *
                    </label>
                    <input
                      id="nome"
                      type="text"
                      required
                      autoComplete="name"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Como podemos te chamar?"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="whats" className="mb-2 block text-[11px] font-bold tracking-[0.22em] text-gold-300 uppercase">
                      WhatsApp *
                    </label>
                    <input
                      id="whats"
                      type="tel"
                      required
                      autoComplete="tel"
                      value={whats}
                      onChange={(e) => setWhats(e.target.value)}
                      placeholder="(16) 9 0000-0000"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="sabor" className="mb-2 block text-[11px] font-bold tracking-[0.22em] text-gold-300 uppercase">
                      Sabor favorito
                    </label>
                    <select
                      id="sabor"
                      value={sabor}
                      onChange={(e) => setSabor(e.target.value)}
                      className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23e2703a%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center] bg-no-repeat pr-10`}
                    >
                      {FLAVORS.map((f) => (
                        <option key={f} value={f} className="bg-forest-900 text-cream-50">
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="bairro" className="mb-2 block text-[11px] font-bold tracking-[0.22em] text-gold-300 uppercase">
                      Bairro / endereço
                    </label>
                    <input
                      id="bairro"
                      type="text"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      placeholder="Onde vamos entregar?"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="obs" className="mb-2 block text-[11px] font-bold tracking-[0.22em] text-gold-300 uppercase">
                    Observações
                  </label>
                  <textarea
                    id="obs"
                    rows={3}
                    value={obs}
                    onChange={(e) => setObs(e.target.value)}
                    placeholder="Borda recheada, dois sabores, sem cebola…"
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div aria-live="polite">
                  {error && (
                    <p className="mb-3 rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm font-medium text-red-200">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="shine group flex w-full items-center justify-center gap-2.5 rounded-full bg-gold-500 px-8 py-4.5 text-base font-bold text-forest-950 shadow-[0_16px_44px_rgba(226,112,58,0.35)] transition-all duration-300 hover:-translate-y-1 hover:bg-gold-400 hover:shadow-[0_22px_56px_rgba(226,112,58,0.45)]"
                  >
                    <WhatsAppIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    Enviar pedido pelo WhatsApp
                  </button>
                  <p className="mt-3 text-center text-xs text-cream-200/45">
                    Sem cadastro, sem taxa — você conversa direto com a gente.
                  </p>
                </div>
              </form>
            </div>
          </Reveal>

          <Reveal delay={150} className="lg:col-span-2">
            <div className="flex h-full flex-col gap-5">
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 rounded-2xl border border-forest-700/80 bg-forest-900/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/50"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold-500/15 text-gold-400">
                  <PhoneIcon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[10px] font-bold tracking-[0.24em] text-cream-200/50 uppercase">
                    Fale com a gente
                  </span>
                  <span className="mt-1 block font-display text-3xl font-bold text-gold-400 transition-colors group-hover:text-gold-300">
                    {CONTACT.phoneDisplay}
                  </span>
                  <span className="mt-1 block text-sm text-cream-200/60">WhatsApp • resposta em minutos</span>
                </span>
              </a>

              <div className="flex items-start gap-4 rounded-2xl border border-forest-700/80 bg-forest-900/70 p-6">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold-500/15 text-gold-400">
                  <MapPinIcon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[10px] font-bold tracking-[0.24em] text-cream-200/50 uppercase">
                    Onde estamos
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-cream-100">
                    {CONTACT.address}
                    <br />
                    {CONTACT.city} — retirada no balcão
                  </span>
                  <a
                    href="#onde-estamos"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.12em] text-gold-400 uppercase transition-colors hover:text-gold-300"
                  >
                    Ver no mapa
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </span>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-forest-700/80 bg-forest-900/70 p-6">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold-500/15 text-gold-400">
                  <ClockIcon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[10px] font-bold tracking-[0.24em] text-cream-200/50 uppercase">
                    Horário de forno
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-cream-100">
                    Todos os dias
                    <br />
                    <strong className="text-gold-300">18h às 00h</strong>
                  </span>
                </span>
              </div>

              <a
                href={CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 rounded-2xl border border-forest-700/80 bg-forest-900/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/50"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold-500/15 text-gold-400">
                  <InstagramIcon className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="block text-[10px] font-bold tracking-[0.24em] text-cream-200/50 uppercase">
                    Siga a gente
                  </span>
                  <span className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-cream-100 transition-colors group-hover:text-gold-300">
                    {CONTACT.instagramHandle}
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </span>
              </a>

              <a
                href={waLink(buildOrderMessage())}
                target="_blank"
                rel="noopener noreferrer"
                className="shine mt-auto flex items-center justify-center gap-2.5 rounded-full bg-gold-500 px-8 py-4.5 text-base font-bold text-forest-950 shadow-[0_16px_44px_rgba(226,112,58,0.3)] transition-all duration-300 hover:-translate-y-1 hover:bg-gold-400"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Chamar no WhatsApp agora
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

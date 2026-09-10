import { useEffect, useMemo, useRef, useState } from "react";
import Reveal from "./Reveal";
import { Branch, SectionHeader } from "./decor";
import { WhatsAppIcon } from "./icons";
import { waLink } from "../data/content";
import { usePublicData } from "../lib/publicData";
import { getSpinState, saveSpinState } from "../lib/spinState";
import { formatTime, isOpenNow, nowInSaoPaulo } from "../lib/schedule";

/* ================================================================== */
/*  ROLETA DE PRÊMIOS — "Enquanto você espera"                         */
/*  - Sorteio 100% honesto: o prêmio é decidido ANTES da animação,     */
/*    por sorteio aleatório ponderado (Math.random). A animação apenas */
/*    visualiza o resultado — sem manipulação nem "quase-vitória".     */
/*  - Com Supabase configurado: os prêmios/limite diário vêm do painel */
/*    admin (tabela roulette_prizes) e cada giro é registrado na       */
/*    tabela roulette_spins, alimentando as estatísticas do admin.     */
/*  - Sem Supabase: usa prêmios padrão e localStorage.                 */
/* ================================================================== */

type Prize = {
  id: string;
  label: string;
  weight: number;
  active: boolean;
  img: string;
  consolation?: boolean;
};

/* prêmios padrão (usados quando o Supabase não está configurado) */
const DEFAULT_PRIZES: Prize[] = [
  {
    id: "quase",
    label: "Quase lá",
    weight: 40,
    active: true,
    consolation: true,
    img: "https://images.pexels.com/photos/29021742/pexels-photo-29021742.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  { id: "10off", label: "10% OFF", weight: 18, active: true, img: "/images/pizza-patrao.jpg" },
  { id: "5off", label: "5% OFF", weight: 15, active: true, img: "/images/pizza-brocolis.jpg" },
  {
    id: "refri",
    label: "Refrigerante grátis",
    weight: 14,
    active: true,
    img: "https://storage.googleapis.com/prod-cardapio-web/uploads/item/image/2892833/168859101264a5daa49192f_75_75.jpeg",
  },
  {
    id: "borda",
    label: "Borda grátis",
    weight: 8,
    active: true,
    img: "https://images.pexels.com/photos/29699537/pexels-photo-29699537.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  { id: "doce", label: "Sobremesa grátis", weight: 5, active: true, img: "/images/pizza-doce.jpg" },
];

/* pool de fotos para prêmios vindos do admin (que não têm imagem própria) */
const IMG_POOL = [
  "/images/pizza-patrao.jpg",
  "/images/pizza-brocolis.jpg",
  "https://storage.googleapis.com/prod-cardapio-web/uploads/item/image/2892833/168859101264a5daa49192f_75_75.jpeg",
  "/images/pizza-doce.jpg",
  "/images/pizza-frango.jpg",
  "https://images.pexels.com/photos/29021742/pexels-photo-29021742.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
];

const SPIN_MS = 4600;

/* ------------------------------------------------------------------ */
/*  Sorteio honesto: índice decidido por pesos antes da animação       */
/* ------------------------------------------------------------------ */
function pickWeighted(prizes: Prize[]): Prize {
  const active = prizes.filter((p) => p.active);
  const total = active.reduce((acc, p) => acc + p.weight, 0);
  let r = Math.random() * total;
  for (const p of active) {
    r -= p.weight;
    if (r < 0) return p;
  }
  return active[active.length - 1];
}

/* ------------------------------------------------------------------ */
/*  Validação de cliente                                                */
/*  TODO: validar contra banco de clientes reais via Supabase quando   */
/*  integrado (consultar pedidos do restaurante pelo telefone).        */
/* ------------------------------------------------------------------ */
function validateCustomer(phone: string): boolean {
  void phone;
  return true;
}

/* ------------------------------------------------------------------ */
/*  Persistência dos giros: SUPABASE (tabela spins) com fallback       */
/*  localStorage — ver src/lib/spinState.ts (getSpinState/saveSpinState)*/
/*  Limite: configurável (padrão 1 giro/dia) POR NÚMERO de WhatsApp,   */
/* ------------------------------------------------------------------ */
const makeCoupon = () => `SDS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

/* ------------------------------------------------------------------ */
/* Geometria das fatias: polígono calculado para qualquer quantidade   */
/* ------------------------------------------------------------------ */
function wedgePath(startDeg: number, endDeg: number): string {
  const pt = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    const x = 50 + 72 * Math.sin(rad);
    const y = 50 - 72 * Math.cos(rad);
    return `${x.toFixed(2)}% ${y.toFixed(2)}%`;
  };
  return `polygon(50% 50%, ${pt(startDeg)}, ${pt(endDeg)})`;
}

/* ================================================================== */
/*  Componente                                                         */
/* ================================================================== */
export default function RouletteSection() {
  const { roulette, schedule } = usePublicData();

  /* prêmios: config do admin quando disponível, senão os padrão */
  const prizes: Prize[] = useMemo(() => {
    if (roulette.prizes.length > 0) {
      return roulette.prizes.map((p, i) => ({
        id: p.id,
        label: p.label,
        weight: p.weight,
        active: p.active,
        img: IMG_POOL[i % IMG_POOL.length],
        consolation: /quase|tente novamente|não foi/i.test(p.label),
      }));
    }
    return DEFAULT_PRIZES;
  }, [roulette.prizes]);

  const dailyLimit = roulette.prizes.length > 0 ? roulette.dailyLimit : 1;

  const [phone, setPhone] = useState("");
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [remaining, setRemaining] = useState(dailyLimit);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<Prize | null>(null);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [shineKey, setShineKey] = useState(0);
  const [copied, setCopied] = useState(false);

  const rotationRef = useRef(0);
  const pendingRef = useRef<Prize | null>(null);
  const timerRef = useRef(0);
  const finishedRef = useRef(false);

  /* ------------------------------------------------------------------
  /* Restrição ao horário de funcionamento (fuso de Brasília).
  /* - checa ao carregar
  /* - re-checa a cada 30s (página aberta esperando abrir)
  /* - re-checa ao voltar para a aba (focus)
  /* - e re-checa no momento do clique (sem brecha de timing)
  /* ------------------------------------------------------------------ */
  const [openNow, setOpenNow] = useState(true);

  const checkOpenNow = () => setOpenNow(isOpenNow(schedule.opening, schedule.closing));

  useEffect(() => {
    checkOpenNow();
    const interval = window.setInterval(checkOpenNow, 30_000);
    window.addEventListener("focus", checkOpenNow);
    document.addEventListener("visibilitychange", checkOpenNow);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", checkOpenNow);
      document.removeEventListener("visibilitychange", checkOpenNow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule.opening, schedule.closing]);

  const segment = 360 / prizes.length;
  const wedges = prizes.map((_, i) => wedgePath(i * segment, (i + 1) * segment));

  const startSession = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      alert("Informe um WhatsApp válido com DDD (ex.: 83 99999-9999).");
      return;
    }
    if (!validateCustomer(digits)) return;
    const state = await getSpinState(digits, roulette.restaurantId, dailyLimit);
    setPhone(digits);
    setPhoneSaved(true);
    setRemaining(Math.max(0, state.limit - state.used));
  };

  const finishSpin = (prize: Prize) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    window.clearTimeout(timerRef.current);

    const won = !prize.consolation;
    const code = won ? makeCoupon() : null;

    // grava no Supabase (tabela spins) + espelho local
    void saveSpinState(phone, roulette.restaurantId, prize.label, code);

    setCoupon(code);
    setRemaining((r) => Math.max(0, r - 1));
    setSpinning(false);
    setResult(prize);
    setShineKey((k) => k + 1);
  };

  const spin = () => {
    if (spinning || remaining <= 0 || !phoneSaved) return;
    if (!validateCustomer(phone)) return;

    // re-checa o horário no exato momento do clique (hora de Brasília)
    if (!isOpenNow(schedule.opening, schedule.closing, nowInSaoPaulo())) {
      setOpenNow(false);
      return;
    }

    /* ---------- o prêmio é decidido ANTES da animação ---------- */
    const prize = pickWeighted(prizes);
    const idx = prizes.indexOf(prize);
    const jitter = (Math.random() * 2 - 1) * (segment / 2 - 4); // ±(fatia/2 − 4°), dentro da fatia
    const target = rotationRef.current + 360 * 5 + (360 - idx * segment - segment / 2) + jitter;

    finishedRef.current = false;
    pendingRef.current = prize;
    setResult(null);
    setSpinning(true);

    // desenha o alvo no próximo frame para a transição disparar
    requestAnimationFrame(() => {
      rotationRef.current = target;
      setRotation(target);
    });

    // fallback caso o transitionend não dispare (ex.: reduced motion)
    timerRef.current = window.setTimeout(() => finishSpin(prize), SPIN_MS + 1200);
  };

  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const copyCoupon = async () => {
    if (!coupon) return;
    try {
      await navigator.clipboard.writeText(coupon);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard bloqueado */
    }
  };

  return (
    <section id="roleta" className="texture-dark relative scroll-mt-24 overflow-hidden bg-forest-900/25">
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 animate-glow rounded-full bg-[radial-gradient(ellipse,rgba(226,112,58,0.12),transparent_65%)]"
        aria-hidden="true"
      />
      <Branch className="absolute -left-10 bottom-24 h-[460px] text-gold-500/20" />
      <Branch flip className="absolute -right-8 top-24 h-[400px] text-gold-500/15" />

      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Reveal>
          <SectionHeader
            kicker="Enquanto você espera"
            title={
              <>
                A espera virou <em className="text-gold-grad italic">prêmio</em>
              </>
            }
            description="Cadastre seu WhatsApp, gire a roleta e concorra a descontos e brindes no seu pedido. Sorteio honesto por pesos, com limite de giros por dia."
          />
        </Reveal>

        <div className="mt-16 grid items-center gap-14 lg:grid-cols-2">
          {/* ---------------------- ROLETA 3D ---------------------- */}
          <Reveal delay={100}>
            <div className="flex flex-col items-center">
              {/* cena com perspectiva 3D */}
              <div className="relative" style={{ perspective: "1200px" }}>
                {/* container inclinado (vista de cima, ~18°) */}
                <div
                  className="relative h-72 w-72 sm:h-80 sm:w-80"
                  style={{ transform: "rotateX(18deg)", transformStyle: "preserve-3d" }}
                >
                  {/* aro metálico dourado */}
                  <div
                    className="absolute -inset-2.5 rounded-full"
                    style={{
                      background:
                        "conic-gradient(from 0deg, #8a6a2f, #f6cf8b, #c2542b, #f9cf96, #6b521f, #f2a75c, #8a6a2f)",
                      boxShadow: "0 24px 60px rgba(0,0,0,0.55), inset 0 0 0 2px rgba(255,255,255,0.1)",
                    }}
                    aria-hidden="true"
                  />

                  {/* brilho reflexivo que passa pela borda ao terminar o giro */}
                  <div key={shineKey} className="pointer-events-none absolute -inset-2.5 z-40 overflow-hidden rounded-full" aria-hidden="true">
                    <div className="roulette-shine absolute inset-0 rounded-full" style={{ animationDuration: reduced ? "0.01s" : undefined }} />
                  </div>

                  {/* disco giratório */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: reduced ? "none" : spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.6, 0.2, 1)` : "none",
                    }}
                    onTransitionEnd={(e) => {
                      if (e.propertyName === "transform" && spinning && pendingRef.current) {
                        finishSpin(pendingRef.current);
                      }
                    }}
                  >
                    {/* fatias com foto real cortada em setor circular */}
                    {prizes.map((p, i) => (
                      <div
                        key={p.id}
                        className="absolute inset-0"
                        style={{
                          clipPath: wedges[i],
                          backgroundImage: `url(${p.img})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          filter: "brightness(0.92) saturate(1.08)",
                          opacity: p.active ? 1 : 0.45,
                        }}
                        aria-hidden="true"
                      />
                    ))}

                    {/* divisórias radiais douradas */}
                    {prizes.map((_, i) => (
                      <div
                        key={`line-${i}`}
                        className="absolute top-0 left-1/2 h-1/2 w-px bg-gradient-to-b from-gold-300/80 via-gold-400/50 to-transparent"
                        style={{ transform: `rotate(${i * segment}deg)`, transformOrigin: "50% 100%", marginLeft: -0.5 }}
                        aria-hidden="true"
                      />
                    ))}

                    {/* rótulos radiais dos prêmios */}
                    {prizes.map((p, i) => (
                      <div
                        key={`label-${p.id}`}
                        className="absolute inset-0"
                        style={{ transform: `rotate(${i * segment}deg)` }}
                        aria-hidden="true"
                      >
                        <span
                          className="absolute top-[16%] left-1/2 -translate-x-1/2 rounded-full bg-forest-950/75 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-cream-50 uppercase shadow"
                          style={{ transform: "rotate(90deg)", transformOrigin: "center", fontSize: 8.5 }}
                        >
                          {p.label}
                        </span>
                      </div>
                    ))}

                    {/* cubo central metálico */}
                    <div
                      className="absolute top-1/2 left-1/2 z-20 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
                      style={{
                        background: "radial-gradient(circle at 32% 28%, #f6cf8b, #c2542b 55%, #6b521f)",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.35)",
                      }}
                    >
                      <span className="font-display text-2xl font-bold text-forest-950">🍕</span>
                    </div>
                  </div>

                  {/* reflexo de vidro fixo (não gira com o disco) */}
                  <div
                    className="pointer-events-none absolute inset-0 z-30 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.16), rgba(255,255,255,0) 46%)",
                    }}
                    aria-hidden="true"
                  />
                  {/* sombra interna do aro sobre o disco */}
                  <div
                    className="pointer-events-none absolute inset-0 z-30 rounded-full"
                    style={{ boxShadow: "inset 0 0 34px rgba(0,0,0,0.55)" }}
                    aria-hidden="true"
                  />

                  {/* ponteiro dourado (topo) */}
                  <div
                    className="absolute -top-3 left-1/2 z-50 h-9 w-6 -translate-x-1/2"
                    style={{
                      clipPath: "polygon(50% 100%, 0 0, 100% 0)",
                      background: "linear-gradient(180deg, #f6cf8b, #e2703a)",
                      filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.6))",
                    }}
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* sombra realista sob a roleta */}
              <div
                className="mt-10 h-8 w-56 rounded-full bg-black/55 blur-xl sm:w-64"
                aria-hidden="true"
              />
            </div>
          </Reveal>

          {/* ---------------------- PAINEL DE GIRO ---------------------- */}
          <Reveal delay={250}>
            <div className="rounded-3xl border border-gold-500/25 bg-forest-850/60 p-6 backdrop-blur-md sm:p-8">
              {!phoneSaved ? (
                <>
                  <h3 className="font-display text-2xl font-semibold text-cream-50">
                    Primeiro, seu <span className="text-gold-400 italic">WhatsApp</span>
                  </h3>
                  <p className="mt-2 text-sm text-cream-200/60">
                    Usamos o número para liberar seus giros diários e registrar seus prêmios.
                  </p>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(83) 9 9999-9999"
                    aria-label="Seu número de WhatsApp"
                    className="mt-5 w-full rounded-xl border border-cream-100/15 bg-forest-950/70 px-4 py-3.5 text-base text-cream-50 placeholder:text-cream-200/30 focus:border-gold-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => void startSession()}
                    className="mt-4 w-full rounded-full bg-gold-500 px-6 py-3.5 text-sm font-bold text-forest-950 shadow-[0_12px_32px_rgba(226,112,58,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-400"
                  >
                    Começar
                  </button>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-cream-200/70">
                      WhatsApp: <strong className="text-cream-50">{phone}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneSaved(false);
                        setPhone("");
                      }}
                      className="text-xs font-bold text-cream-200/50 underline underline-offset-4 transition-colors hover:text-gold-300"
                    >
                      Trocar número
                    </button>
                  </div>

                  <h3 className="mt-5 font-display text-2xl font-semibold text-cream-50">
                    {remaining > 0 ? (
                      <>
                        Você tem <span className="text-gold-400">{remaining}</span>{" "}
                        {remaining === 1 ? "giro" : "giros"} hoje
                      </>
                    ) : (
                      <>
                        Giros de hoje <span className="text-gold-400 italic">esgotados</span>
                      </>
                    )}
                  </h3>
                  <p className="mt-2 text-sm text-cream-200/60">
                    {remaining > 0
                      ? "O resultado é decidido de forma 100% aleatória pelos pesos de cada prêmio — sem pegadinhas."
                      : "Volte amanhã depois da meia-noite: seus giros serão renovados."}
                  </p>

                  {openNow ? (
                    <>
                      <button
                        type="button"
                        onClick={spin}
                        disabled={spinning || remaining <= 0}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-4 text-base font-bold text-forest-950 shadow-[0_16px_44px_rgba(226,112,58,0.4)] transition-all duration-300 hover:-translate-y-1 hover:bg-gold-400 disabled:pointer-events-none disabled:opacity-50"
                      >
                        {spinning ? (
                          <>
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-forest-950/30 border-t-forest-950" />
                            Girando…
                          </>
                        ) : (
                          <>🎰 Girar a roleta</>
                        )}
                      </button>

                      <p className="mt-3 text-center text-[11px] text-cream-200/45">
                        {remaining}/{dailyLimit} giros restantes • renova à meia-noite
                      </p>
                    </>
                  ) : (
                    /* fora do horário de atendimento: botão escondido + aviso */
                    <div className="mt-6 rounded-2xl border border-gold-500/30 bg-forest-950/50 px-5 py-4 text-center">
                      <p className="text-2xl" aria-hidden="true">
                        🌙
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-relaxed text-cream-100">
                        A roleta funciona só durante nosso horário de atendimento (
                        {formatTime(schedule.opening)} às {formatTime(schedule.closing)}).
                      </p>
                      <p className="mt-1 text-sm text-gold-300">Volte mais tarde!</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ---------------------- MODAL DE RESULTADO ---------------------- */}
      {result && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-black/75 p-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Resultado da roleta"
        >
          <div className="w-full max-w-sm animate-pop rounded-3xl border border-gold-500/40 bg-forest-900 p-7 text-center shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
            <img
              src={result.img}
              alt=""
              className="mx-auto h-20 w-20 rounded-2xl border-2 border-gold-500/50 object-cover"
            />
            {result.consolation ? (
              <>
                <h3 className="mt-5 font-display text-3xl font-bold text-cream-50">
                  Foi por <span className="text-gold-400 italic">pouco</span>! 🍀
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-cream-200/70">
                  Quase caiu um prêmio de verdade… mas você ainda tem{" "}
                  <strong className="text-gold-300">{remaining}</strong>{" "}
                  {remaining === 1 ? "giro" : "giros"} hoje. Bora tentar de novo?
                </p>
              </>
            ) : (
              <>
                <h3 className="mt-5 font-display text-3xl font-bold text-gold-400">
                  Você ganhou! 🎉
                </h3>
                <p className="mt-2 font-display text-2xl font-semibold text-cream-50">{result.label}</p>
                {coupon && (
                  <div className="mt-4 rounded-2xl border border-dashed border-gold-500/60 bg-forest-950/70 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cream-200/50">
                      Seu cupom
                    </p>
                    <p className="mt-1 font-mono text-lg font-bold tracking-widest text-gold-300">{coupon}</p>
                  </div>
                )}
                <div className="mt-5 grid gap-2.5">
                  <button
                    type="button"
                    onClick={() => void copyCoupon()}
                    className="w-full rounded-full border border-gold-500/60 px-5 py-3 text-sm font-bold text-gold-300 transition-colors hover:bg-gold-500 hover:text-forest-950"
                  >
                    {copied ? "✓ Copiado!" : "Copiar cupom"}
                  </button>
                  <a
                    href={waLink(`Olá! Ganhei "${result.label}" na roleta do site${coupon ? ` — cupom: ${coupon}` : ""}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 px-5 py-3 text-sm font-bold text-forest-950 transition-all hover:bg-gold-400"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    Resgatar no WhatsApp
                  </a>
                </div>
              </>
            )}
            <button
              type="button"
              onClick={() => setResult(null)}
              className="mt-4 text-xs font-bold text-cream-200/50 underline underline-offset-4 transition-colors hover:text-cream-100"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

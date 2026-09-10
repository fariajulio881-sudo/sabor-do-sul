import { useId, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { BasilLeaf, Star } from "./icons";

/* ------------------------------------------------------------------ */
/* Kicker — small uppercase, letter-spaced label above titles          */
/* ------------------------------------------------------------------ */
export function Kicker({ children, dark = true, className }: { children: ReactNode; dark?: boolean; className?: string }) {
  return (
    <p
      className={cn(
        // mobile: texto menor, tracking mais apertado e linha menor para caber em 375px
        "flex flex-wrap items-center gap-2 text-[10px] font-bold tracking-[0.12em] uppercase",
        "sm:gap-3 sm:text-[11px] sm:tracking-[0.34em]",
        dark ? "text-gold-400" : "text-gold-600",
        className
      )}
    >
      <span
        className={cn("h-px w-5 shrink-0 sm:w-10", dark ? "bg-gold-500/70" : "bg-gold-600/50")}
        aria-hidden="true"
      />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Section header — kicker + serif title (+ optional description)      */
/* ------------------------------------------------------------------ */
type SectionHeaderProps = {
  kicker: string;
  title: ReactNode;
  description?: ReactNode;
  dark?: boolean;
  align?: "center" | "left";
  className?: string;
};

export function SectionHeader({ kicker, title, description, dark = true, align = "center", className }: SectionHeaderProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left", className)}>
      <Kicker dark={dark} className={align === "center" ? "justify-center" : undefined}>
        {kicker}
      </Kicker>
      <h2
        className={cn(
          // clamp(): ajusta automaticamente entre ~30px (mobile) e 48px (desktop)
          // shimmer-light: brilho reflexivo deslizante sobre o título
          "shimmer-light mt-5 font-display text-[clamp(1.85rem,5.5vw,3rem)] leading-[1.12] font-semibold text-balance",
          dark ? "text-cream-50" : "text-forest-900"
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn("mt-5 text-base leading-relaxed sm:text-lg", dark ? "text-cream-200/70" : "text-forest-800/70")}>
          {description}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stars — rating with partial fill                                    */
/* ------------------------------------------------------------------ */
export function Stars({ value = 5, className }: { value?: number; className?: string }) {
  const pct = Math.max(0, Math.min(5, value)) / 5 * 100;
  return (
    <div className={cn("relative inline-flex", className)} role="img" aria-label={`Nota ${value} de 5 estrelas`}>
      <div className="flex gap-0.5 text-cream-100/25">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4" />
        ))}
      </div>
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <div className="flex gap-0.5 text-gold-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stamp — rotating circular text seal                                 */
/* ------------------------------------------------------------------ */
export function Stamp({
  text,
  className,
  size = 148,
}: {
  text: string;
  className?: string;
  size?: number;
}) {
  const id = useId().replace(/[:]/g, "");
  return (
    <div className={cn("pointer-events-none select-none", className)} aria-hidden="true">
      <svg viewBox="0 0 120 120" width={size} height={size} className="animate-spin-slower">
        <defs>
          <path id={`circ-${id}`} d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
        </defs>
        <circle cx="60" cy="60" r="59" className="fill-forest-950/60 stroke-gold-500/40" strokeWidth="1" />
        <circle cx="60" cy="60" r="31" className="fill-none stroke-gold-500/25" strokeWidth="0.75" strokeDasharray="2 4" />
        <text className="fill-gold-300 font-sans text-[10.5px] font-bold uppercase" style={{ letterSpacing: "0.28em" }}>
          <textPath href={`#circ-${id}`}>{text}</textPath>
        </text>
        <g transform="translate(60 60)">
          <BasilLeaf className="h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-gold-400" />
        </g>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Branch — thin golden botanical illustration                         */
/* ------------------------------------------------------------------ */
export function Branch({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 140 300"
      fill="none"
      className={cn("pointer-events-none", flip && "-scale-x-100", className)}
      aria-hidden="true"
    >
      <path
        d="M70 300C62 236 78 170 68 104 64 74 74 40 70 6"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {[
        { y: 262, side: 1, s: 1 },
        { y: 232, side: -1, s: 0.85 },
        { y: 200, side: 1, s: 0.95 },
        { y: 168, side: -1, s: 0.75 },
        { y: 138, side: 1, s: 0.8 },
        { y: 106, side: -1, s: 0.65 },
        { y: 76, side: 1, s: 0.6 },
        { y: 44, side: -1, s: 0.5 },
        { y: 18, side: 1, s: 0.42 },
      ].map((leaf, i) => (
        <g key={i} transform={`translate(${70 + leaf.side * 30 * leaf.s} ${leaf.y}) scale(${leaf.s * leaf.side})`}>
          <path
            d="M0 0C14 -10 26 -9 36 -1C28 8 14 10 0 0Z"
            stroke="currentColor"
            strokeWidth="0.9"
            strokeLinejoin="round"
            className="fill-current opacity-35"
          />
          <path d="M0 0C14 -10 26 -9 36 -1C28 8 14 10 0 0Z" stroke="currentColor" strokeWidth="0.9" strokeLinejoin="round" />
          <path d="M4 0C14 -4 22 -3 30 0" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" className="opacity-70" />
        </g>
      ))}
      <circle cx="70" cy="4" r="2.2" className="fill-current" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Gold divider ornament                                               */
/* ------------------------------------------------------------------ */
export function Divider({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)} aria-hidden="true">
      <span className={cn("h-px w-14", light ? "bg-gold-600/40" : "bg-gold-500/40")} />
      <span className={cn("h-1.5 w-1.5 rotate-45", light ? "bg-gold-600/60" : "bg-gold-500/70")} />
      <span className={cn("h-px w-14", light ? "bg-gold-600/40" : "bg-gold-500/40")} />
    </div>
  );
}

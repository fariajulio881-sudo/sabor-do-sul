import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import BrandLogo from "./BrandLogo";
import { INTRO_GONE_MS, INTRO_LEAVE_MS } from "./timing";

/**
 * Animação de entrada de tela — monograma + marca surgem, e a cortina
 * desliza para cima revelando o site. Respeita prefers-reduced-motion.
 */
export default function Intro() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGone(true);
      return;
    }
    document.body.style.overflow = "hidden";
    const t1 = window.setTimeout(() => setLeaving(true), INTRO_LEAVE_MS);
    const t2 = window.setTimeout(() => {
      setGone(true);
      document.body.style.overflow = "";
    }, INTRO_GONE_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      document.body.style.overflow = "";
    };
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed inset-0 z-[100] grid place-items-center bg-forest-950 transition-all duration-700 ease-out",
        leaving ? "pointer-events-none -translate-y-full opacity-0" : "translate-y-0 opacity-100"
      )}
    >
      <div className="text-center">
        <BrandLogo
          size={120}
          glow
          className="mx-auto h-28 w-28 animate-intro-in drop-shadow-[0_0_50px_rgba(226,112,58,0.4)]"
        />
        <p className="shimmer-light mt-7 animate-intro-up font-display text-4xl font-bold text-cream-50 sm:text-5xl">
          Sabor do <span className="text-gold-grad italic">Sul</span>
        </p>
        <p
          className="mt-3 animate-intro-up text-[10px] font-bold uppercase tracking-[0.5em] text-cream-200/60"
          style={{ animationDelay: "0.55s" }}
        >
          Acendendo o forno…
        </p>
        <span className="mx-auto mt-8 block h-px w-44 animate-intro-line bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
      </div>
    </div>
  );
}

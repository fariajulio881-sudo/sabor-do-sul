import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { NAV_LINKS, waLink } from "../data/content";
import { CloseIcon, MenuIcon, WhatsAppIcon } from "./icons";
import BrandLogo from "./BrandLogo";
import { usePublicData } from "../lib/publicData";
import { buildOrderMessage } from "../lib/payment";

export function Logo({ className }: { className?: string }) {
  return (
    <a href="#inicio" className={cn("group flex items-center gap-3", className)} aria-label="Sabor do Sul — voltar ao início">
      <BrandLogo
        size={52}
        className="h-12 w-12 drop-shadow-[0_2px_14px_rgba(226,112,58,0.35)] transition-transform duration-500 group-hover:scale-105"
      />
      <span className="leading-none">
        <span className="font-display text-[22px] font-bold tracking-wide text-cream-50">
          Sabor do <span className="text-gold-400 italic">Sul</span>
        </span>
        <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.42em] text-cream-200/60">
          João Pessoa • PB
        </span>
      </span>
    </a>
  );
}

export default function Navbar() {
  const { contact: CONTACT } = usePublicData();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-gold-500/15 bg-forest-950/85 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      {/* Barra de progresso de scroll */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 top-0 h-[2px] origin-left bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300 transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0"
        )}
        style={{ transform: `scaleX(${progress})` }}
      />

      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Navegação principal">
        <Logo />

        {/* Menu desktop */}
        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="group relative text-sm font-medium text-cream-200/85 transition-colors hover:text-gold-300"
              >
                {link.label}
                <span
                  className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-gold-500 transition-transform duration-300 group-hover:scale-x-100"
                  aria-hidden="true"
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href={waLink(buildOrderMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className="shine hidden items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-bold text-forest-950 shadow-[0_10px_30px_rgba(226,112,58,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-400 hover:shadow-[0_16px_40px_rgba(226,112,58,0.45)] sm:inline-flex"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Peça Agora
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            className="grid h-11 w-11 place-items-center rounded-full border border-cream-100/20 text-cream-100 transition-colors hover:border-gold-500/60 hover:text-gold-300 lg:hidden"
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-x-0 top-20 bottom-0 z-40 flex flex-col overflow-y-auto bg-forest-950/97 backdrop-blur-2xl transition-all duration-500 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div className="flex flex-1 flex-col justify-between px-6 py-10">
          <ul className="space-y-2">
            {NAV_LINKS.map((link, i) => (
              <li
                key={link.href}
                className={cn(
                  "transition-all duration-500",
                  open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                )}
                style={{ transitionDelay: `${80 + i * 60}ms` }}
              >
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between border-b border-cream-100/10 py-4 font-display text-2xl text-cream-100 transition-colors hover:text-gold-300"
                >
                  {link.label}
                  <span className="text-gold-500 opacity-0 transition-opacity group-hover:opacity-100">→</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="space-y-5 pt-8">
            <a
              href={waLink(buildOrderMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="shine flex items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-4 text-base font-bold text-forest-950 shadow-[0_10px_30px_rgba(226,112,58,0.35)]"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Peça no WhatsApp
            </a>
            <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-cream-200/50">
              {CONTACT.phoneDisplay} • {CONTACT.hours}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

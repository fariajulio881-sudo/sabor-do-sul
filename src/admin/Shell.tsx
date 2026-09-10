import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import { useAuth } from "./AuthContext";

export type AdminTab = { id: string; label: string };

/**
 * Estrutura visual do painel: cabeçalho fixo (marca + usuário + sair),
 * navegação por abas horizontal (mobile-first) e área de conteúdo.
 */
export default function Shell({
  title,
  tabs,
  active,
  onTab,
  children,
}: {
  title: string;
  tabs?: readonly AdminTab[];
  active?: string;
  onTab?: (id: string) => void;
  children: ReactNode;
}) {
  const { session, signOut } = useAuth();

  return (
    <div className="texture-dark min-h-screen bg-forest-950">
      <header className="sticky top-0 z-40 border-b border-gold-500/15 bg-forest-950/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold-500/50 bg-forest-900 font-display text-sm font-bold text-gold-400">
              ⚙
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-lg leading-none font-bold text-cream-50">{title}</p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-cream-200/50">
                Painel administrativo
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href="#inicio"
              className="hidden rounded-full border border-cream-100/20 px-3 py-1.5 text-xs font-bold text-cream-200/80 transition-colors hover:border-gold-500/60 hover:text-gold-300 sm:block"
            >
              Ver site
            </a>
            <span className="hidden max-w-[180px] truncate text-xs text-cream-200/60 md:block">
              {session?.user.email}
            </span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-full border border-cream-100/20 px-3.5 py-1.5 text-xs font-bold text-cream-100 transition-colors hover:border-red-400/50 hover:text-red-300"
            >
              Sair
            </button>
          </div>
        </div>

        {tabs && tabs.length > 0 && (
          <nav className="mx-auto flex max-w-6xl gap-1.5 overflow-x-auto px-4 pb-2.5 sm:px-6" aria-label="Seções do painel">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onTab?.(t.id)}
                aria-current={active === t.id ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 text-xs font-bold whitespace-nowrap transition-all",
                  active === t.id
                    ? "bg-gold-500 text-forest-950 shadow-[0_6px_18px_rgba(226,112,58,0.35)]"
                    : "border border-cream-100/15 text-cream-200/70 hover:border-gold-500/50 hover:text-gold-300"
                )}
              >
                {t.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-20 sm:px-6">{children}</main>

      <a
        href="#inicio"
        className="fixed bottom-4 left-4 z-40 rounded-full border border-gold-500/40 bg-forest-950/90 px-4 py-2 text-xs font-bold text-gold-300 backdrop-blur-md transition-colors hover:bg-gold-500 hover:text-forest-950 sm:hidden"
      >
        ← Ver site
      </a>
    </div>
  );
}

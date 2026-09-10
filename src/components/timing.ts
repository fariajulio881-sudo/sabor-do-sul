/**
 * Timing compartilhado das animações de entrada — garante o mesmo padrão
 * em todo o site (mesma duração, mesma curva, mesmo stagger).
 */

/** Duração padrão de todas as animações de entrada (0.8s ease-out) */
export const ENTRANCE_MS = 800;

/** Stagger padrão entre elementos consecutivos */
export const STAGGER_MS = 150;

/** Momento em que a cortina de intro começa a subir */
export const INTRO_LEAVE_MS = 1000;

/** Momento em que a intro é removida do DOM */
export const INTRO_GONE_MS = 1650;

/**
 * Atraso base do hero: a animação do hero começa assim que a cortina
 * da intro começa a revelar a página (visível imediatamente no carregamento).
 */
export const HERO_BASE_DELAY = 1150;

/** Atraso do stagger em telas com prefers-reduced-motion (zero) */
export function heroDelay(i: number): number {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return 0;
  }
  return HERO_BASE_DELAY + i * STAGGER_MS;
}

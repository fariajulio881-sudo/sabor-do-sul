/**
 * Store mínimo de dados vivos (Supabase → site público).
 * Permite que o número de WhatsApp do restaurante, editado no painel
 * admin, reflita imediatamente em TODOS os botões do site sem tocar
 * em cada componente.
 */

let livePhoneDigits = "";

const listeners = new Set<() => void>();

export function setLivePhone(digits: string) {
  if (livePhoneDigits === digits) return;
  livePhoneDigits = digits;
  listeners.forEach((fn) => fn());
}

export function getLivePhone(): string {
  return livePhoneDigits;
}

export function subscribeLive(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

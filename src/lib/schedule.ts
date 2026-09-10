/* ------------------------------------------------------------------ */
/* Horário de funcionamento — sempre no fuso de BRASÍLIA               */
/* (America/Sao_Paulo), independente do fuso do navegador do usuário.  */
/* Suporta virada de meia-noite: closing < opening (ex: 18:00 → 00:00) */
/* ================================================================== */

export const TIMEZONE = "America/Sao_Paulo";

export type DaySchedule = {
  opening: string; // "HH:MM"
  closing: string; // "HH:MM"
};

/** Hora atual de Brasília (hora e minuto), ignorando o fuso do browser */
export function nowInSaoPaulo(): { h: number; m: number } {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(new Date());
    const h = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
    const m = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
    return { h: Number.isFinite(h) ? h : 0, m: Number.isFinite(m) ? m : 0 };
  } catch {
    // navegador sem suporte a Intl com timeZone — usa hora local como último recurso
    const d = new Date();
    return { h: d.getHours(), m: d.getMinutes() };
  }
}

function toMinutes(hhmm: string): number {
  const [hh, mm] = hhmm.split(":").map((n) => parseInt(n, 10));
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return Number.NaN;
  return hh * 60 + mm;
}

/**
 * O restaurante está aberto AGORA (horário de Brasília)?
 * - opening === closing → aberto 24h
 * - opening <  closing → janela normal (ex: 18:00 → 22:30)
 * - opening >  closing → vira a meia-noite (ex: 18:00 → 00:00):
 *   aberto das 18h até 23h59 e das 00h até a hora de fechar
 */
export function isOpenNow(opening: string, closing: string, now?: { h: number; m: number }): boolean {
  const cur = now ?? nowInSaoPaulo();
  const o = toMinutes(opening);
  const c = toMinutes(closing);

  // dados inválidos: não bloqueia o negócio (assume aberto)
  if (Number.isNaN(o) || Number.isNaN(c)) return true;

  const nowM = cur.h * 60 + cur.m;

  if (o === c) return true;
  if (o < c) return nowM >= o && nowM < c;
  // virada de meia-noite
  return nowM >= o || nowM < c;
}

/** "18:00" → "18h" • "22:30" → "22h30" • "00:00" → "00h" */
export function formatTime(hhmm: string): string {
  const [hh, mm] = hhmm.split(":").map((n) => parseInt(n, 10));
  if (!Number.isFinite(hh)) return hhmm;
  return mm && mm > 0 ? `${hh}h${String(mm).padStart(2, "0")}` : `${hh}h`;
}

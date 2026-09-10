import { isSupabaseConfigured, supabase } from "../utils/supabase";

/* ------------------------------------------------------------------ */
/* Estado de giros da roleta — Supabase (tabela `spins`) com fallback  */
/* para localStorage quando o banco não está configurado.              */
/*                                                                     */
/* Regras: limite de giros por dia POR NÚMERO de WhatsApp (padrão 1),  */
/* meia-noite. O telefone do cliente e o prêmio ganho são gravados na  */
/* tabela spins, alimentando as estatísticas do painel admin.          */
/* ------------------------------------------------------------------ */

const KEY_DAILY = "sds_roulette_daily";

const today = () => new Date().toISOString().slice(0, 10);

export type SpinState = {
  /** giros já usados hoje pelo número informado */
  used: number;
  /** limite diário configurado no restaurante */
  limit: number;
};

async function fetchDailyLimit(restaurantId: string | null, fallback: number): Promise<number> {
  if (isSupabaseConfigured && restaurantId) {
    try {
      const { data } = await supabase
        .from("restaurants")
        .select("roulette_daily_limit")
        .eq("id", restaurantId)
        .maybeSingle();
      if (data && typeof data.roulette_daily_limit === "number") {
        return data.roulette_daily_limit;
      }
    } catch {
      /* usa o fallback */
    }
  }
  return fallback;
}

/**
 * Quantos giros o número já usou hoje (consulta a tabela spins).
 * Com Supabase configurado, a contagem é do banco (vale para qualquer
 * navegador); sem banco, cai no espelho local por telefone.
 */
export async function getSpinState(
  phone: string,
  restaurantId: string | null,
  fallbackLimit = 1
): Promise<SpinState> {
  const limit = await fetchDailyLimit(restaurantId, fallbackLimit);

  if (isSupabaseConfigured && restaurantId) {
    try {
      const { count, error } = await supabase
        .from("spins")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId)
        .eq("telefone_cliente", phone)
        .eq("data_giro", today());
      if (!error) return { used: count ?? 0, limit };
    } catch {
      /* rede fora — cai no espelho local */
    }
  }

  /* fallback local (modo demo / sem banco) */
  try {
    const map = JSON.parse(localStorage.getItem(KEY_DAILY) || "{}") as Record<
      string,
      { date: string; used: number }
    >;
    const entry = map[phone];
    return { used: entry && entry.date === today() ? entry.used : 0, limit };
  } catch {
    return { used: 0, limit };
  }
}

/**
 * Grava o resultado do giro: linha na tabela spins (estatísticas do
 * admin) + espelho local (fallback offline). Nunca bloqueia o giro —
 * se a gravação falhar, o usuário ainda recebe o resultado.
 */
export async function saveSpinState(
  phone: string,
  restaurantId: string | null,
  prizeLabel: string,
  coupon: string | null
): Promise<void> {
  if (isSupabaseConfigured && restaurantId) {
    try {
      await supabase.from("spins").insert({
        restaurant_id: restaurantId,
        telefone_cliente: phone,
        premio_ganho: prizeLabel,
        data_giro: today(),
        cupom: coupon,
      });
    } catch {
      /* RLS/falha de rede — o giro já aconteceu */
    }
  }

  /* espelho local (mantém o limite funcionando mesmo offline) */
  try {
    const map = JSON.parse(localStorage.getItem(KEY_DAILY) || "{}") as Record<
      string,
      { date: string; used: number }
    >;
    const entry = map[phone];
    map[phone] = { date: today(), used: (entry && entry.date === today() ? entry.used : 0) + 1 };
    localStorage.setItem(KEY_DAILY, JSON.stringify(map));
  } catch {
    /* armazenamento indisponível */
  }
}

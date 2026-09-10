import { createClient } from "@supabase/supabase-js";

/* ------------------------------------------------------------------ */
/* CLIENTE SUPABASE CANÔNICO                                           */
/* Lê as credenciais do .env via import.meta.env:                      */
/*   VITE_SUPABASE_URL                                                  */
/*   VITE_SUPABASE_PUBLISHABLE_KEY  (ou VITE_SUPABASE_ANON_KEY, alias)  */
/* ------------------------------------------------------------------ */

const env = (import.meta as unknown as { env?: Record<string, string> }).env ?? {};

const SUPABASE_URL: string = env.VITE_SUPABASE_URL ?? "";
const SUPABASE_PUBLISHABLE_KEY: string =
  env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.VITE_SUPABASE_ANON_KEY ?? "";

export { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY };

/** alias de compatibilidade (projetos que usam o nome "anon key") */
export const SUPABASE_ANON_KEY = SUPABASE_PUBLISHABLE_KEY;

/** Verdadeiro quando as variáveis foram configuradas no .env */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

/**
 * Cliente único do projeto — importe deste arquivo em qualquer componente.
 * A publishable key do Supabase é PROJETADA para ficar pública no bundle;
 * a segurança dos dados vem das políticas RLS, não da chave.
 */
export const supabase = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_PUBLISHABLE_KEY || "public-anon-key-placeholder"
);

/** Bucket público de imagens do cardápio (Supabase Storage) */
export const STORAGE_BUCKET = "menu-images";

/* ------------------------------------------------------------------ */
/* Tipos (espelham o esquema em supabase/schema.sql)                   */
/* ------------------------------------------------------------------ */
export type Role = "superadmin" | "admin";

export type UserRole = {
  id: string;
  user_id: string;
  role: Role;
  restaurant_id: string | null;
  email: string | null;
  created_at: string;
};

export type Restaurant = {
  id: string;
  nome: string;
  whatsapp: string | null;
  logo_url: string | null;
  cor_primaria: string;
  cor_secundaria: string;
  /** horário estruturado (HH:MM) — abertura */
  opening_time: string | null;
  /** horário estruturado (HH:MM) — fechamento; menor que a abertura = vira meia-noite */
  closing_time: string | null;
  /** extras usados pelo site/painel */
  hours: string | null;
  address: string | null;
  instagram: string | null;
  roulette_daily_limit: number | null;
  created_at: string;
};

export type Category = {
  id: string;
  restaurant_id: string;
  name: string;
  position: number;
};

export type MenuItemRow = {
  id: string;
  restaurant_id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string | null;
  foto_url: string | null;
  disponivel: boolean;
  /** extras usados pelo painel */
  category_id: string | null;
  position: number;
  created_at?: string;
};

export type RoulettePrize = {
  id: string;
  restaurant_id: string;
  label: string;
  weight: number;
  active: boolean;
};

export type RouletteSpin = {
  id: string;
  restaurant_id: string;
  prize_id: string | null;
  prize_label: string | null;
  coupon_code: string | null;
  spun_at: string;
};

/** Linha da tabela `spins` (giros da roleta pública) */
export type SpinRow = {
  id: string;
  restaurant_id: string;
  telefone_cliente: string;
  premio_ganho: string;
  /** DATE (YYYY-MM-DD) — usado no limite de 1 giro por dia */
  data_giro: string;
  cupom: string | null;
  created_at: string;
};

/** Linha da tabela `prize_limits` */
export type PrizeLimitRow = {
  id: string;
  restaurant_id: string;
  prize_name: string;
  daily_limit: number;
  given_count: number;
  date: string;
};

/* ------------------------------------------------------------------ */
/* Teste de conexão — execute no console do navegador depois de        */
/* preencher o .env:  await testSupabaseConnection()                   */
/* ------------------------------------------------------------------ */
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      error:
        "Supabase não configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no .env e rode o build novamente.",
    };
  }
  const { count, error } = await supabase
    .from("restaurants")
    .select("id", { count: "exact", head: true });
  return error ? { ok: false, error: error.message } : { ok: true, restaurants: count ?? 0 };
}

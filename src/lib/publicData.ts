import { useEffect, useSyncExternalStore } from "react";
import { isSupabaseConfigured, supabase } from "./supabase";
import { setLivePhone } from "./liveStore";
import {
  CONTACT as STATIC_CONTACT,
  MENU as STATIC_MENU,
  MENU_TABS,
} from "../data/content";

/* ------------------------------------------------------------------ */
/* Ponte de dados vivos: Supabase (painel admin) → site público.       */
/* Quando o Supabase está configurado, o site lê nome, preço, foto,    */
/* disponibilidade e WhatsApp direto do banco — toda edição no admin   */
/* reflete aqui. Sem configuração, usa o conteúdo estático.            */
/* ------------------------------------------------------------------ */

export type PublicMenuRow = {
  id: string;
  name: string;
  desc: string;
  price: string;
  img: string;
  tab: string;
  note?: string;
  tag?: string;
  available: boolean;
};

export type LivePrize = {
  id: string;
  label: string;
  weight: number;
  active: boolean;
};

export type PublicData = {
  contact: typeof STATIC_CONTACT;
  rows: PublicMenuRow[];
  tabs: { id: string; label: string }[];
  /** nome do item → disponível (para cruzar com os cards de destaque) */
  availability: Record<string, boolean>;
  live: boolean;
  /** configuração da roleta vinda do painel admin (vazia = modo local) */
  roulette: {
    prizes: LivePrize[];
    dailyLimit: number;
    restaurantId: string | null;
  };
  /** horário de funcionamento estruturado (HH:MM) */
  schedule: {
    opening: string;
    closing: string;
  };
};

const FALLBACK_IMG = "/images/hero-pizza.png";

const staticRows: PublicMenuRow[] = STATIC_MENU.map((m) => ({
  id: m.name,
  name: m.name,
  desc: m.desc,
  price: m.price ?? "Preço no WhatsApp",
  img: m.img,
  tab: m.cat,
  note: m.note,
  tag: m.tag,
  available: true,
}));

const STATIC_DATA: PublicData = {
  contact: STATIC_CONTACT,
  rows: staticRows,
  tabs: [...MENU_TABS],
  availability: {},
  live: false,
  roulette: { prizes: [], dailyLimit: 1, restaurantId: null },
  schedule: {
    opening: STATIC_CONTACT.openingTime,
    closing: STATIC_CONTACT.closingTime,
  },
};

let snapshot: PublicData = STATIC_DATA;
const listeners = new Set<() => void>();
let started = false;

function emit(next: PublicData) {
  snapshot = next;
  listeners.forEach((fn) => fn());
}

async function fetchLive() {
  if (!isSupabaseConfigured) return;
  const [rRes, cRes, iRes, pRes] = await Promise.all([
    supabase.from("restaurants").select("*").limit(10),
    supabase.from("categories").select("*"),
    supabase.from("menu_items").select("*"),
    supabase.from("roulette_prizes").select("*"),
  ]);
  const restaurants = rRes.data ?? [];
  if (restaurants.length === 0) return;

  // implantação de restaurante único: escolhe pelo nome ou o primeiro
  const r =
    restaurants.find((x) => x.nome === STATIC_CONTACT.name) ??
    restaurants[0];
  const digits = (r.whatsapp ?? "").replace(/\D/g, "");
  if (digits) setLivePhone(digits);

  const cats = (cRes.data ?? [])
    .filter((c) => c.restaurant_id === r.id)
    .sort((a, b) => a.position - b.position);
  const items = (iRes.data ?? [])
    .filter((i) => i.restaurant_id === r.id)
    .sort((a, b) => a.position - b.position);

  const catName = (id: string | null, fallback?: string | null) =>
    cats.find((c) => c.id === id)?.name ?? fallback ?? "Outros";

  const rows: PublicMenuRow[] = items.map((it) => ({
    id: it.id,
    name: it.nome,
    desc: it.descricao,
    price:
      (Number(it.preco) || 0) > 0
        ? `R$ ${Number(it.preco).toFixed(2).replace(".", ",")}`
        : "Preço no WhatsApp",
    img: it.foto_url ?? FALLBACK_IMG,
    tab: catName(it.category_id, it.categoria),
    available: it.disponivel,
  }));

  const tabs = [
    { id: "todos", label: "Todos" },
    ...cats.map((c) => ({ id: c.name, label: c.name })),
  ];

  const availability: Record<string, boolean> = {};
  for (const it of items) availability[it.nome] = it.disponivel;

  // roleta configurada no painel admin
  const prizes = (pRes.data ?? [])
    .filter((p) => p.restaurant_id === r.id)
    .map((p) => ({ id: p.id, label: p.label, weight: p.weight, active: p.active }));

  emit({
    contact: {
      ...STATIC_CONTACT,
      phoneDisplay: r.whatsapp || STATIC_CONTACT.phoneDisplay,
      phoneDigits: digits || STATIC_CONTACT.phoneDigits,
      address: r.address || STATIC_CONTACT.address,
      hours: r.hours || STATIC_CONTACT.hours,
      instagram: r.instagram || STATIC_CONTACT.instagram,
    },
    rows: rows.length > 0 ? rows : staticRows,
    tabs,
    availability,
    live: true,
    roulette: {
      prizes,
      dailyLimit: r.roulette_daily_limit ?? 1,
      restaurantId: r.id,
    },
    schedule: {
      opening: r.opening_time || STATIC_CONTACT.openingTime,
      closing: r.closing_time || STATIC_CONTACT.closingTime,
    },
  });
}

export function usePublicData(): PublicData {
  const data = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => snapshot
  );

  useEffect(() => {
    if (!started) {
      started = true;
      void fetchLive();
    }
  }, []);

  return data;
}

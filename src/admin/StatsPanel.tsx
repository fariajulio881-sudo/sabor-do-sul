import { useCallback, useEffect, useState } from "react";
import { supabase, type Category, type MenuItemRow, type RoulettePrize, type SpinRow } from "../lib/supabase";
import { Card, EmptyState, Spinner, StatCard } from "./ui";

/**
 * Estatísticas da roleta — lê a tabela `spins` (giros gravados pelo site
 * público) e a configuração de prêmios do restaurante.
 */
export default function StatsPanel({ restaurantId }: { restaurantId: string }) {
  const [spins, setSpins] = useState<SpinRow[]>([]);
  const [prizes, setPrizes] = useState<RoulettePrize[]>([]);
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [sRes, pRes, iRes, cRes] = await Promise.all([
      supabase
        .from("spins")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("data", { ascending: false })
        .limit(500),
      supabase.from("roulette_prizes").select("*").eq("restaurant_id", restaurantId),
      supabase.from("menu_items").select("*").eq("restaurant_id", restaurantId),
      supabase.from("categories").select("*").eq("restaurant_id", restaurantId),
    ]);
    setSpins((sRes.data ?? []) as SpinRow[]);
    setPrizes(pRes.data ?? []);
    setItems(iRes.data ?? []);
    setCats(cRes.data ?? []);
    setLoading(false);
  }, [restaurantId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const spinsToday = spins.filter((s) => s.data_giro >= todayIso);

  const counts = new Map<string, number>();
  for (const s of spins) {
    const key = s.premio_ganho || "—";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const topPrizes = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxCount = topPrizes[0]?.[1] ?? 1;

  const activePrizes = prizes.filter((p) => p.active).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Cupons sorteados" value={spins.length} sub="Total histórico" />
        <StatCard label="Giros hoje" value={spinsToday.length} />
        <StatCard
          label="Prêmio mais sorteado"
          value={topPrizes[0]?.[0] ?? "—"}
          sub={topPrizes[0] ? `${topPrizes[0][1]}×` : undefined}
        />
        <StatCard
          label="Itens no cardápio"
          value={items.length}
          sub={`${items.filter((i) => i.disponivel).length} disponíveis • ${cats.length} categorias`}
        />
      </div>

      {topPrizes.length === 0 ? (
        <EmptyState
          title="Nenhum giro registrado ainda"
          sub="Os sorteios da roleta do site aparecerão aqui em tempo real."
        />
      ) : (
        <Card>
          <h3 className="font-display text-lg font-semibold text-cream-50">Prêmios mais sorteados</h3>
          {activePrizes > 0 && (
            <p className="mt-1 text-xs text-cream-200/50">{activePrizes} prêmios ativos na roleta.</p>
          )}
          <ul className="mt-4 space-y-3">
            {topPrizes.map(([label, count]) => (
              <li key={label}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-semibold text-cream-100">{label}</span>
                  <span className="shrink-0 text-xs font-bold text-gold-300">{count}×</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-forest-950/80">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-400"
                    style={{ width: `${Math.max(4, (count / maxCount) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {spins.length > 0 && (
        <Card>
          <h3 className="font-display text-lg font-semibold text-cream-50">Últimos giros</h3>
          <ul className="mt-3 divide-y divide-forest-700/50">
            {spins.slice(0, 8).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="min-w-0">
                  <span className="block truncate text-cream-100">{s.premio_ganho}</span>
                  <span className="block text-xs text-cream-200/50">
                    📱 {s.telefone_cliente}
                    {s.cupom ? ` • cupom ${s.cupom}` : ""}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-cream-200/50">
                  {new Date(s.created_at).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

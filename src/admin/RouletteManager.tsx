import { useCallback, useEffect, useState } from "react";
import { supabase, type RoulettePrize } from "../lib/supabase";
import { Button, Card, EmptyState, Field, Spinner, TextInput, Toggle } from "./ui";

type Draft = { id?: string; label: string; weight: string; active: boolean };

const EMPTY: Draft = { label: "", weight: "10", active: true };

export default function RouletteManager({ restaurantId }: { restaurantId: string }) {
  const [prizes, setPrizes] = useState<RoulettePrize[]>([]);
  const [limit, setLimit] = useState(3);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [limitSaved, setLimitSaved] = useState(false);

  const load = useCallback(async () => {
    const [pRes, rRes] = await Promise.all([
      supabase.from("roulette_prizes").select("*").eq("restaurant_id", restaurantId),
      supabase.from("restaurants").select("roulette_daily_limit").eq("id", restaurantId).maybeSingle(),
    ]);
    setPrizes(pRes.data ?? []);
    setLimit(rRes.data?.roulette_daily_limit ?? 1);
    setLoading(false);
  }, [restaurantId]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!draft || !draft.label.trim()) return;
    setBusy(true);
    const payload = {
      restaurant_id: restaurantId,
      label: draft.label.trim(),
      weight: Math.max(1, parseInt(draft.weight, 10) || 1),
      active: draft.active,
    };
    const { error } = draft.id
      ? await supabase.from("roulette_prizes").update(payload).eq("id", draft.id)
      : await supabase.from("roulette_prizes").insert(payload);
    setBusy(false);
    if (error) {
      alert(`Erro ao salvar: ${error.message}`);
      return;
    }
    setDraft(null);
    void load();
  };

  const toggle = async (p: RoulettePrize) => {
    await supabase.from("roulette_prizes").update({ active: !p.active }).eq("id", p.id);
    void load();
  };

  const remove = async (p: RoulettePrize) => {
    if (!window.confirm(`Remover o prêmio "${p.label}"?`)) return;
    await supabase.from("roulette_prizes").delete().eq("id", p.id);
    void load();
  };

  const saveLimit = async () => {
    setLimitSaved(false);
    await supabase
      .from("restaurants")
      .update({ roulette_daily_limit: Math.max(1, limit) })
      .eq("id", restaurantId);
    setLimitSaved(true);
    window.setTimeout(() => setLimitSaved(false), 2500);
  };

  const totalWeight = prizes.filter((p) => p.active).reduce((acc, p) => acc + p.weight, 0);

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-display text-lg font-semibold text-cream-50">Limite de giros por dia</h3>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div className="w-32">
            <Field label="Giros / dia">
              <TextInput
                type="number"
                min={1}
                max={50}
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value, 10) || 1)}
              />
            </Field>
          </div>
          <Button onClick={() => void saveLimit()}>Salvar limite</Button>
          {limitSaved && <span className="text-sm font-bold text-gold-400">✓ Salvo!</span>}
        </div>
        <p className="mt-2 text-xs text-cream-200/50">
          Controle o número de giros que cada visitante pode fazer por dia na roleta de descontos.
        </p>
      </Card>

      <Card className="border-gold-500/40">
        <h3 className="font-display text-lg font-semibold text-cream-50">
          {draft?.id ? "Editar prêmio" : "Novo prêmio"}
        </h3>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <div className="min-w-48 flex-1">
            <Field label="Prêmio *" hint="Ex.: 10% OFF, Frete grátis, Pizza doce broto…">
              <TextInput
                value={draft?.label ?? ""}
                onChange={(e) => setDraft((d) => ({ ...(d ?? EMPTY), label: e.target.value }))}
              />
            </Field>
          </div>
          <div className="w-28">
            <Field label="Peso (chance)">
              <TextInput
                type="number"
                min={1}
                value={draft?.weight ?? "10"}
                onChange={(e) => setDraft((d) => ({ ...(d ?? EMPTY), weight: e.target.value }))}
              />
            </Field>
          </div>
          <div className="pb-2.5">
            <Toggle
              checked={draft?.active ?? true}
              onChange={(v) => setDraft((d) => ({ ...(d ?? EMPTY), active: v }))}
              label={draft?.active ?? true ? "Ativo" : "Pausado"}
            />
          </div>
          <Button onClick={() => void save()} disabled={busy || !draft?.label.trim()}>
            {busy ? <Spinner /> : "Salvar prêmio"}
          </Button>
          {draft && (
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Cancelar
            </Button>
          )}
        </div>
      </Card>

      {prizes.length === 0 ? (
        <EmptyState title="Nenhum prêmio configurado" sub="Adicione prêmios para montar a roleta de descontos." />
      ) : (
        <Card>
          <ul className="space-y-3">
            {prizes.map((p) => {
              const pct = totalWeight > 0 ? Math.round((p.weight / totalWeight) * 100) : 0;
              return (
                <li key={p.id} className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-cream-50">
                      <span className="truncate">{p.label}</span>
                      {!p.active && (
                        <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-red-300 uppercase">
                          Pausado
                        </span>
                      )}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="h-1.5 w-full max-w-52 overflow-hidden rounded-full bg-forest-950/80">
                        <span
                          className="block h-full rounded-full bg-gold-500"
                          style={{ width: `${p.active ? pct : 0}%` }}
                        />
                      </span>
                      <span className="shrink-0 text-[11px] font-bold text-gold-300">
                        {p.active ? `${pct}% de chance` : "0%"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Toggle checked={p.active} onChange={() => void toggle(p)} />
                    <Button
                      variant="ghost"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => setDraft({ id: p.id, label: p.label, weight: String(p.weight), active: p.active })}
                    >
                      Editar
                    </Button>
                    <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => void remove(p)}>
                      Remover
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 border-t border-forest-700/50 pt-3 text-xs text-cream-200/50">
            As probabilidades são calculadas automaticamente pelo peso de cada prêmio ativo.
          </p>
        </Card>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import { supabase, type Category } from "../lib/supabase";
import { Button, Card, EmptyState, Field, Spinner, TextInput } from "./ui";

export default function CategoriesManager({ restaurantId }: { restaurantId: string }) {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("position");
    setCats(data ?? []);
    setLoading(false);
  }, [restaurantId]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async () => {
    if (!name.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("categories").insert({
      restaurant_id: restaurantId,
      name: name.trim(),
      position: cats.length,
    });
    setBusy(false);
    if (error) {
      alert(`Erro ao criar: ${error.message}`);
      return;
    }
    setName("");
    void load();
  };

  const rename = async (id: string) => {
    if (!editName.trim()) return;
    await supabase.from("categories").update({ name: editName.trim() }).eq("id", id);
    setEditingId(null);
    void load();
  };

  const move = async (cat: Category, dir: -1 | 1) => {
    const idx = cats.findIndex((c) => c.id === cat.id);
    const other = cats[idx + dir];
    if (!other) return;
    await Promise.all([
      supabase.from("categories").update({ position: other.position }).eq("id", cat.id),
      supabase.from("categories").update({ position: cat.position }).eq("id", other.id),
    ]);
    void load();
  };

  const remove = async (cat: Category) => {
    if (!window.confirm(`Remover a categoria "${cat.name}"? Os itens dela ficarão sem categoria.`)) return;
    await supabase.from("categories").delete().eq("id", cat.id);
    void load();
  };

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
        <h3 className="font-display text-lg font-semibold text-cream-50">Nova categoria</h3>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div className="min-w-52 flex-1">
            <Field label="Nome da categoria">
              <TextInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Pizzas Salgadas"
                onKeyDown={(e) => e.key === "Enter" && void create()}
              />
            </Field>
          </div>
          <Button onClick={() => void create()} disabled={busy || !name.trim()}>
            {busy ? <Spinner /> : "+ Criar"}
          </Button>
        </div>
      </Card>

      {cats.length === 0 ? (
        <EmptyState title="Nenhuma categoria ainda" sub="Crie categorias como 'Pizzas Salgadas', 'Doces' e 'Bebidas'." />
      ) : (
        <ul className="divide-y divide-forest-700/50 overflow-hidden rounded-2xl border border-forest-700/60 bg-forest-850/40">
          {cats.map((cat, i) => (
            <li key={cat.id} className="flex flex-wrap items-center gap-2 p-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-forest-950/70 text-xs font-bold text-gold-400">
                {i + 1}
              </span>
              {editingId === cat.id ? (
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <TextInput
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void rename(cat.id)}
                    className="max-w-xs"
                  />
                  <Button className="px-3 py-1.5 text-xs" onClick={() => void rename(cat.id)}>
                    Salvar
                  </Button>
                  <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setEditingId(null)}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <p className="min-w-0 flex-1 truncate text-sm font-bold text-cream-50">{cat.name}</p>
              )}
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  className="px-2.5 py-1.5 text-xs"
                  disabled={i === 0}
                  onClick={() => void move(cat, -1)}
                  aria-label={`Subir ${cat.name}`}
                >
                  ↑
                </Button>
                <Button
                  variant="ghost"
                  className="px-2.5 py-1.5 text-xs"
                  disabled={i === cats.length - 1}
                  onClick={() => void move(cat, 1)}
                  aria-label={`Descer ${cat.name}`}
                >
                  ↓
                </Button>
                {editingId !== cat.id && (
                  <Button
                    variant="ghost"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => {
                      setEditingId(cat.id);
                      setEditName(cat.name);
                    }}
                  >
                    Renomear
                  </Button>
                )}
                <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => void remove(cat)}>
                  Remover
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

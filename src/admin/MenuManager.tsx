import { useCallback, useEffect, useState } from "react";
import { supabase, type Category, type MenuItemRow } from "../lib/supabase";
import { Button, Card, EmptyState, Field, Select, Spinner, TextArea, TextInput, Toggle } from "./ui";
import ImageUpload from "./ImageUpload";

type Draft = {
  id?: string;
  name: string;
  description: string;
  price: string;
  category_id: string;
  image_url: string | null;
  available: boolean;
};

const EMPTY_DRAFT: Draft = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  image_url: null,
  available: true,
};

export default function MenuManager({ restaurantId }: { restaurantId: string }) {
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    const [cRes, iRes] = await Promise.all([
      supabase.from("categories").select("*").eq("restaurant_id", restaurantId).order("position"),
      supabase.from("menu_items").select("*").eq("restaurant_id", restaurantId).order("position"),
    ]);
    setCategories(cRes.data ?? []);
    setItems(iRes.data ?? []);
    setLoading(false);
  }, [restaurantId]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!editing || !editing.name.trim()) return;
    setBusy(true);
    const cat = categories.find((c) => c.id === (editing.category_id || ""));
    const payload = {
      restaurant_id: restaurantId,
      nome: editing.name.trim(),
      descricao: editing.description.trim(),
      preco: editing.price ? parseFloat(editing.price.replace(",", ".")) : 0,
      categoria: cat?.name ?? null,
      category_id: editing.category_id || null,
      foto_url: editing.image_url,
      disponivel: editing.available,
    };
    const { error } = editing.id
      ? await supabase.from("menu_items").update(payload).eq("id", editing.id)
      : await supabase.from("menu_items").insert(payload);
    setBusy(false);
    if (error) {
      alert(`Erro ao salvar: ${error.message}`);
      return;
    }
    setEditing(null);
    void load();
  };

  const toggleAvailable = async (item: MenuItemRow) => {
    await supabase.from("menu_items").update({ disponivel: !item.disponivel }).eq("id", item.id);
    void load();
  };

  const remove = async (item: MenuItemRow) => {
    if (!window.confirm(`Remover "${item.nome}" do cardápio?`)) return;
    await supabase.from("menu_items").delete().eq("id", item.id);
    void load();
  };

  const shown = items.filter(
    (it) =>
      (filter === "all" || it.category_id === filter || (filter === "none" && !it.category_id)) &&
      it.nome.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => setEditing({ ...EMPTY_DRAFT, category_id: categories[0]?.id ?? "" })}>
          + Novo item
        </Button>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-auto min-w-40">
          <option value="all">Todas as categorias</option>
          <option value="none">Sem categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <TextInput
          placeholder="Buscar item…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full sm:w-56"
        />
        <span className="text-xs text-cream-200/50">
          {shown.length} de {items.length} itens
        </span>
      </div>

      {editing && (
        <Card className="border-gold-500/40">
          <h3 className="font-display text-lg font-semibold text-cream-50">
            {editing.id ? "Editar item" : "Novo item do cardápio"}
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Nome *">
                <TextInput
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="Ex.: Pizza Grande"
                />
              </Field>
            </div>
            <Field label="Preço (R$)" hint="Deixe vazio para 'preço sob consulta'">
              <TextInput
                inputMode="decimal"
                value={editing.price}
                onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                placeholder="42,90"
              />
            </Field>
            <Field label="Categoria">
              <Select
                value={editing.category_id}
                onChange={(e) => setEditing({ ...editing, category_id: e.target.value })}
              >
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Descrição">
                <TextArea
                  rows={2}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="Massa italiana, 10 fatias, até 2 sabores…"
                />
              </Field>
            </div>
            <ImageUpload
              value={editing.image_url}
              onUploaded={(url) => setEditing({ ...editing, image_url: url })}
            />
            <div className="flex items-end">
              <Toggle
                checked={editing.available}
                onChange={(v) => setEditing({ ...editing, available: v })}
                label={editing.available ? "Disponível" : "Indisponível"}
              />
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <Button onClick={() => void save()} disabled={busy || !editing.name.trim()}>
              {busy ? <Spinner /> : "Salvar item"}
            </Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {shown.length === 0 ? (
        <EmptyState
          title="Nenhum item por aqui"
          sub="Crie o primeiro item do cardápio clicando em '+ Novo item'."
        />
      ) : (
        <ul className="divide-y divide-forest-700/50 overflow-hidden rounded-2xl border border-forest-700/60 bg-forest-850/40">
          {shown.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap sm:gap-4">
              {item.foto_url ? (
                <img
                  src={item.foto_url}
                  alt={item.nome}
                  className="h-12 w-12 shrink-0 rounded-xl border border-forest-700 object-cover"
                />
              ) : (
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-forest-950/60 text-lg">
                  🍕
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-cream-50">
                  <span className="truncate">{item.nome}</span>
                  {!item.disponivel && (
                    <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-red-300 uppercase">
                      Indisponível
                    </span>
                  )}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-cream-200/55">
                  {item.descricao || "Sem descrição"}
                </p>
                <p className="text-xs font-bold text-gold-400">
                  {item.preco > 0 ? `R$ ${item.preco.toFixed(2).replace(".", ",")}` : "Preço sob consulta"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Toggle checked={item.disponivel} onChange={() => void toggleAvailable(item)} />
                <Button
                  variant="ghost"
                  className="px-3 py-1.5 text-xs"
                  onClick={() =>
                    setEditing({
                      id: item.id,
                      name: item.nome,
                      description: item.descricao,
                      price: item.preco ? String(item.preco).replace(".", ",") : "",
                      category_id: item.category_id ?? "",
                      image_url: item.foto_url,
                      available: item.disponivel,
                    })
                  }
                >
                  Editar
                </Button>
                <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => void remove(item)}>
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

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { supabase, type Category, type MenuItemRow, type Restaurant, type RouletteSpin } from "../../lib/supabase";
import { useAuth } from "../AuthContext";
import Shell, { type AdminTab } from "../Shell";
import { Button, Card, EmptyState, Field, Select, Spinner, StatCard, TextInput } from "../ui";

const TABS = [
  { id: "restaurantes", label: "Restaurantes" },
  { id: "admins", label: "Administradores" },
  { id: "geral", label: "Visão geral" },
] as const satisfies readonly AdminTab[];

type TabId = (typeof TABS)[number]["id"];

type AdminRoleRow = {
  id: string;
  user_id: string;
  role: string;
  restaurant_id: string | null;
  email: string | null;
  restaurants: { name: string }[] | null;
};

export default function SuperAdminDashboard() {
  const { refreshRole } = useAuth();
  const [tab, setTab] = useState<TabId>("restaurantes");

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [roles, setRoles] = useState<AdminRoleRow[]>([]);
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [spins, setSpins] = useState<RouletteSpin[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  /* formulários */
  const [rName, setRName] = useState("");
  const [rWhats, setRWhats] = useState("");
  const [aEmail, setAEmail] = useState("");
  const [aPassword, setAPassword] = useState("");
  const [aRestaurant, setARestaurant] = useState("");
  const [formBusy, setFormBusy] = useState(false);
  const [formMsg, setFormMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const [rRes, roRes, iRes, cRes, sRes] = await Promise.all([
      supabase.from("restaurants").select("*").order("created_at"),
      supabase.from("user_roles").select("id, user_id, role, restaurant_id, email, restaurants(name)"),
      supabase.from("menu_items").select("id, restaurant_id, nome, disponivel, preco"),
      supabase.from("categories").select("*"),
      supabase.from("roulette_spins").select("*"),
    ]);
    setRestaurants(rRes.data ?? []);
    setRoles((roRes.data ?? []) as AdminRoleRow[]);
    setItems((iRes.data ?? []) as MenuItemRow[]);
    setCategories(cRes.data ?? []);
    setSpins(sRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /* ---------- restaurantes ---------- */
  const createRestaurant = async (e: FormEvent) => {
    e.preventDefault();
    if (!rName.trim()) return;
    setFormBusy(true);
    setFormMsg(null);
    const { error } = await supabase
      .from("restaurants")
      .insert({ nome: rName.trim(), whatsapp: rWhats.trim() || null });
    setFormBusy(false);
    if (error) {
      setFormMsg({ ok: false, text: error.message });
      return;
    }
    setFormMsg({ ok: true, text: "Restaurante criado!" });
    setRName("");
    setRWhats("");
    void load();
  };

  const removeRestaurant = async (r: Restaurant) => {
    if (!window.confirm(`Remover o restaurante "${r.nome}" e todos os dados dele?`)) return;
    await supabase.from("restaurants").delete().eq("id", r.id);
    void load();
  };

  /* ---------- admins ---------- */
  const createAdmin = async (e: FormEvent) => {
    e.preventDefault();
    if (!aEmail.trim() || !aPassword || !aRestaurant) return;
    setFormBusy(true);
    setFormMsg(null);

    // preserva a sessão do superadmin para restaurá-la depois
    const { data: cur } = await supabase.auth.getSession();

    const { data: signUp, error: signUpErr } = await supabase.auth.signUp({
      email: aEmail.trim(),
      password: aPassword,
      options: { emailRedirectTo: window.location.origin + window.location.pathname + "#/admin/login" },
    });

    // restaura a sessão do superadmin (o signUp troca a sessão corrente)
    if (cur.session) {
      await supabase.auth.setSession({
        access_token: cur.session.access_token,
        refresh_token: cur.session.refresh_token ?? "",
      });
    }

    if (signUpErr) {
      setFormBusy(false);
      setFormMsg({
        ok: false,
        text:
          signUpErr.message.toLowerCase().includes("already")
            ? "Já existe uma conta com esse email no Supabase. Verifique em Authentication → Users."
            : signUpErr.message,
      });
      return;
    }

    const userId = signUp.user?.id;
    if (!userId) {
      setFormBusy(false);
      setFormMsg({ ok: false, text: "Conta criada, mas não foi possível identificá-la." });
      return;
    }

    const { error: roleErr } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: "admin",
      restaurant_id: aRestaurant,
      email: aEmail.trim(),
    });

    setFormBusy(false);
    if (roleErr) {
      setFormMsg({ ok: false, text: `Conta criada, mas falha ao vincular: ${roleErr.message}` });
      return;
    }
    setFormMsg({ ok: true, text: "Admin criado e vinculado ao restaurante!" });
    setAEmail("");
    setAPassword("");
    setARestaurant("");
    await refreshRole();
    void load();
  };

  const reassign = async (row: AdminRoleRow, restaurantId: string) => {
    await supabase.from("user_roles").update({ restaurant_id: restaurantId || null }).eq("id", row.id);
    void load();
  };

  const removeAdmin = async (row: AdminRoleRow) => {
    if (!window.confirm(`Remover o acesso de "${row.email ?? "este admin"}"?`)) return;
    await supabase.from("user_roles").delete().eq("id", row.id);
    void load();
  };

  const admins = roles.filter((r) => r.role === "admin");

  if (loading) {
    return (
      <Shell title="Superadmin">
        <div className="grid place-items-center py-24">
          <Spinner className="h-8 w-8" />
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Superadmin — sistema" tabs={TABS} active={tab} onTab={(id) => setTab(id as TabId)}>
      {tab === "geral" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Restaurantes" value={restaurants.length} />
          <StatCard label="Administradores" value={admins.length} />
          <StatCard label="Itens no sistema" value={items.length} />
          <StatCard label="Cupons sorteados" value={spins.length} />
        </div>
      )}

      {tab === "restaurantes" && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-display text-lg font-semibold text-cream-50">Novo restaurante</h3>
            <form onSubmit={createRestaurant} className="mt-3 flex flex-wrap items-end gap-2">
              <div className="min-w-48 flex-1">
                <Field label="Nome *">
                  <TextInput value={rName} onChange={(e) => setRName(e.target.value)} placeholder="Ex.: Sabor do Sul" />
                </Field>
              </div>
              <div className="min-w-40 flex-1">
                <Field label="WhatsApp">
                  <TextInput value={rWhats} onChange={(e) => setRWhats(e.target.value)} placeholder="(83) 99330-9886" />
                </Field>
              </div>
              <Button type="submit" disabled={formBusy || !rName.trim()}>
                {formBusy ? <Spinner /> : "+ Criar"}
              </Button>
            </form>
            {formMsg && (
              <p
                className={`mt-3 rounded-xl px-3 py-2 text-sm ${
                  formMsg.ok ? "bg-gold-500/10 text-gold-200" : "bg-red-400/10 text-red-200"
                }`}
              >
                {formMsg.text}
              </p>
            )}
          </Card>

          {restaurants.length === 0 ? (
            <EmptyState title="Nenhum restaurante cadastrado" sub="Crie o primeiro restaurante acima." />
          ) : (
            <ul className="space-y-3">
              {restaurants.map((r) => {
                const rItems = items.filter((i) => i.restaurant_id === r.id);
                const rCats = categories.filter((c) => c.restaurant_id === r.id);
                const rSpins = spins.filter((s) => s.restaurant_id === r.id);
                const isOpen = expanded === r.id;
                return (
                  <li key={r.id}>
                    <Card className={isOpen ? "border-gold-500/50" : undefined}>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-lg font-bold text-cream-50">{r.nome}</p>
                          <p className="mt-0.5 text-xs text-cream-200/55">
                            {r.whatsapp ?? "sem WhatsApp"} • {rCats.length} categorias • {rItems.length} itens •{" "}
                            {rSpins.length} giros
                          </p>
                        </div>
                        <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setExpanded(isOpen ? null : r.id)}>
                          {isOpen ? "Fechar cardápio" : "Ver cardápio"}
                        </Button>
                        <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => void removeRestaurant(r)}>
                          Remover
                        </Button>
                      </div>

                      {isOpen && (
                        <div className="mt-4 border-t border-forest-700/50 pt-4">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cream-200/50">
                            Itens do cardápio
                          </p>
                          {rItems.length === 0 ? (
                            <p className="text-sm text-cream-200/55">Ainda sem itens.</p>
                          ) : (
                            <ul className="grid gap-1.5 sm:grid-cols-2">
                              {rItems.map((it) => (
                                <li key={it.id} className="flex items-center justify-between gap-2 rounded-lg bg-forest-950/50 px-3 py-2 text-sm">
                                  <span className="min-w-0 truncate text-cream-100">
                                    {it.nome}
                                    {!it.disponivel && (
                                      <span className="ml-1.5 text-[9px] font-extrabold text-red-300 uppercase">• off</span>
                                    )}
                                  </span>
                                  <span className="shrink-0 text-xs font-bold text-gold-400">
                                    {it.preco > 0 ? `R$ ${it.preco.toFixed(2).replace(".", ",")}` : "—"}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {tab === "admins" && (
        <div className="space-y-4">
          <Card>
            <h3 className="font-display text-lg font-semibold text-cream-50">Criar conta de admin</h3>
            <p className="mt-1 text-xs text-cream-200/55">
              Cria a conta (email + senha inicial) e vincula ao restaurante escolhido.
            </p>
            <form onSubmit={createAdmin} className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Email do admin *">
                <TextInput type="email" required value={aEmail} onChange={(e) => setAEmail(e.target.value)} placeholder="dono@restaurante.com" />
              </Field>
              <Field label="Senha inicial *" hint="Mínimo de 6 caracteres">
                <TextInput type="password" required minLength={6} value={aPassword} onChange={(e) => setAPassword(e.target.value)} placeholder="••••••" />
              </Field>
              <Field label="Restaurante vinculado *">
                <Select required value={aRestaurant} onChange={(e) => setARestaurant(e.target.value)}>
                  <option value="">Selecione…</option>
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nome}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="flex items-end">
                <Button type="submit" disabled={formBusy || !aEmail.trim() || !aPassword || !aRestaurant}>
                  {formBusy ? <Spinner /> : "+ Criar admin"}
                </Button>
              </div>
            </form>
            {formMsg && (
              <p
                className={`mt-3 rounded-xl px-3 py-2 text-sm ${
                  formMsg.ok ? "bg-gold-500/10 text-gold-200" : "bg-red-400/10 text-red-200"
                }`}
              >
                {formMsg.text}
              </p>
            )}
          </Card>

          {admins.length === 0 ? (
            <EmptyState title="Nenhum admin cadastrado" sub="Crie a primeira conta de dono de restaurante acima." />
          ) : (
            <ul className="space-y-3">
              {admins.map((a) => (
                <li key={a.id}>
                  <Card>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-cream-50">{a.email ?? "—"}</p>
                        <p className="mt-0.5 text-xs text-cream-200/55">
                          {a.restaurants?.[0]?.name ?? "Sem restaurante vinculado"}
                        </p>
                      </div>
                      <Select
                        value={a.restaurant_id ?? ""}
                        onChange={(e) => void reassign(a, e.target.value)}
                        className="w-auto min-w-44"
                        aria-label={`Restaurante de ${a.email ?? "admin"}`}
                      >
                        <option value="">Sem restaurante</option>
                        {restaurants.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.nome}
                          </option>
                        ))}
                      </Select>
                      <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => void removeAdmin(a)}>
                        Remover acesso
                      </Button>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Shell>
  );
}

import { useState } from "react";
import { useAuth } from "../AuthContext";
import Shell, { type AdminTab } from "../Shell";
import { EmptyState } from "../ui";
import MenuManager from "../MenuManager";
import CategoriesManager from "../CategoriesManager";
import RestaurantSettings from "../RestaurantSettings";
import RouletteManager from "../RouletteManager";
import StatsPanel from "../StatsPanel";

const TABS = [
  { id: "cardapio", label: "Cardápio" },
  { id: "categorias", label: "Categorias" },
  { id: "restaurante", label: "Restaurante" },
  { id: "roleta", label: "Roleta" },
  { id: "stats", label: "Estatísticas" },
] as const satisfies readonly AdminTab[];

type TabId = (typeof TABS)[number]["id"];

export default function AdminDashboard() {
  const { restaurantId } = useAuth();
  const [tab, setTab] = useState<TabId>("cardapio");

  if (!restaurantId) {
    return (
      <Shell title="Painel do restaurante">
        <EmptyState
          title="Sua conta ainda não está vinculada a um restaurante"
          sub="Peça ao superadmin para associar sua conta a um restaurante."
        />
      </Shell>
    );
  }

  return (
    <Shell title="Meu restaurante" tabs={TABS} active={tab} onTab={(id) => setTab(id as TabId)}>
      {tab === "cardapio" && <MenuManager restaurantId={restaurantId} />}
      {tab === "categorias" && <CategoriesManager restaurantId={restaurantId} />}
      {tab === "restaurante" && <RestaurantSettings restaurantId={restaurantId} />}
      {tab === "roleta" && <RouletteManager restaurantId={restaurantId} />}
      {tab === "stats" && <StatsPanel restaurantId={restaurantId} />}
    </Shell>
  );
}

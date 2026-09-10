import { useCallback, useEffect, useState } from "react";
import { supabase, type Restaurant } from "../lib/supabase";
import { Button, Card, Field, Spinner, TextArea, TextInput } from "./ui";
import ImageUpload from "./ImageUpload";

export default function RestaurantSettings({ restaurantId }: { restaurantId: string }) {
  const [r, setR] = useState<Restaurant | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("restaurants").select("*").eq("id", restaurantId).maybeSingle();
    setR((data as Restaurant) ?? null);
  }, [restaurantId]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!r) return;
    setBusy(true);
    setSaved(false);
    const { error } = await supabase
      .from("restaurants")
      .update({
        nome: r.nome,
        logo_url: r.logo_url,
        cor_primaria: r.cor_primaria,
        cor_secundaria: r.cor_secundaria,
        hours: r.hours,
        whatsapp: r.whatsapp,
        instagram: r.instagram,
        address: r.address,
        opening_time: r.opening_time,
        closing_time: r.closing_time,
      })
      .eq("id", restaurantId);
    setBusy(false);
    if (error) {
      alert(`Erro ao salvar: ${error.message}`);
      return;
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  if (!r) {
    return (
      <div className="grid place-items-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-display text-lg font-semibold text-cream-50">Dados do restaurante</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nome do restaurante">
              <TextInput value={r.nome} onChange={(e) => setR({ ...r, nome: e.target.value })} />
            </Field>
          </div>
          <Field label="WhatsApp de pedido" hint="Ex.: (83) 99330-9886">
            <TextInput value={r.whatsapp ?? ""} onChange={(e) => setR({ ...r, whatsapp: e.target.value })} />
          </Field>
          <Field label="Instagram" hint="Ex.: @sabordosuljp">
            <TextInput value={r.instagram ?? ""} onChange={(e) => setR({ ...r, instagram: e.target.value })} />
          </Field>
          <Field label="Horário de funcionamento" hint="Texto exibido no site (ex.: Todos os dias, 18h às 00h)">
            <TextInput
              value={r.hours ?? ""}
              onChange={(e) => setR({ ...r, hours: e.target.value })}
              placeholder="Todos os dias, 18h às 00h"
            />
          </Field>
          <Field label="Abertura (roleta)" hint="Formato HH:MM — controla quando a roleta fica ativa">
            <TextInput
              type="time"
              value={r.opening_time ?? "18:00"}
              onChange={(e) => setR({ ...r, opening_time: e.target.value })}
            />
          </Field>
          <Field label="Fechamento (roleta)" hint="Menor que a abertura = vira a meia-noite (ex: 00:00)">
            <TextInput
              type="time"
              value={r.closing_time ?? "00:00"}
              onChange={(e) => setR({ ...r, closing_time: e.target.value })}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Endereço">
              <TextArea
                rows={2}
                value={r.address ?? ""}
                onChange={(e) => setR({ ...r, address: e.target.value })}
                placeholder="Rua, número, bairro, cidade"
              />
            </Field>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-lg font-semibold text-cream-50">Identidade visual</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Logo do restaurante">
            <ImageUpload value={r.logo_url} onUploaded={(url) => setR({ ...r, logo_url: url })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Cor principal (fundo)">
              <TextInput
                type="color"
                value={r.cor_primaria}
                onChange={(e) => setR({ ...r, cor_primaria: e.target.value })}
                className="h-12 w-full cursor-pointer px-2"
              />
            </Field>
            <Field label="Cor secundária (destaque)">
              <TextInput
                type="color"
                value={r.cor_secundaria}
                onChange={(e) => setR({ ...r, cor_secundaria: e.target.value })}
                className="h-12 w-full cursor-pointer px-2"
              />
            </Field>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={() => void save()} disabled={busy}>
          {busy ? <Spinner /> : "Salvar alterações"}
        </Button>
        {saved && <span className="text-sm font-bold text-gold-400">✓ Salvo com sucesso!</span>}
      </div>
    </div>
  );
}

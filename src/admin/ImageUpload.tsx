import { useRef, useState, type ChangeEvent } from "react";
import { supabase, STORAGE_BUCKET } from "../lib/supabase";
import { Spinner } from "./ui";

/**
 * Upload de imagem para o Supabase Storage (bucket público "menu-images").
 */
export default function ImageUpload({
  value,
  onUploaded,
}: {
  value?: string | null;
  onUploaded: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Envie um arquivo de imagem (JPG, PNG, WebP).");
      return;
    }
    setBusy(true);
    setError(null);
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { upsert: false, cacheControl: "3600" });
    if (upErr) {
      setError(upErr.message);
      setBusy(false);
      return;
    }
    const url = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
    onUploaded(url);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex items-center gap-4">
      <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-cream-100/15 bg-forest-950/60">
        {value ? (
          <img src={value} alt="Pré-visualização" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[9px] font-bold uppercase tracking-widest text-cream-200/40">Sem foto</span>
        )}
      </div>
      <div className="space-y-1.5">
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full border border-gold-500/50 px-4 py-2 text-xs font-bold text-gold-300 transition-colors hover:bg-gold-500 hover:text-forest-950 disabled:opacity-50"
        >
          {busy ? <Spinner className="h-3 w-3" /> : null}
          {busy ? "Enviando…" : value ? "Trocar foto" : "Enviar foto"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onUploaded(null)}
            className="block text-xs font-semibold text-red-300/80 hover:text-red-300"
          >
            Remover foto
          </button>
        )}
        {error && <p className="text-xs text-red-300">{error}</p>}
      </div>
    </div>
  );
}

import { cn } from "../utils/cn";
import { CardIcon, CashIcon, PixIcon } from "./icons";
import { setPayment, setTroco, usePayment } from "../lib/payment";

const OPTIONS = [
  { id: "Pix", label: "Pix", Icon: PixIcon },
  { id: "Cartão", label: "Cartão", Icon: CardIcon },
  { id: "Dinheiro", label: "Dinheiro", Icon: CashIcon },
] as const;

/**
 * Seletor de forma de pagamento — Pix / Cartão / Dinheiro.
 * Pix vem selecionado por padrão; ao escolher "Dinheiro" aparece o campo
 * opcional "Troco para quanto?". Mantém o estilo visual do site.
 */
export default function PaymentPicker({
  compact = false,
  className,
}: {
  /** versão compacta para dentro de cards (esconde o rótulo) */
  compact?: boolean;
  className?: string;
}) {
  const { method, troco } = usePayment();

  return (
    <div className={cn("space-y-2", className)}>
      <div
        role="radiogroup"
        aria-label="Forma de pagamento"
        className="flex flex-wrap items-center gap-1.5 sm:gap-2"
      >
        <span
          className={cn(
            "mr-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cream-200/50",
            compact && "hidden"
          )}
        >
          Pagamento:
        </span>
        {OPTIONS.map(({ id, label, Icon }) => {
          const active = method === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setPayment(id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all duration-300",
                active
                  ? "border-gold-500 bg-gold-500 text-forest-950 shadow-[0_6px_18px_rgba(226,112,58,0.3)]"
                  : "border-cream-100/20 text-cream-200/70 hover:border-gold-500/60 hover:text-gold-300"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      {method === "Dinheiro" && (
        <div className="flex items-center gap-2">
          <CashIcon className="h-4 w-4 shrink-0 text-gold-400" />
          <input
            type="text"
            inputMode="decimal"
            value={troco}
            onChange={(e) => setTroco(e.target.value)}
            placeholder="Troco para quanto? (opcional)"
            aria-label="Troco para quanto (opcional)"
            className="w-full max-w-[240px] rounded-xl border border-cream-100/15 bg-forest-950/60 px-3 py-2 text-sm text-cream-50 placeholder:text-cream-200/30 focus:border-gold-500 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}

import { useSyncExternalStore } from "react";

/* ------------------------------------------------------------------ */
/* Forma de pagamento compartilhada (Pix / Cartão / Dinheiro).         */
/* O valor é global: o usuário escolhe uma vez e todos os botões de    */
/* pedido do site incluem a forma escolhida na mensagem do WhatsApp.   */
/* Padrão: Pix já selecionado.                                         */
/* ------------------------------------------------------------------ */

export type PaymentMethod = "Pix" | "Cartão" | "Dinheiro";

const SEP = "\u0000";
let method: PaymentMethod = "Pix";
let troco = "";
let version = 0;
const listeners = new Set<() => void>();

function emit() {
  version++;
  listeners.forEach((fn) => fn());
}

export function getPayment(): PaymentMethod {
  return method;
}

export function setPayment(m: PaymentMethod) {
  if (method === m) return;
  method = m;
  emit();
}

export function getTroco(): string {
  return troco;
}

export function setTroco(t: string) {
  if (troco === t) return;
  troco = t;
  emit();
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Hook reativo: { method, troco } */
export function usePayment() {
  const snap = useSyncExternalStore(subscribe, () => `${version}${SEP}${method}${SEP}${troco}`);
  const [, m, t] = snap.split(SEP);
  return { method: m as PaymentMethod, troco: t };
}

/** "Forma de pagamento: Pix." ou "Forma de pagamento: Dinheiro (troco para R$ 50)." */
export function buildPaymentSuffix(): string {
  let s = `Forma de pagamento: ${method}`;
  if (method === "Dinheiro" && troco.trim()) s += ` (troco para ${troco.trim()})`;
  return `${s}.`;
}

/**
 * Mensagem de pedido pré-formatada:
 * - com item:   "Olá! Gostaria de pedir: Pizza Calabresa. Forma de pagamento: ..."
 * - sem item:   "Olá! Gostaria de fazer um pedido. Forma de pagamento: ..."
 */
export function buildOrderMessage(itemName?: string): string {
  const base = itemName
    ? `Olá! Gostaria de pedir: ${itemName}.`
    : "Olá! Gostaria de fazer um pedido.";
  return `${base} ${buildPaymentSuffix()}`;
}

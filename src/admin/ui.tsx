import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "../utils/cn";

export const inputCls =
  "w-full rounded-xl border border-cream-100/15 bg-forest-950/70 px-4 py-2.5 text-sm text-cream-50 placeholder:text-cream-200/30 focus:border-gold-500 focus:outline-none";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-forest-700/60 bg-forest-850/60 p-5", className)}>
      {children}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-gold-300">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-cream-200/50">{hint}</span>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputCls, props.className)} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputCls, "resize-none", props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        inputCls,
        "appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23e2703a%22%20stroke-width%3D%222.4%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.9rem_center] bg-no-repeat pr-9",
        props.className
      )}
    />
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
};

export function Button({ variant = "primary", className, children, ...rest }: ButtonProps) {
  const styles = {
    primary: "bg-gold-500 text-forest-950 hover:bg-gold-400 shadow-[0_8px_24px_rgba(226,112,58,0.3)]",
    ghost: "border border-cream-100/20 text-cream-100 hover:border-gold-500/60 hover:text-gold-300",
    danger: "border border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/25",
  }[variant];
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50",
        styles,
        className
      )}
    >
      {children}
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex shrink-0 items-center gap-2"
    >
      <span
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors duration-300",
          checked ? "bg-gold-500" : "bg-forest-700"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300",
            checked ? "left-[22px]" : "left-0.5"
          )}
        />
      </span>
      {label && <span className="text-sm text-cream-100">{label}</span>}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-cream-100/20 border-t-gold-400",
        className
      )}
      aria-hidden="true"
    />
  );
}

export function StatCard({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="rounded-2xl border border-forest-700/60 bg-forest-850/60 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cream-200/50">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-bold text-gold-400">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-cream-200/50">{sub}</p>}
    </div>
  );
}

export function EmptyState({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-cream-100/20 p-10 text-center">
      <p className="font-display text-lg font-semibold text-cream-100">{title}</p>
      {sub && <p className="mt-1 text-sm text-cream-200/55">{sub}</p>}
    </div>
  );
}

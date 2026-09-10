import {
  createElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** delay em ms, usado para entradas escalonadas (stagger de ~150ms) */
  delay?: number;
  /** compatibilidade — todas as variantes usam o mesmo padrão (fade + slide up) */
  variant?: "up" | "left" | "right" | "zoom";
  /** true = anima imediatamente ao montar (primeira dobra/hero) */
  immediate?: boolean;
  as?: ElementType;
  style?: CSSProperties;
  id?: string;
};

/**
 * Animação de entrada padrão do site — fade-in + slide de baixo para cima
 * (translateY 20px → 0, opacity 0 → 1, 0.8s ease-out).
 *
 * - `immediate`: anima assim que o componente monta (hero, visível no load).
 * - padrão: dispara UMA única vez quando o elemento entra na tela
 *   (IntersectionObserver), e não repete ao rolar de volta.
 * - respeita prefers-reduced-motion.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  variant = "up",
  immediate = false,
  as: Tag = "div",
  style,
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    if (immediate) {
      // garante que a transição rode após o primeiro paint
      const t = window.setTimeout(() => setVisible(true), 40);
      return () => window.clearTimeout(t);
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target); // dispara uma vez só
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [immediate]);

  const variantClass =
    variant === "left" ? "reveal-left" : variant === "right" ? "reveal-right" : variant === "zoom" ? "reveal-zoom" : "";

  return createElement(
    Tag,
    {
      ref,
      id,
      className: cn("reveal", variantClass, visible && "is-visible", className),
      style: { ...style, "--reveal-delay": `${delay}ms` } as CSSProperties,
    },
    children
  );
}

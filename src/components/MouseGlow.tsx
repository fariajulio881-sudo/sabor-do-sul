import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";

/**
 * Luz ambiente que segue o cursor por toda a página (interactive background).
 * Só ativa em telas com ponteiro fino e respeita prefers-reduced-motion.
 */
export default function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf = 0;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 3;
    let x = tx;
    let y = ty;

    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const loop = () => {
      x += (tx - x) * 0.09;
      y += (ty - y) * 0.09;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };

    setActive(true);
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed top-0 left-0 z-[1] h-[600px] w-[600px] rounded-full mix-blend-screen transition-opacity duration-1000",
        active ? "opacity-100" : "opacity-0"
      )}
      style={{
        background:
          "radial-gradient(circle, rgba(226,112,58,0.10), rgba(226,112,58,0.045) 45%, transparent 70%)",
      }}
    />
  );
}

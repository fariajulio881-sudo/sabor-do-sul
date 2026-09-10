import { useEffect, useRef } from "react";

type Ember = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number;
  alpha: number;
  twinkle: number;
};

/**
 * Canvas de brasas flutuantes — partículas quentes que sobem como faíscas
 * do forno artesanal e reagem suavemente ao cursor (interactive background).
 */
export default function EmberField({ className, density = 60 }: { className?: string; density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let embers: Ember[] = [];
    const mouse = { x: -9999, y: -9999, seen: false };

    const spawn = (anywhere = false): Ember => ({
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : height + 12,
      r: 0.8 + Math.random() * 2.4,
      vx: (Math.random() - 0.5) * 0.28,
      vy: -(0.22 + Math.random() * 0.85),
      life: 0,
      maxLife: 240 + Math.random() * 360,
      hue: 16 + Math.random() * 30,
      alpha: 0.22 + Math.random() * 0.5,
      twinkle: Math.random() * Math.PI * 2,
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(Math.round((width * height) / 17000), density + 50);
      embers = Array.from({ length: count }, () => spawn(true));
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.life++;
        e.twinkle += 0.045;
        e.x += e.vx + Math.sin(e.life * 0.02) * 0.16;
        e.y += e.vy;

        // interação com o cursor: brasas se afastam suavemente
        if (mouse.seen) {
          const dx = e.x - mouse.x;
          const dy = e.y - mouse.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < 140 * 140 && dist2 > 0.01) {
            const dist = Math.sqrt(dist2);
            const force = ((140 - dist) / 140) * 1.7;
            e.x += (dx / dist) * force;
            e.y += (dy / dist) * force;
          }
        }

        const fade = e.life < 40 ? e.life / 40 : e.life > e.maxLife - 40 ? (e.maxLife - e.life) / 40 : 1;
        const flicker = 0.72 + 0.28 * Math.sin(e.twinkle * 3);
        const alpha = Math.max(0, e.alpha * fade * flicker);

        // halo suave + núcleo (glow sem shadowBlur, mais barato)
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 3.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${e.hue}, 96%, 52%, ${alpha * 0.16})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${e.hue}, 96%, ${58 + Math.sin(e.twinkle) * 9}%, ${alpha})`;
        ctx.fill();

        if (e.life >= e.maxLife || e.y < -24) embers[i] = spawn();
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(step);
    };

    const onMove = (ev: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ev.clientX - rect.left;
      mouse.y = ev.clientY - rect.top;
      mouse.seen = true;
    };
    const onLeave = () => {
      mouse.seen = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [density]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

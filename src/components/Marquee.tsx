import { MARQUEE_ITEMS } from "../data/content";

export default function Marquee() {
  return (
    <div className="relative z-10 overflow-hidden border-y border-gold-600/60 bg-gold-500/95 py-3.5" aria-hidden="true">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0 items-center">
            {MARQUEE_ITEMS.map((item) => (
              <span
                key={`${half}-${item}`}
                className="flex items-center gap-10 pr-10 text-xs font-extrabold tracking-[0.3em] whitespace-nowrap text-forest-950 uppercase"
              >
                {item}
                <span className="text-forest-900/60">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { waLink } from "../data/content";
import { WhatsAppIcon } from "./icons";
import { buildOrderMessage } from "../lib/payment";

export default function WhatsAppFloat() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={waLink(buildOrderMessage())}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Pedir pelo WhatsApp"
      className={cn(
        "fixed right-5 bottom-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-gold-500 text-forest-950 shadow-[0_14px_40px_rgba(226,112,58,0.45)] transition-all duration-500 hover:scale-110 hover:bg-gold-400 sm:right-7 sm:bottom-7",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      )}
    >
      <span
        className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-gold-500"
        aria-hidden="true"
      />
      <WhatsAppIcon className="relative h-7 w-7" />
    </a>
  );
}

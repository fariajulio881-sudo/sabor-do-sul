import { useState } from "react";
import { cn } from "../utils/cn";

/**
 * Logomarca oficial da Pizzaria Sabor do Sul — extraída do cardápio oficial.
 */
const LOGO_SOURCES = [
  "https://storage.googleapis.com/prod-cardapio-web/uploads/company/logo/27909/b741a298688326723612655_14vj80s.jpg",
];

export default function BrandLogo({
  size = 52,
  className,
  glow = false,
}: {
  size?: number;
  className?: string;
  glow?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={LOGO_SOURCES[0]}
      alt="Logomarca oficial da Pizzaria Sabor do Sul"
      width={size}
      height={size}
      loading="eager"
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={cn(
        "rounded-full object-cover transition-opacity duration-500",
        loaded ? "opacity-100" : "opacity-0",
        glow && "drop-shadow-[0_0_24px_rgba(226,112,58,0.4)]",
        className
      )}
    />
  );
}

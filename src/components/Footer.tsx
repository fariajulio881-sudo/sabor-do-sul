import Reveal from "./Reveal";
import { Logo } from "./Navbar";
import { Kicker } from "./decor";
import { ClockIcon, InstagramIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from "./icons";
import { NAV_LINKS, waLink } from "../data/content";
import { usePublicData } from "../lib/publicData";
import { buildOrderMessage } from "../lib/payment";
import PaymentPicker from "./PaymentPicker";

const MENU_LINKS = [
  { label: "Mais Pedidos", href: "#sabores" },
  { label: "Cardápio Completo", href: "#cardapio" },
  { label: "Pizzas Doces", href: "#cardapio" },
  { label: "Combos & Promos", href: "#combos" },
];

export default function Footer() {
  const { contact: CONTACT } = usePublicData();
  return (
    <footer id="contato" className="texture-dark relative z-10 scroll-mt-24 overflow-hidden bg-forest-950/40">
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-[400px] w-[900px] -translate-x-1/2 animate-glow rounded-full bg-[radial-gradient(ellipse,rgba(226,112,58,0.09),transparent_65%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 pt-24 sm:px-8">
        {/* ---- Final CTA band ---- */}
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-gold-500/25 bg-forest-900/80 px-6 py-14 text-center backdrop-blur-xl sm:px-12 lg:py-16">
            <div
              className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[560px] -translate-x-1/2 animate-glow rounded-full bg-[radial-gradient(ellipse,rgba(226,112,58,0.22),transparent_70%)]"
              aria-hidden="true"
            />
            <Kicker className="justify-center">Bateu a fome?</Kicker>
            <h2 className="shimmer-light mx-auto mt-5 max-w-2xl font-display text-[clamp(1.85rem,5.5vw,3rem)] leading-tight font-semibold text-balance text-cream-50">
              A noite pede <em className="text-gold-grad italic">pizza</em>. A gente cuida do resto.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-cream-200/70">
              Peça até as 00h e receba quentinha, com borda recheada e aquele cheirinho que abre o apetite do vizinho.
            </p>
            <div className="mx-auto mt-8 flex justify-center">
              <PaymentPicker />
            </div>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={waLink(buildOrderMessage())}
                target="_blank"
                rel="noopener noreferrer"
                className="shine inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-gold-500 px-9 py-4 text-base font-bold text-forest-950 shadow-[0_16px_44px_rgba(226,112,58,0.4)] transition-all duration-300 hover:-translate-y-1 hover:bg-gold-400 sm:w-auto"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Peça agora no WhatsApp
              </a>
              <a
                href="#sabores"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-cream-100/25 px-9 py-4 text-base font-semibold text-cream-100 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/70 hover:text-gold-300 sm:w-auto"
              >
                Rever os sabores
              </a>
            </div>
          </div>
        </Reveal>

        {/* ---- Footer grid ---- */}
        <div className="grid gap-12 border-t border-cream-100/10 py-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <Reveal delay={0} className="lg:col-span-4">
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream-200/60">
              Pizzaria artesanal com alma de casa de bairro: massa de fermentação lenta, queijo que
              estica e aquele cheirinho que abre o apetite — o verdadeiro sabor do Sul em João Pessoa.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram do Sabor do Sul"
                className="grid h-11 w-11 place-items-center rounded-full border border-cream-100/20 text-cream-200 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500 hover:text-gold-300"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp do Sabor do Sul"
                className="grid h-11 w-11 place-items-center rounded-full border border-cream-100/20 text-cream-200 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500 hover:text-gold-300"
              >
                <WhatsAppIcon className="h-5 w-5" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={150}>
          <nav className="lg:col-span-2" aria-label="Navegação do rodapé">
            <h3 className="text-[11px] font-bold tracking-[0.3em] text-gold-400 uppercase">Navegação</h3>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-cream-200/65 transition-colors duration-300 hover:text-gold-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          </Reveal>

          <Reveal delay={300}>
          <nav className="lg:col-span-2" aria-label="Links do cardápio">
            <h3 className="text-[11px] font-bold tracking-[0.3em] text-gold-400 uppercase">Cardápio</h3>
            <ul className="mt-5 space-y-3">
              {MENU_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-cream-200/65 transition-colors duration-300 hover:text-gold-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          </Reveal>

          <Reveal delay={450} className="lg:col-span-4">
            <h3 className="text-[11px] font-bold tracking-[0.3em] text-gold-400 uppercase">Contato</h3>
            <ul className="mt-5 space-y-4 text-sm text-cream-200/65">
              <li className="flex items-start gap-3">
                <MapPinIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold-400" />
                <span>
                  {CONTACT.address}
                  <br />
                  {CONTACT.city}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <PhoneIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold-400" />
                <a href={`tel:+${CONTACT.phoneDigits}`} className="transition-colors hover:text-gold-300">
                  {CONTACT.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <ClockIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold-400" />
                <span>{CONTACT.hours}</span>
              </li>
            </ul>
          </Reveal>
        </div>

        {/* ---- Bottom bar ---- */}
        <Reveal delay={600}>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-cream-100/10 py-7 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-cream-200/45">
            © {new Date().getFullYear()} {CONTACT.name} • João Pessoa/PB. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-5">
            <a
              href="#/admin/login"
              className="text-xs text-cream-200/45 transition-colors hover:text-gold-300"
              aria-label="Área administrativa do restaurante"
            >
              🔐 Área do restaurante
            </a>
            <p className="text-xs text-cream-200/45">
              Feito com <span className="text-gold-400">sabor do sul</span> no Nordeste 🍕
            </p>
          </div>
        </div>
        </Reveal>
      </div>
    </footer>
  );
}

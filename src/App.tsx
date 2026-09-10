import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Categories from "./components/Categories";
import Featured from "./components/Featured";
import FullMenu from "./components/FullMenu";
import OrderSection from "./components/OrderSection";
import RouletteSection from "./components/Roulette";
import TvChannel from "./components/TvChannel";
import Testimonials from "./components/Testimonials";
import Gallery from "./components/Gallery";
import FAQ from "./components/FAQ";
import MapSection from "./components/MapSection";
import Footer from "./components/Footer";
import WhatsAppFloat from "./components/WhatsAppFloat";
import Intro from "./components/Intro";
import MouseGlow from "./components/MouseGlow";
import BackgroundVideo from "./components/BackgroundVideo";
import AdminApp from "./admin/AdminApp";

/**
 * Roteador por hash (sem dependências):
 *  - "#/admin/..." e "#/superadmin/..." → painel administrativo
 *  - qualquer outro hash (ou sem hash)      → site público
 */
function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHashRoute();

  if (hash.startsWith("#/admin") || hash.startsWith("#/superadmin")) {
    return <AdminApp path={hash.slice(1) || "/admin/login"} />;
  }

  return (
    <div className="min-h-screen bg-forest-950">
      <a
        href="#inicio"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-gold-500 focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-forest-950"
      >
        Pular para o conteúdo
      </a>

      {/* Vídeo de fundo fixo — atrás de todo o conteúdo, da navbar ao rodapé */}
      <BackgroundVideo />
      <Intro />
      <Navbar />

      <main className="relative z-10">
        <Hero />
        <Marquee />
        <Categories />
        <Featured />
        <FullMenu />
        <OrderSection />
        <RouletteSection />
        <TvChannel />
        <Testimonials />
        <Gallery />
        <FAQ />
        <MapSection />
      </main>

      <Footer />
      <WhatsAppFloat />
      <MouseGlow />
    </div>
  );
}

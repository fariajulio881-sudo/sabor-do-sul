import { useEffect, useMemo, useRef, useState } from "react";
import Reveal from "./Reveal";
import { Branch, SectionHeader } from "./decor";
import { cn } from "../utils/cn";

/* ================================================================== */
/*  CINE SABOR DO SUL — canal de TV com filmes clássicos               */
/*  100% legal: filmes de domínio público, servidos pelo Internet      */
/*  Archive (archive.org), com streaming por range-request — só baixa  */
/*  enquanto assiste.                                                  */
/*                                                                     */
/*  PERFORMANCE (o site continua leve):                                */
/*  - nenhum vídeo carrega ao abrir a página                           */
/*  - o player só é montado quando o usuário clica em "Assistir"       */
/*  - preload="none" + desmontagem do player ao fechar                 */
/*  - capas reais carregadas lazy, com fallback elegante em CSS        */
/* ================================================================== */

type Genre = "Terror" | "Comédia" | "Ação" | "Aventura" | "Drama" | "Faroeste" | "Ficção";

type Film = {
  id: string;
  title: string;
  year: string;
  genre: Genre;
  desc: string;
  src: string;
  /** capa oficial (Wikimedia/Wikipedia ou Archive.org) quando disponível */
  poster?: string;
  /** filme mudo: sem diálogo → nenhuma legenda ou dublagem necessária */
  silent?: boolean;
};

/* Nomes de arquivo verificados na coleção "Public Domain Movies"
/* (archive.org/details/publicmovies212) — formato MP4 direto.        */
const CDN = "https://archive.org/download/publicmovies212";

const FILMS: Film[] = [
  /* ---------- Terror ---------- */
  {
    id: "nosferatu",
    title: "Nosferatu",
    year: "1922",
    genre: "Terror",
    desc: "O conde Orlok chega à cidade — e o cinema mudo nunca mais foi o mesmo. O clássico expressionista de F. W. Murnau.",
    src: "https://archive.org/download/nosferatu_1922/nosferatu_1922.mp4",
    poster:
      "https://thumb.wikimedia.org/wikipedia/en/thumb/9/90/Nosferatu_poster_%28Albin_Grau%2C_1922%29_1.jpg/500px-Nosferatu_poster_%28Albin_Grau%2C_1922%29_1.jpg",
    silent: true,
  },
  {
    id: "vampire-bat",
    title: "The Vampire Bat",
    year: "1933",
    genre: "Terror",
    desc: "Fay Wray e Lionel Atwill num vilarejo tomado por mortes estranhas. Sombrio, com clima de época e reviravolta.",
    src: `${CDN}/The_Vampire_Bat.mp4`,
    poster: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/21/Vampirebat.jpg/500px-Vampirebat.jpg",
  },
  {
    id: "carnival-souls",
    title: "Carnival of Souls",
    year: "1962",
    genre: "Terror",
    desc: "Uma sobrevivente é atraída por um pavilhão abandonado. Clássico cult que influenciou o terror moderno.",
    src: `${CDN}/Carnival_of_Souls.mp4`,
    poster:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Carnival_of_Souls_%281962_pressbook_cover%29.jpg/500px-Carnival_of_Souls_%281962_pressbook_cover%29.jpg",
  },
  {
    id: "indestructible-man",
    title: "The Indestructible Man",
    year: "1956",
    genre: "Terror",
    desc: "Lon Chaney Jr. volta dos mortos — literalmente — em busca de vingança. Filme noir com toque de ficção pulp.",
    src: `${CDN}/The_Indestructible_Man.mp4`,
    poster: "/images/covers/indestructible-man.svg",
  },
  {
    id: "sisters-of-death",
    title: "Sisters of Death",
    year: "1977",
    genre: "Terror",
    desc: "Um reencontro de irmandade termina em jogo mortal. O thriller setentista que marcou a era do drive-in.",
    src: `${CDN}/Sisters_of_Death.mp4`,
    poster: "/images/covers/sisters-of-death.jpg",
  },

  /* ---------- Ação ---------- */
  {
    id: "hellhole",
    title: "Hellhole",
    year: "1985",
    genre: "Ação",
    desc: "Prisioneira de um sanatório cruel, uma mulher jura vingança. Ação e terror no melhor estilo dos anos 80 — em alta definição.",
    src: "https://archive.org/download/hellhole.-1985.1080p.-blu-ray.-h-264.-aac-rarbg/Hellhole.1985.1080p.BluRay.H264.AAC-RARBG.mp4",
    poster: "https://archive.org/services/img/hellhole.-1985.1080p.-blu-ray.-h-264.-aac-rarbg",
  },
  {
    id: "kung-fu-dragon",
    title: "Return of the Kung Fu Dragon",
    year: "1976",
    genre: "Ação",
    desc: "Golpes afiados, vingança e treinamento nas montanhas. Kung fu clássico com todas as acrobacias que marcaram época.",
    src: "https://archive.org/download/Return_of_the_Kung_Fu_Dragon/Return_of_the_Kung_Fu_Dragon.mp4",
    poster: "https://archive.org/services/img/Return_of_the_Kung_Fu_Dragon",
  },

  /* ---------- Comédia ---------- */
  {
    id: "girl-friday",
    title: "His Girl Friday",
    year: "1940",
    genre: "Comédia",
    desc: "Cary Grant e Rosalind Russell num jornal movido a diálogos rápidos. A comédia de ritmo mais afiado da era de ouro.",
    src: "https://archive.org/download/his_girl_friday/his_girl_friday.mp4",
    poster:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/21/His_Girl_Friday_%281940_poster%29_crop.jpg/500px-His_Girl_Friday_%281940_poster%29_crop.jpg",
  },
  {
    id: "inspector-general",
    title: "The Inspector General",
    year: "1949",
    genre: "Comédia",
    desc: "Danny Kaye confundido com um inspetor do governo numa vila corrupta. Musical de rir alto do começo ao fim.",
    src: `${CDN}/The_Inspector_General.mp4`,
    poster:
      "https://en.wikipedia.org/wiki/Special:FilePath/The%20Inspector%20General%20%281949%20film%29%20poster.jpg?width=400",
  },
  {
    id: "fathers-dividend",
    title: "Father's Little Dividend",
    year: "1951",
    genre: "Comédia",
    desc: "Spencer Tracy e Elizabeth Taylor em confusões de avô de primeira viagem. O charme de Hollywood em preto e branco.",
    src: `${CDN}/Fathers_Little_Dividend.mp4`,
    poster:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/Father%27s_Little_Dividend_1.jpg/500px-Father%27s_Little_Dividend_1.jpg",
  },
  {
    id: "fatty-arbuckle",
    title: "Fatty Arbuckle Festival",
    year: "1917",
    genre: "Comédia",
    desc: "Curtas do mestre do slapstick mudo, com Buster Keaton na parceria. Gargalhada garantida com mais de um século de idade.",
    src: `${CDN}/Fatty_Arbunkle_Festival.mp4`,
    poster: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Roscoe_Arbuckle.jpg/500px-Roscoe_Arbuckle.jpg",
    silent: true,
  },
  {
    id: "impossible-kid",
    title: "The Impossible Kid",
    year: "1982",
    genre: "Comédia",
    desc: "Weng Weng, o agente secreto mais baixinho do mundo, contra o crime. Comédia de ação filipina que virou cult.",
    src: `${CDN}/The_Impossible_Kid.mp4`,
    poster: "/images/covers/impossible-kid.svg",
  },

  /* ---------- Aventura ---------- */
  {
    id: "captain-kidd",
    title: "Captain Kidd",
    year: "1945",
    genre: "Aventura",
    desc: "Charles Laughton como o pirata mais traiçoeiro dos mares. Navalhas, tesouros e traições em alto-mar.",
    src: `${CDN}/Captain_Kidd.mp4`,
    poster: "https://en.wikipedia.org/wiki/Special:FilePath/Captain-Kidd-1945.jpg?width=400",
  },
  {
    id: "iron-mask",
    title: "The Iron Mask",
    year: "1929",
    genre: "Aventura",
    desc: "Douglas Fairbanks no auge: os três mosqueteiros em sua aventura final. Capa e espada em estado puro.",
    src: `${CDN}/The_Iron_Mask.mp4`,
    poster: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Ironmaskposter.jpg/500px-Ironmaskposter.jpg",
    silent: true,
  },
  {
    id: "hercules-unchained",
    title: "Hercules Unchained",
    year: "1959",
    genre: "Aventura",
    desc: "Steve Reeves no épico de peplum mais famoso de todos. Músculos, mitos e monstros da antiguidade.",
    src: `${CDN}/Hercules_Unchained.mp4`,
    poster: "https://en.wikipedia.org/wiki/Special:FilePath/Herculesqueenlydia.jpg?width=400",
  },
  {
    id: "hercules-captive",
    title: "Hercules and the Captive Women",
    year: "1961",
    genre: "Aventura",
    desc: "O herói contra uma civilização desaparecida que dominou a Atlântida. Aventura lendária em cores.",
    src: `${CDN}/Hercules_and_the_Captive_Women.mp4`,
    poster:
      "https://en.wikipedia.org/wiki/Special:FilePath/Ercole-alla-conquista-di-atlantide-italian-movie-poster-md.jpg?width=400",
  },
  {
    id: "hercules-moonmen",
    title: "Hercules Against the Moonmen",
    year: "1964",
    genre: "Aventura",
    desc: "Invasores da lua enfrentam o herói mais forte da Terra. O crossover de peplum com ficção científica.",
    src: `${CDN}/Hercules_Against_the_Moonmen.mp4`,
    poster: "https://en.wikipedia.org/wiki/Special:FilePath/Herculesmoonmen.jpg?width=400",
  },
  {
    id: "gladiators-seven",
    title: "Gladiators Seven",
    year: "1964",
    genre: "Aventura",
    desc: "Sete guerreiros juram vingar um nobre injustiçado. Lutas na arena e conspirações romanas.",
    src: `${CDN}/Gladiators_Seven.mp4`,
    poster:
      "https://en.wikipedia.org/wiki/Special:FilePath/La-rivolta-dei-sette-italian-movie-poster-md.jpg?width=400",
  },
  {
    id: "wild-women",
    title: "The Wild Women of Wongo",
    year: "1958",
    genre: "Aventura",
    desc: "Ilha perdida, tribos rivais e princesas em apuros. O cult cinematográfico mais colorido dos anos 50.",
    src: `${CDN}/The_Wild_Women_of_Wongo.mp4`,
    poster: "https://en.wikipedia.org/wiki/Special:FilePath/Wild%20Women%20of%20Wongo.jpg?width=400",
  },

  /* ---------- Drama ---------- */
  {
    id: "catholics",
    title: "Catholics",
    year: "1973",
    genre: "Drama",
    desc: "Uma ilha monástica resiste à modernidade — até o confronto final. Reflexão densa e atemporal.",
    src: `${CDN}/Catholics.mp4`,
    poster: "https://archive.org/services/img/catholics",
  },
  {
    id: "cold-sweat",
    title: "Cold Sweat",
    year: "1970",
    genre: "Drama",
    desc: "Charles Bronson e Liv Ullmann num thriller de passado que não perdoa. Tensão na Riviera francesa.",
    src: `${CDN}/Cold_Sweat.mp4`,
    poster: "https://en.wikipedia.org/wiki/Special:FilePath/ColdSweatPoster.jpg?width=400",
  },
  {
    id: "go-for-broke",
    title: "Go for Broke!",
    year: "1951",
    genre: "Drama",
    desc: "A história real do batalhão nipo-americano mais condecorado da Segunda Guerra. Honra e coragem.",
    src: `${CDN}/Go_for_Broke.mp4`,
    poster: "/images/covers/go-for-broke.svg",
  },
  {
    id: "white-orchid",
    title: "The White Orchid",
    year: "1954",
    genre: "Drama",
    desc: "Arqueóloga no México entre ruínas e paixões arriscadas. Romance de aventura fotografado em cores vivas.",
    src: `${CDN}/The_White_Orchid.mp4`,
    poster: "/images/covers/white-orchid.jpg",
  },

  /* ---------- Faroeste ---------- */
  {
    id: "six-gun-rhythm",
    title: "Six Gun Rhythm",
    year: "1939",
    genre: "Faroeste",
    desc: "Cantador de rodeio vira alvo de bandidos. O faroeste musical mais simpático do cinema B.",
    src: `${CDN}/Six-Gun_Rhythm.mp4`,
    poster: "/images/covers/six-gun-rhythm.svg",
  },
  {
    id: "six-gun-trail",
    title: "Six Gun Trail",
    year: "1938",
    genre: "Faroeste",
    desc: "Cavaleiro solitário contra uma quadrilha inteira. Pó, estrada e justiça no velho oeste.",
    src: `${CDN}/Six-Gun_Trail.mp4`,
    poster:
      "https://thumb.wikimedia.org/wikipedia/en/thumb/b/bf/Six_Gun_Trail_lobby_card.jpg/500px-Six_Gun_Trail_lobby_card.jpg",
  },

  /* ---------- Ficção ---------- */
  {
    id: "gammera",
    title: "Gammera the Invincible",
    year: "1966",
    genre: "Ficção",
    desc: "A tartaruga gigante que venceu o Japão e o coração do público. Kaiju clássico em toda sua glória.",
    src: `${CDN}/Gammera_the_Invincible.mp4`,
    poster:
      "https://en.wikipedia.org/wiki/Special:FilePath/Gamera%20%281965%29%20Japanese%20theatrical%20poster.jpg?width=400",
  },
  {
    id: "petrified-world",
    title: "The Incredible Petrified World",
    year: "1959",
    genre: "Ficção",
    desc: "Expedição ao fundo do mar encontra um mundo perdido. Ficção científica de aventura para toda a família.",
    src: `${CDN}/The_Incredible_Petrified_World.mp4`,
    poster: "https://en.wikipedia.org/wiki/Special:FilePath/Incrediblepetrifiedworld.jpg?width=400",
  },
  {
    id: "eegah",
    title: "Eegah",
    year: "1962",
    genre: "Ficção",
    desc: "Um gigante pré-histórico vaga pelo deserto moderno. O filme B que entrou para a história do cult.",
    src: `${CDN}/Eegah.mp4`,
    poster: "/images/covers/eegah.svg",
  },
  {
    id: "star-odyssey",
    title: "Star Odyssey",
    year: "1979",
    genre: "Ficção",
    desc: "A Terra está à venda e alienígenas apostam alto. Batalhas espaciais à moda italiana — o 'Star Wars' que virou cult.",
    src: "https://archive.org/download/StarOdysseyitalianStarWars1979/STAR_ODYSSEY_1979-desktop.m4v",
    poster: "https://archive.org/services/img/StarOdysseyitalianStarWars1979",
  },
  {
    id: "cosmos-war",
    title: "Cosmos: War of the Planets",
    year: "1977",
    genre: "Ficção",
    desc: "Um computador rebelde domina a Terra. Ficção científica italiana com visuais psicodélicos e muita aventura.",
    src: "https://archive.org/download/Cosmos_War_of_the_Planets/Cosmos_War_of_the_Planets.mp4",
    poster: "https://archive.org/services/img/Cosmos_War_of_the_Planets",
  },
];

const GENRES: ("Todos" | Genre)[] = ["Todos", "Ação", "Aventura", "Ficção", "Terror", "Comédia", "Drama", "Faroeste"];

const GENRE_ACCENT: Record<Genre, string> = {
  Terror: "from-red-900/60 via-forest-900/80 to-forest-950",
  Comédia: "from-gold-700/45 via-forest-900/80 to-forest-950",
  Ação: "from-[#7a2c1c]/60 via-forest-900/80 to-forest-950",
  Aventura: "from-gold-600/40 via-forest-800/80 to-forest-950",
  Drama: "from-forest-500/45 via-forest-900/80 to-forest-950",
  Faroeste: "from-[#8a6a2f]/50 via-forest-900/80 to-forest-950",
  Ficção: "from-forest-700/50 via-forest-900/80 to-forest-950",
};

/* ------------------------------------------------------------------ */
/* Capa do filme: foto oficial (Wikimedia) quando existe;              */
/* se não houver, uma cartela premium estilo "Criterion Collection"    */
/* (CSS puro — nunca parece imagem quebrada).                          */
/* ------------------------------------------------------------------ */
function Poster({ film, active }: { film: Film; active: boolean }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImg = film.poster && !imgFailed;

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-2xl border bg-forest-950 transition-all duration-300",
        active ? "border-gold-500/70 shadow-[0_16px_40px_rgba(226,112,58,0.25)]" : "border-forest-700/70"
      )}
    >
      {/* fundo em gradiente (aparece atrás da foto e no fallback) */}
      <div className={`absolute inset-0 bg-gradient-to-br ${GENRE_ACCENT[film.genre]}`} />

      {/* capa oficial */}
      {showImg && (
        <img
          src={film.poster}
          alt={`Capa do filme ${film.title}`}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* granulado sutil de filme por cima (dá unidade visual) */}
      {!showImg && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "url(data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E)",
          }}
        />
      )}

      {/* cartela premium quando não há capa */}
      {!showImg && (
        <div className="absolute inset-2.5 flex flex-col justify-between rounded-xl border border-gold-500/30 p-3">
          <span className="self-start rounded-full bg-forest-950/60 px-2.5 py-1 text-[9px] font-extrabold tracking-[0.2em] text-gold-300 uppercase">
            {film.genre}
          </span>
          <div className="text-center">
            <p className="font-display text-[clamp(1.2rem,3vw,1.7rem)] leading-tight font-bold text-cream-50 drop-shadow">
              {film.title}
            </p>
            <p className="mt-2 text-[10px] font-bold tracking-[0.3em] text-cream-200/70 uppercase">
              {film.year} • Domínio público
            </p>
          </div>
        </div>
      )}

      {/* selos inferiores sobre a capa real */}
      {showImg && (
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-forest-950/90 to-transparent p-3">
          <span className="rounded-full bg-forest-950/70 px-2.5 py-1 text-[9px] font-extrabold tracking-[0.18em] text-gold-300 uppercase">
            {film.genre}
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[9px] font-extrabold tracking-[0.14em] uppercase",
              film.silent ? "bg-gold-500/85 text-forest-950" : "bg-forest-950/70 text-cream-200/70"
            )}
          >
            {film.silent ? "Sem diálogo" : "Áudio original"}
          </span>
        </div>
      )}

      {/* selos também na cartela (filmes sem capa) */}
      {!showImg && (
        <span
          className={cn(
            "absolute right-3 bottom-3 rounded-full px-2.5 py-1 text-[9px] font-extrabold tracking-[0.14em] uppercase",
            film.silent ? "bg-gold-500/85 text-forest-950" : "bg-forest-950/70 text-cream-200/70"
          )}
        >
          {film.silent ? "Sem diálogo" : "Áudio original"}
        </span>
      )}
    </div>
  );
}

export default function TvChannel() {
  const [current, setCurrent] = useState<Film | null>(null);
  const [open, setOpen] = useState(false);
  const [genre, setGenre] = useState<"Todos" | Genre>("Todos");
  const [muteOnly, setMuteOnly] = useState(false);
  const [standbyIdx, setStandbyIdx] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  /* para a reprodução quando o player é fechado */
  useEffect(() => {
    if (!open) {
      videoRef.current?.pause();
      setCurrent(null);
    }
  }, [open]);

  /* vitrine de capas girando enquanto a TV está em stand-by */
  useEffect(() => {
    if (open) return;
    const t = window.setInterval(
      () => setStandbyIdx((i) => (i + 1) % FILMS.length),
      4000
    );
    return () => window.clearInterval(t);
  }, [open]);

  const watch = (film: Film) => {
    setCurrent(film);
    setOpen(true);
  };

  const shown = useMemo(
    () =>
      FILMS.filter(
        (f) => (muteOnly ? f.silent : true) && (genre === "Todos" || f.genre === genre)
      ),
    [genre, muteOnly]
  );

  return (
    <section id="cine" className="texture-dark relative scroll-mt-24 overflow-hidden bg-forest-900/25">
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 animate-glow rounded-full bg-[radial-gradient(ellipse,rgba(226,112,58,0.1),transparent_65%)]"
        aria-hidden="true"
      />
      <Branch className="absolute -left-10 top-24 h-[460px] text-gold-500/20" />
      <Branch flip className="absolute -right-8 bottom-24 h-[400px] text-gold-500/15" />

      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Reveal>
          <SectionHeader
            kicker="Cine Sabor do Sul • Canal 1"
            title={
              <>
                Enquanto a pizza assa, o <em className="text-gold-grad italic">cinema</em> começa
              </>
            }
            description={`Uma curadoria de ${FILMS.length} filmes clássicos de domínio público, grátis e legal. Os filmes mudos dispensam legenda — cinema puro para qualquer idioma.`}
          />
        </Reveal>

        {/* filtros: gênero + mudo */}
        <Reveal delay={150}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Filtrar programação">
            {GENRES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGenre(g)}
                aria-pressed={genre === g}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-bold transition-all duration-300",
                  genre === g
                    ? "border-gold-500 bg-gold-500 text-forest-950 shadow-[0_8px_22px_rgba(226,112,58,0.35)]"
                    : "border-cream-100/20 text-cream-200/70 hover:-translate-y-0.5 hover:border-gold-500/60 hover:text-gold-300"
                )}
              >
                {g}
              </button>
            ))}
            <span className="mx-1 hidden h-5 w-px bg-cream-100/15 sm:block" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setMuteOnly((v) => !v)}
              aria-pressed={muteOnly}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-bold transition-all duration-300",
                muteOnly
                  ? "border-gold-500 bg-gold-500 text-forest-950 shadow-[0_8px_22px_rgba(226,112,58,0.35)]"
                  : "border-cream-100/20 text-cream-200/70 hover:-translate-y-0.5 hover:border-gold-500/60 hover:text-gold-300"
              )}
            >
              🔇 Mudo (sem legenda)
            </button>
          </div>
        </Reveal>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-5">
          {/* ------------------------- TV ------------------------- */}
          <Reveal delay={100} className="lg:col-span-2 lg:sticky lg:top-28">
            <div className="relative">
              {/* moldura de TV retrô */}
              <div
                className="rounded-[1.8rem] border border-gold-500/30 p-3 sm:p-4"
                style={{
                  background: "linear-gradient(160deg, #2e2113, #17120d 40%, #241a10)",
                  boxShadow: "0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(246,207,139,0.25)",
                }}
              >
                {/* tela 16:9 */}
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-forest-950">
                  {open && current ? (
                    <video
                      key={current.id}
                      ref={videoRef}
                      src={current.src}
                      poster={current.poster}
                      autoPlay
                      controls
                      playsInline
                      preload="none"
                      className="absolute inset-0 h-full w-full object-contain"
                    />
                  ) : (
                    /* modo stand-by: vitrine de capas + scanlines */
                    <div className="absolute inset-0">
                      {/* capa em cartaz (gira a cada 4s) */}
                      {(() => {
                        const f = FILMS[standbyIdx];
                        return f.poster ? (
                          <img
                            key={f.id}
                            src={f.poster}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 h-full w-full animate-fade-in object-cover"
                          />
                        ) : (
                          <div
                            key={f.id}
                            className={`absolute inset-0 bg-gradient-to-br ${GENRE_ACCENT[f.genre]}`}
                          />
                        );
                      })()}
                      {/* escurecimento para legibilidade */}
                      <div className="absolute inset-0 bg-forest-950/55" />
                      {/* scanlines */}
                      <div
                        className="absolute inset-0 opacity-25"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 3px)",
                        }}
                      />
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="px-4 text-center">
                          <p className="shimmer-light font-display text-3xl font-bold text-cream-50">
                            Sabor do <span className="text-gold-grad italic">Sul</span>
                          </p>
                          <p className="mt-1 text-[10px] font-bold tracking-[0.4em] text-gold-400 uppercase">
                            Canal 1 • Cine Pizza
                          </p>
                          <p className="mt-4 rounded-full border border-gold-500/40 bg-forest-950/70 px-3 py-1 text-[10px] font-extrabold tracking-[0.2em] text-gold-300 uppercase">
                            Em cartaz: {FILMS[standbyIdx].title}
                          </p>
                          <p className="mt-3 text-sm text-cream-200/75">
                            Escolha um filme na programação para ligar a TV
                          </p>
                        </div>
                      </div>
                      {/* vinheta de tubo */}
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{ boxShadow: "inset 0 0 70px rgba(0,0,0,0.85)" }}
                      />
                    </div>
                  )}
                </div>

                {/* painel de controle */}
                <div className="mt-3 flex items-center justify-between px-2 pb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        background: open ? "#e2703a" : "#3a2c1c",
                        boxShadow: open ? "0 0 10px rgba(226,112,58,0.8)" : "none",
                      }}
                    />
                    <span className="text-[10px] font-bold tracking-[0.24em] text-gold-400/90 uppercase">
                      {open ? "Em exibição" : "Em stand-by"}
                    </span>
                  </div>
                  {open && (
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-full border border-cream-100/20 px-4 py-1.5 text-[11px] font-bold text-cream-100 transition-colors hover:border-gold-500/60 hover:text-gold-300"
                    >
                      Desligar TV
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Reveal>

          {/* ------------------- GUIA DE CANAIS ------------------- */}
          <div className="lg:col-span-3">
            <Reveal delay={200}>
              <p className="mb-4 text-[11px] font-bold tracking-[0.24em] text-cream-200/50 uppercase">
                Programação de hoje — {shown.length} {shown.length === 1 ? "sessão" : "sessões"}
                {genre !== "Todos" && ` de ${genre}`}
                {muteOnly && " • sem diálogo"}
              </p>
            </Reveal>
            <div key={genre} className="grid gap-4 sm:grid-cols-2">
              {shown.map((film, i) => {
                const active = current?.id === film.id && open;
                return (
                  <article
                    key={film.id}
                    className="group animate-pop flex h-full flex-col gap-3 rounded-2xl border border-forest-700/60 bg-forest-850/50 p-4 transition-all duration-300 hover:border-gold-500/40"
                    style={{ animationDelay: `${Math.min(i, 10) * 50}ms` }}
                  >
                    {/* capa 2:3 estilo pôster de cinema */}
                    <div className="h-56 overflow-hidden rounded-xl transition-transform duration-500 group-hover:scale-[1.02]">
                      <Poster film={film} active={active} />
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-xl font-semibold text-cream-50">{film.title}</p>
                      <p className="mt-1.5 text-xs leading-relaxed text-cream-200/60">{film.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => watch(film)}
                      className={cn(
                        "flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-300",
                        active
                          ? "bg-gold-500 text-forest-950"
                          : "border border-gold-500/60 text-gold-300 hover:bg-gold-500 hover:text-forest-950"
                      )}
                    >
                      {active ? "▶ No ar agora" : "▶ Assistir"}
                    </button>
                  </article>
                );
              })}
            </div>

            <Reveal delay={300}>
              <p className="mt-6 text-center text-[11px] leading-relaxed text-cream-200/45">
                Filmes de domínio público transmitidos pelo Internet Archive (archive.org) —{" "}
                <a
                  href="https://archive.org/details/feature_films"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-400 underline underline-offset-4 transition-colors hover:text-gold-300"
                >
                  conheça o acervo completo
                </a>
                .
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

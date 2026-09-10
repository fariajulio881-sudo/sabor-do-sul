import { getLivePhone } from "../lib/liveStore";

export const CONTACT = {
  name: "Sabor do Sul",
  phoneDisplay: "(83) 99330-9886",
  phoneDigits: "5583993309886",
  address: "R. Inácia Maria de Souto, 228 — Gramame (Colinas do Sul)",
  city: "João Pessoa • PB",
  hours: "Todos os dias, 18h às 00h",
  /** horário estruturado da roleta (fallback sem Supabase) */
  openingTime: "18:00",
  closingTime: "00:00",
  instagram: "https://www.instagram.com/sabordosuljp?stkn=c3U3ZzEyZmE3aXJh",
  instagramHandle: "@sabordosuljp",
  rating: "4.9",
  reviews: "480+",
};

export const waLink = (message?: string) => {
  // usa o número vivo (editado no admin) quando disponível;
  // caso contrário, o número padrão — sempre no formato wa.me/55DDDNUMERO
  const digits = getLivePhone() || CONTACT.phoneDigits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(
    message ?? "Olá! Vim pelo site do Sabor do Sul e quero fazer um pedido 🍕"
  )}`;
};

/** Endereço usado para geocodificar o mapa do Google */
const MAPS_QUERY = "Sabor do Sul Pizzaria, Rua Inácia Maria de Souto, 228, Gramame - João Pessoa - PB";

/** Embed sem chave de API (funciona em iframe) */
export const MAPS_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(MAPS_QUERY)}&z=16&hl=pt-BR&output=embed`;

/** Link "como chegar" para abrir o app do Google Maps */
export const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(MAPS_QUERY)}`;

/** Fotos reais do cardápio oficial (Cardápio Web) */
const IMG = {
  pizzaGrande:
    "https://storage.googleapis.com/prod-cardapio-web/uploads/item/image/2892827/4b351e71Imagem_do_WhatsApp_de_2025-09-25_%C3%A0_s__21.41.47_6d6c585b.jpg",
  pizzaPequena:
    "https://storage.googleapis.com/prod-cardapio-web/uploads/item/image/2892826/172704331466f096f2a6149_75_75.jpeg",
  comboRefri:
    "https://storage.googleapis.com/prod-cardapio-web/uploads/item/image/2892825/enhanced-image-2892825-2026-04-14T18-22-31-947Z.jpg",
  comboDoce:
    "https://storage.googleapis.com/prod-cardapio-web/uploads/item/image/2892823/enhanced-image-2892823-2026-04-14T18-21-12-089Z.jpg",
  duasPizzas:
    "https://storage.googleapis.com/prod-cardapio-web/uploads/item/image/2892821/enhanced-image-2892821-2026-04-14T18-18-55-174Z.jpg",
  guarana:
    "https://storage.googleapis.com/prod-cardapio-web/uploads/item/image/2892833/168859101264a5daa49192f_75_75.jpeg",
  coca:
    "https://storage.googleapis.com/prod-cardapio-web/uploads/item/image/2892834/168859085264a5da0432033_75_75.jpeg",
  /** Capa oficial do cardápio (imagem real da pizzaria) */
  capa: "https://storage.googleapis.com/prod-cardapio-web/uploads/company/image/27909/cc187319CAPA.jpeg",
};

export const NAV_LINKS = [
  { label: "Início", href: "#inicio" },
  { label: "Sabores", href: "#sabores" },
  { label: "Cardápio", href: "#cardapio" },
  { label: "Combos", href: "#combos" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "Galeria", href: "#galeria" },
  { label: "Contato", href: "#contato" },
];

export type Category = {
  name: string;
  desc: string;
  img: string;
  href: string;
};

export const CATEGORIES: Category[] = [
  {
    name: "Pizzas Salgadas",
    desc: "Grande com 10 fatias, até 2 sabores",
    img: IMG.pizzaGrande,
    href: "#cardapio",
  },
  {
    name: "Pizzas Doces",
    desc: "Dois Amores, chocolate e muito mais",
    img: "/images/pizza-doce.jpg",
    href: "#cardapio",
  },
  {
    name: "Bebidas Geladas",
    desc: "Guaraná e Coca geladinhos",
    img: IMG.guarana,
    href: "#cardapio",
  },
  {
    name: "Combos & Promos",
    desc: "Pizza + bebida e combos para a família",
    img: IMG.comboRefri,
    href: "#combos",
  },
];

export type Pizza = {
  name: string;
  desc: string;
  price: string;
  rating: string;
  tag: string;
  img: string;
};

export const FEATURED: Pizza[] = [
  {
    name: "Pizza Grande",
    desc: "10 fatias com até 2 sabores à sua escolha e massa italiana. A mais pedida da casa.",
    price: "a partir de R$ 42,00",
    rating: "4.9",
    tag: "Mais pedida",
    img: IMG.pizzaGrande,
  },
  {
    name: "Pizza Grande + Refri 1L",
    desc: "A pizza grande com 2 sabores acompanhada de um guaraná geladinho. O combo perfeito.",
    price: "a partir de R$ 50,00",
    rating: "4.9",
    tag: "Combo",
    img: IMG.comboRefri,
  },
  {
    name: "Pizza Grande + Pequena Doce",
    desc: "Sabor e sobremesa em um só pedido: a grande salgada + uma pequena doce para fechar.",
    price: "a partir de R$ 62,00",
    rating: "5.0",
    tag: "Combo doce",
    img: IMG.comboDoce,
  },
  {
    name: "2 Pizzas Grandes",
    desc: "Dupla de pizzas com 10 fatias cada. Até 4 sabores diferentes para a família toda.",
    price: "a partir de R$ 75,00",
    rating: "4.9",
    tag: "Melhor custo",
    img: IMG.duasPizzas,
  },
  {
    name: "Calabresa",
    desc: "Calabresa moída, cebola e mussarela sobre a massa italiana da casa. Clássico imbatível.",
    price: "R$ 42,00",
    rating: "4.8",
    tag: "Clássica",
    img: "https://images.pexels.com/photos/29021742/pexels-photo-29021742.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    name: "Dois Amores",
    desc: "Chocolate preto e branco em harmonia perfeita. A doce queridinha de João Pessoa.",
    price: "a partir de R$ 30,00",
    rating: "4.8",
    tag: "Doce",
    img: "/images/pizza-doce.jpg",
  },
];

export type MenuItem = {
  name: string;
  desc: string;
  price?: string;
  note?: string;
  img: string;
  cat: "salgada" | "doce" | "bebida";
  tag?: string;
};

/**
 * Cardápio oficial — extraído do Cardápio Web da Pizzaria Sabor do Sul.
 */
export const MENU: MenuItem[] = [
  // --------------------------- SALGADAS ---------------------------
  {
    name: "Pizza Grande",
    desc: "Pizza grande com 10 fatias e até 2 sabores à sua escolha, em deliciosa massa italiana.",
    price: "R$ 42,00",
    note: "A partir de • 10 fatias • 2 sabores",
    img: IMG.pizzaGrande,
    cat: "salgada",
    tag: "Mais pedida",
  },
  {
    name: "Pizza Pequena",
    desc: "Pizza pequena com 6 fatias e 2 sabores. Ideal para quem busca variedade e qualidade.",
    price: "R$ 30,00",
    note: "A partir de • 6 fatias • 2 sabores",
    img: IMG.pizzaPequena,
    cat: "salgada",
  },
  {
    name: "Calabresa",
    desc: "Calabresa moída, cebola e mussarela com orégano. O clássico que nunca falha.",
    img: "https://images.pexels.com/photos/29039062/pexels-photo-29039062.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    cat: "salgada",
    tag: "Clássica",
  },
  {
    name: "Quatro Queijos",
    desc: "Mussarela, catupiry, provolone e parmesão em harmonia perfeita.",
    img: "https://images.pexels.com/photos/29039071/pexels-photo-29039071.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    cat: "salgada",
  },
  {
    name: "Marguerita",
    desc: "Mussarela, tomates frescos e manjericão sobre o molho da casa.",
    img: "https://images.pexels.com/photos/28236327/pexels-photo-28236327.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    cat: "salgada",
  },
  {
    name: "Portuguesa",
    desc: "Presunto, ovo, ervilha, cebola, azeitona e mussarela. Tradição que agrada a mesa toda.",
    img: "https://images.pexels.com/photos/29021748/pexels-photo-29021748.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    cat: "salgada",
  },
  {
    name: "Frango com Requeijão",
    desc: "Frango desfiado, requeijão cremoso e mussarela dourada.",
    img: "/images/pizza-frango.jpg",
    cat: "salgada",
  },
  {
    name: "Moda da Casa",
    desc: "Presunto, palmito, ovo, cebola, catupiry, ervilha e mussarela. A receita que leva o nome da casa.",
    img: "/images/pizza-patrao.jpg",
    cat: "salgada",
    tag: "Da casa",
  },
  {
    name: "Brócolis com Catupiry",
    desc: "Brócolis fresquinho com catupiry cremoso e mussarela.",
    img: "/images/pizza-brocolis.jpg",
    cat: "salgada",
  },
  {
    name: "Pepperoni Acebolado",
    desc: "Pepperoni com cebola sobre mussarela derretida. Sabor marcante.",
    img: "https://images.pexels.com/photos/29021747/pexels-photo-29021747.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    cat: "salgada",
  },

  // --------------------------- DOCES ---------------------------
  {
    name: "Dois Amores",
    desc: "Chocolate preto e chocolate branco em harmonia perfeita. A doce mais pedida.",
    price: "R$ 30,00",
    note: "Pizza pequena • 6 fatias",
    img: "/images/pizza-doce.jpg",
    cat: "doce",
    tag: "Mais pedida",
  },
  {
    name: "Chocolate com Morango",
    desc: "Chocolate ao leite, morangos frescos e leite condensado.",
    img: "/images/pizza-doce.jpg",
    cat: "doce",
  },
  {
    name: "Brigadeiro",
    desc: "Chocolate ao leite com granulado — o doce que agrada todo mundo.",
    img: "/images/pizza-mineirinha.jpg",
    cat: "doce",
  },
  {
    name: "Doce de Leite com Paçoca",
    desc: "Doce de leite cremoso com farelo de paçoca crocante.",
    img: "/images/pizza-mineirinha.jpg",
    cat: "doce",
  },

  // --------------------------- BEBIDAS ---------------------------
  {
    name: "Guaraná Antártica 1L",
    desc: "O refrescante guaraná de 1 litro, bem gelado, para acompanhar qualquer sabor.",
    price: "R$ 10,00",
    img: IMG.guarana,
    cat: "bebida",
    tag: "Clássico",
  },
  {
    name: "Coca-Cola 1L",
    desc: "Coca-Cola de 1 litro, geladinha, com o sabor inconfundível.",
    price: "R$ 10,00",
    img: IMG.coca,
    cat: "bebida",
  },
  {
    name: "Coca-Cola Zero 1L",
    desc: "Sem açúcar e com sabor inconfundível. Refrescante e leve.",
    price: "R$ 10,00",
    img: IMG.coca,
    cat: "bebida",
  },
  {
    name: "Coca-Cola Lata",
    desc: "Coca-Cola geladinha em lata de 350ml.",
    price: "R$ 7,00",
    img: "https://images.pexels.com/photos/17650224/pexels-photo-17650224.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    cat: "bebida",
  },
  {
    name: "Guaraná Antártica Lata",
    desc: "O guaraná do Brasil em lata de 350ml.",
    price: "R$ 5,00",
    img: IMG.guarana,
    cat: "bebida",
  },
];

export const MENU_TABS = [
  { id: "todos", label: "Todos" },
  { id: "salgada", label: "Salgadas" },
  { id: "doce", label: "Doces" },
  { id: "bebida", label: "Bebidas" },
] as const;

export type MenuTabId = (typeof MENU_TABS)[number]["id"];

export type Combo = {
  name: string;
  price: string;
  before?: string;
  includes: string[];
  note: string;
  popular?: boolean;
};

export const COMBOS: Combo[] = [
  {
    name: "Pizza Grande + Refri 1L",
    price: "a partir de R$ 50,00",
    includes: ["1 pizza grande com 2 sabores", "Guaraná ou Coca 1L gelado", "Massa italiana da casa"],
    note: "O combo perfeito para a noite a dois.",
  },
  {
    name: "Pizza Grande + Pequena Doce",
    price: "a partir de R$ 62,00",
    includes: ["1 pizza grande com 2 sabores", "1 pizza pequena doce de sobremesa", "Sabor e variedade em um só pedido"],
    note: "O favorito das sextas-feiras em família.",
    popular: true,
  },
  {
    name: "2 Pizzas Grandes",
    price: "a partir de R$ 75,00",
    includes: ["2 pizzas grandes (10 fatias cada)", "Até 4 sabores diferentes", "Ideal para compartilhar"],
    note: "Para reunir a galera sem dividir a atenção.",
  },
];

export type Testimonial = {
  name: string;
  area: string;
  text: string;
  img: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Mariana C.",
    area: "Colinas do Sul",
    text: "A melhor pizza da região, sem discussão. Massa italiana de verdade, chega quentinha e o preço é justo. Peço toda semana e nunca decepciona.",
    img: "https://images.pexels.com/photos/38366748/pexels-photo-38366748.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=320&w=320&fit=crop",
  },
  {
    name: "Roberto A.",
    area: "Gramame",
    text: "O combo Pizza Grande + Pequena Doce salva o fim de semana. Atendimento rápido no WhatsApp e entrega sempre pontual.",
    img: "https://images.pexels.com/photos/14950779/pexels-photo-14950779.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=320&w=320&fit=crop",
  },
  {
    name: "Juliana M.",
    area: "Manaíra",
    text: "Pedimos os Dois Amores de sobremesa e virou tradição de família. Atendimento nota dez e a pizza chegou rapidinho. Recomendo demais!",
    img: "https://images.pexels.com/photos/21849467/pexels-photo-21849467.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=320&w=320&fit=crop",
  },
];

export type GalleryItem = {
  src: string;
  alt: string;
  cat: "pizzas" | "ambiente" | "eventos";
  tall?: boolean;
};

export const GALLERY: GalleryItem[] = [
  /* ---- Pizzas: fotos reais do cardápio + closes de dar água na boca ---- */
  { src: IMG.pizzaGrande, alt: "Pizza grande da Sabor do Sul, 10 fatias", cat: "pizzas", tall: true },
  { src: IMG.comboDoce, alt: "Combo Pizza Grande + Pequena Doce", cat: "pizzas" },
  { src: "/images/pizza-frango.jpg", alt: "Frango com Requeijão", cat: "pizzas" },
  { src: IMG.comboRefri, alt: "Pizza Grande com Guaraná 1L", cat: "pizzas" },
  { src: "/images/pizza-doce.jpg", alt: "Pizza doce Dois Amores", cat: "pizzas", tall: true },
  { src: IMG.pizzaPequena, alt: "Pizza pequena da casa, 6 fatias", cat: "pizzas" },
  { src: "/images/pizza-brocolis.jpg", alt: "Brócolis com Catupiry", cat: "pizzas" },
  { src: "https://images.pexels.com/photos/28236327/pexels-photo-28236327.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", alt: "Marguerita com manjericão fresco", cat: "pizzas" },
  /* ---- Momentos: gente de verdade aproveitando a pizza ---- */
  { src: "https://images.pexels.com/photos/29021742/pexels-photo-29021742.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", alt: "A primeira fatia — o melhor momento da noite", cat: "eventos", tall: true },
  { src: "https://images.pexels.com/photos/29039063/pexels-photo-29039063.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", alt: "Fatia servida, com aquele queijo que estica", cat: "eventos" },
  /* ---- Mesa posta: clima real de jantar com pizza ---- */
  { src: "https://images.pexels.com/photos/29039061/pexels-photo-29039061.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", alt: "Mesa posta para a noite de pizza", cat: "ambiente" },
  { src: "https://images.pexels.com/photos/28945110/pexels-photo-28945110.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", alt: "Pizza artesanal na mesa, esperando por você", cat: "ambiente" },
  { src: IMG.capa, alt: "A capa oficial do cardápio da Sabor do Sul", cat: "ambiente" },
];

export const GALLERY_FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "pizzas", label: "Pizzas" },
  { id: "ambiente", label: "Ambiente" },
  { id: "eventos", label: "Eventos" },
] as const;

export type GalleryFilterId = (typeof GALLERY_FILTERS)[number]["id"];

export const FAQS = [
  {
    q: "Como faço o pedido?",
    a: "É simples: chame a gente no WhatsApp (83) 99330-9886, escolha seus sabores e pronto. Também dá para pedir pelo nosso cardápio online e retirar no balcão — a pizza sai quentinha do forno.",
  },
  {
    q: "Quais são os tamanhos de pizza?",
    a: "Temos a Pizza Grande com 10 fatias (até 2 sabores, a partir de R$ 42,00) e a Pizza Pequena com 6 fatias (até 2 sabores, a partir de R$ 30,00). Ambas em massa italiana.",
  },
  {
    q: "Quais formas de pagamento vocês aceitam?",
    a: "Pix, dinheiro, cartão de débito e crédito — tanto na entrega quanto na retirada no balcão.",
  },
  {
    q: "Quanto tempo demora a entrega?",
    a: "Em média de 40 a 60 minutos nos bairros de João Pessoa, dependendo da região e do horário. A taxa de entrega é informada na hora do pedido.",
  },
  {
    q: "Quais são os combos da casa?",
    a: "Pizza Grande + Refri 1L (a partir de R$ 50,00), Pizza Grande + Pequena Doce (a partir de R$ 62,00) e 2 Pizzas Grandes (a partir de R$ 75,00).",
  },
  {
    q: "Qual o horário de funcionamento?",
    a: "Funcionamos todos os dias, das 18h às 00h. A cozinha segue até a última pizza do dia.",
  },
];

export const MARQUEE_ITEMS = [
  "Massa italiana artesanal",
  "Receitas que atravessam gerações",
  "Assada no ponto perfeito",
  "Pizza grande com até 2 sabores",
  "Entrega em João Pessoa",
  "Combos a partir de R$ 50",
  "Abertos todos os dias",
];

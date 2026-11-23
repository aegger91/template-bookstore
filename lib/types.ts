export type Localized = string | { [lang: string]: string };

export type LogoStyle = "seal" | "kiot" | "square" | "wordmark";
export type LogoMark = "slavic-cross" | "byzantine-cross" | "icxc-nika" | "none";

export interface LanguageConfig {
  code: string;
  label: string;
  nativeLabel: string;
  dir: "ltr" | "rtl";
  locale: string;
  displayFont?: "default" | "slavonic" | "greek";
}

export interface SiteConfig {
  slug: string;
  brand: { name: Localized; shortName: Localized; tagline: Localized; sampleNotice: Localized };
  logo: { style: LogoStyle; mark: LogoMark; image?: string; alt?: Localized };
  languages: LanguageConfig[];
  defaultLanguage: string;
  contact: {
    email: string;
    phone: string;
    address: { line1: Localized; line2?: Localized; city: Localized; region: string; postalCode: string; country: Localized };
  };
  hours: { days: Localized; time: Localized }[];
  hoursNote?: Localized;
  map: { embedUrl: string | null; directionsUrl: string };
  commerce: {
    currency: string;
    provider: "none" | "stripe" | "authorize-net";
    checkoutEndpoint: string | null;
    shipping: { flatRate: number; freeOver: number; giftWrap: number };
    pickup: { enabled: boolean };
    parishBulk: { enabled: boolean; minQuantity: number };
  };
  orthodoxConnect: {
    enabled: boolean;
    appUrl: string;
    organizationId: string;
    newsletter: { enabled: boolean; endpoint: string | null };
    eventsRsvp: { enabled: boolean };
  };
  forms: { endpoint: string | null };
  seasons: { active: string; fallback: string; calendar: { season: string; start: string; end: string }[] };
  routes: { category: string; product: string; post: string };
}

export interface Category {
  id: string;
  group: string;
  pictogram: string;
  cloth: string;
  title: Localized;
  description: Localized;
}

export interface Person {
  id: string;
  kind: "father" | "sample";
  name: Localized;
  note: Localized;
}

export interface Publisher {
  id: string;
  name: Localized;
  place: Localized;
  about: Localized;
}

export interface Saint {
  id: string;
  inscription?: string;
  name: Localized;
  feast: Localized;
}

export interface Season {
  id: string;
  accent: string;
  title: Localized;
  dates: Localized;
  intro: Localized;
}

export type Availability = "in_stock" | "low_stock" | "out_of_stock" | "preorder";
export type Format = "hardcover" | "paperback" | "ebook" | "audio" | "cd" | "item" | "gift-card";

export interface ProductFormat {
  id: string;
  format: Format;
  price: number;
  label?: Localized;
}

export interface ProductArt {
  kind: "book" | "audio" | "icon" | "prayer-rope" | "cross" | "incense" | "candles" | "gift" | "bookmarks" | "gift-card";
  cloth?: string;
  design?: "frame" | "band" | "panel" | "medallion" | "picture" | "gospel";
  emblem?: string;
  subject?: "christ" | "theotokos" | "nicholas";
  variant?: "slavic" | "byzantine" | "icxc-nika";
  knots?: number;
}

export interface Product {
  id: string;
  slug: string;
  type: string;
  category: string;
  title: Localized;
  subtitle?: Localized;
  authors: string[];
  translators: string[];
  publisher: string | null;
  isbn: string | null;
  pages: number | null;
  binding: Format | null;
  languages: string[];
  dimensions: string | null;
  tradition: string;
  saints: string[];
  seasons: string[];
  flags: ("new" | "staff-pick" | "featured")[];
  releaseDate: string;
  availability: Availability;
  formats: ProductFormat[];
  art: ProductArt;
  staffNote?: Localized;
  description: Localized;
  toc?: Localized[];
  lookInside?: { images: string[] } | null;
  specs?: { label: Localized; value: Localized }[];
  reviews?: { name: Localized; rating: number; text: Localized }[];
}

export interface EventItem {
  id: string;
  orthodoxConnectId: string;
  kind: "signing" | "talk" | "reading-group" | "children";
  start: string;
  end: string;
  title: Localized;
  speaker: Localized;
  place: Localized;
  summary: Localized;
  product: string | null;
}

export interface Post {
  slug: string;
  kind: "list" | "review" | "article";
  date: string;
  rating?: number;
  author: Localized;
  title: Localized;
  excerpt: Localized;
  body: Localized;
  products: string[];
}

export interface FaqGroup {
  id: string;
  title: Localized;
  items: { q: Localized; a: Localized }[];
}

export interface NavItem {
  id: string;
  kind?: "mega" | "link";
  href: string;
  label: Localized;
}

export interface Navigation {
  header: NavItem[];
  utility: NavItem[];
  footer: { id: string; title: Localized; links: { href: string; label: Localized }[] }[];
}

export interface LinkConfig {
  href: string;
  label: Localized;
}

export interface SectionConfig {
  type: string;
  enabled: boolean;
  eyebrow?: Localized;
  heading?: Localized;
  intro?: Localized;
  text?: Localized;
  body?: Localized;
  [key: string]: unknown;
}

export interface PageConfig {
  path: string;
  title: Localized;
  description?: Localized;
  sections: SectionConfig[];
}

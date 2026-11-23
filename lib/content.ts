import siteJson from "@/content/site.json";
import navigationJson from "@/content/navigation.json";
import pagesJson from "@/content/pages.json";
import categoriesJson from "@/content/catalog/categories.json";
import productsJson from "@/content/catalog/products.json";
import peopleJson from "@/content/catalog/people.json";
import saintsJson from "@/content/catalog/saints.json";
import eventsJson from "@/content/events.json";
import postsJson from "@/content/posts.json";
import faqJson from "@/content/faq.json";
import type {
  Category,
  EventItem,
  FaqGroup,
  Navigation,
  PageConfig,
  Person,
  Post,
  Product,
  Publisher,
  Saint,
  Season,
  SectionConfig,
  SiteConfig,
} from "./types";

export const site = siteJson as unknown as SiteConfig;
export const navigation = navigationJson as unknown as Navigation;
export const pages = (pagesJson as unknown as { pages: PageConfig[] }).pages;
export const templates = (pagesJson as unknown as { templates: Record<"category" | "product" | "post", SectionConfig[]> })
  .templates;
export const categoryGroups = categoriesJson.groups as { id: string; title: Category["title"] }[];
export const categories = categoriesJson.categories as Category[];
export const products = (productsJson as unknown as { products: Product[] }).products;
export const people = peopleJson.people as Person[];
export const publishers = peopleJson.publishers as Publisher[];
export const saints = saintsJson.saints as Saint[];
export const seasons = saintsJson.seasons as Season[];
export const events = (eventsJson as unknown as { events: EventItem[] }).events;
export const posts = (postsJson as unknown as { posts: Post[] }).posts;
export const faq = faqJson.groups as FaqGroup[];

export const languageCodes = site.languages.map((l) => l.code);

export function getLanguage(code: string) {
  return site.languages.find((l) => l.code === code) ?? site.languages[0];
}

export const productById = (id: string) => products.find((p) => p.id === id);
export const categoryById = (id: string) => categories.find((c) => c.id === id);
export const personById = (id: string) => people.find((p) => p.id === id);
export const publisherById = (id: string | null) => (id ? publishers.find((p) => p.id === id) : undefined);
export const saintById = (id: string) => saints.find((s) => s.id === id);
export const seasonById = (id: string) => seasons.find((s) => s.id === id);

export function minPrice(p: Product) {
  return Math.min(...p.formats.map((f) => f.price));
}

/** Picks the season from config, or by today's date when set to "auto". */
export function activeSeasonId(now = new Date()) {
  if (site.seasons.active !== "auto") return site.seasons.active;
  const today = now.toISOString().slice(0, 10);
  const hit = site.seasons.calendar.find((w) => today >= w.start && today <= w.end);
  return hit?.season ?? site.seasons.fallback;
}

/** An event stays upcoming until it ends. */
export function splitEvents(now = new Date()) {
  const stamp = now.toISOString().slice(0, 16);
  const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start));
  return {
    upcoming: sorted.filter((e) => e.end >= stamp),
    past: sorted.filter((e) => e.end < stamp).reverse(),
  };
}

export function rsvpUrl(e: EventItem) {
  const oc = site.orthodoxConnect;
  // TODO(OrthodoxConnect): confirm the deep-link format with the OrthodoxConnect app team.
  return `${oc.appUrl}/o/${encodeURIComponent(oc.organizationId)}/events/${encodeURIComponent(e.orthodoxConnectId)}?action=rsvp`;
}

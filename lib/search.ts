import { categoryById, personById, products, publisherById, saintById } from "./content";
import { tr } from "./i18n";
import type { Product } from "./types";

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ё/g, "е")
    .replace(/ς/g, "σ");
}

/** Searches every language of each field, so a Greek title is found from the English page too. */
function haystack(p: Product, lang: string) {
  const all = (v: unknown): string[] =>
    v == null ? [] : typeof v === "string" ? [v] : Object.values(v as Record<string, string>);
  return norm(
    [
      ...all(p.title),
      ...all(p.subtitle),
      ...p.authors.flatMap((a) => all(personById(a)?.name)),
      ...p.translators.flatMap((a) => all(personById(a)?.name)),
      ...all(publisherById(p.publisher)?.name),
      ...p.saints.flatMap((s) => all(saintById(s)?.name)),
      tr(categoryById(p.category)?.title, lang),
      p.isbn ?? "",
    ].join(" | "),
  );
}

export function searchProducts(q: string, lang: string, list: Product[] = products) {
  const terms = norm(q).split(/\s+/).filter(Boolean);
  if (!terms.length) return list;
  return list.filter((p) => {
    const h = haystack(p, lang);
    return terms.every((t) => h.includes(t));
  });
}

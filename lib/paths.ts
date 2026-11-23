import siteJson from "@/content/site.json";

const routes = (siteJson as { routes: { category: string; product: string; post: string } }).routes;

/** Builds an internal link. Paths in content are written without language or slashes, e.g. "catalog/icons". */
export function href(lang: string, path = "") {
  const clean = path.replace(/^\/+|\/+$/g, "");
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const [p, query] = clean.split("?");
  return `/${lang}/${p ? `${p}/` : ""}${query ? `?${query}` : ""}`;
}

export const productHref = (lang: string, slug: string) => href(lang, `${routes.product}/${slug}`);
export const categoryHref = (lang: string, id: string) => href(lang, `${routes.category}/${id}`);
export const catalogHref = (lang: string, query?: string) => href(lang, `${routes.category}${query ? `?${query}` : ""}`);
export const postHref = (lang: string, slug: string) => href(lang, `${routes.post}/${slug}`);
export { routes };

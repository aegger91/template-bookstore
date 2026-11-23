import { categories, categoryById, pages, posts, products, templates } from "./content";
import { routes } from "./paths";
import type { Category, PageConfig, Post, Product, SectionConfig } from "./types";

export type ResolvedRoute =
  | { kind: "page"; page: PageConfig; sections: SectionConfig[] }
  | { kind: "category"; category: Category; sections: SectionConfig[] }
  | { kind: "product"; product: Product; sections: SectionConfig[] }
  | { kind: "post"; post: Post; sections: SectionConfig[] };

export function resolveRoute(slug: string[] = []): ResolvedRoute | null {
  const path = slug.join("/");
  const page = pages.find((p) => p.path === path);
  if (page) return { kind: "page", page, sections: page.sections };

  if (slug.length === 2) {
    const [base, id] = slug;
    if (base === routes.category) {
      const category = categoryById(id);
      if (category) return { kind: "category", category, sections: templates.category };
    }
    if (base === routes.product) {
      const product = products.find((p) => p.slug === id);
      if (product) return { kind: "product", product, sections: templates.product };
    }
    if (base === routes.post) {
      const post = posts.find((p) => p.slug === id);
      if (post) return { kind: "post", post, sections: templates.post };
    }
  }
  return null;
}

/** Every static path for one language: configured pages plus category, product and post pages. */
export function allSlugs(): string[][] {
  return [
    ...pages.map((p) => (p.path ? p.path.split("/") : [])),
    ...categories.map((c) => [routes.category, c.id]),
    ...products.map((p) => [routes.product, p.slug]),
    ...posts.map((p) => [routes.post, p.slug]),
  ];
}

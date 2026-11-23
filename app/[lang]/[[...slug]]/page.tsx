import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RenderSections } from "@/components/sections/registry";
import { personById } from "@/lib/content";
import { tr } from "@/lib/i18n";
import { allSlugs, resolveRoute } from "@/lib/routing";

export const dynamicParams = false;

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[[...slug]]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const route = resolveRoute(slug);
  if (!route) return {};
  switch (route.kind) {
    case "page":
      return route.page.path
        ? { title: tr(route.page.title, lang), description: tr(route.page.description, lang) || undefined }
        : { description: tr(route.page.description, lang) || undefined };
    case "category":
      return { title: tr(route.category.title, lang), description: tr(route.category.description, lang) };
    case "product": {
      const author = route.product.authors.map((a) => tr(personById(a)?.name, lang)).join(", ");
      return {
        title: tr(route.product.title, lang),
        description: [author, tr(route.product.description, lang).split("\n")[0]].filter(Boolean).join(". "),
      };
    }
    case "post":
      return { title: tr(route.post.title, lang), description: tr(route.post.excerpt, lang) };
  }
}

export default async function Page({ params }: PageProps<"/[lang]/[[...slug]]">) {
  const { lang, slug } = await params;
  const route = resolveRoute(slug);
  if (!route) notFound();
  return <RenderSections lang={lang} route={route} />;
}

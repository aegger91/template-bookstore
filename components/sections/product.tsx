import Link from "next/link";
import { Star } from "lucide-react";
import { Pictogram } from "@/components/orthodox/pictogram";
import { ProductCard } from "@/components/shop/product-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categoryById, personById, products, publisherById, saintById } from "@/lib/content";
import { fmt, getDictionary, paragraphs, tr } from "@/lib/i18n";
import { catalogHref, categoryHref, href } from "@/lib/paths";
import type { Product } from "@/lib/types";
import { SectionHeading, type SectionProps } from "./common";
import { ProductGallery, PurchasePanel } from "./product-client";

function Stars({ rating, label }: { rating: number; label: string }) {
  return (
    <span className="flex items-center gap-0.5 text-gold" role="img" aria-label={label}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="size-4" fill={i < rating ? "currentColor" : "none"} strokeWidth={1.4} />
      ))}
    </span>
  );
}

export function ProductDetail({ lang, product }: SectionProps & { product: Product }) {
  const dict = getDictionary(lang);
  const cat = categoryById(product.category);
  const authorLinks = product.authors.map((id) => ({ id, name: tr(personById(id)?.name, lang) }));
  const translators = product.translators.map((id) => tr(personById(id)?.name, lang));
  const publisher = publisherById(product.publisher);
  const isBook = product.art.kind === "book";

  const rows: [string, React.ReactNode][] = [];
  if (authorLinks.length) rows.push([dict.product.author, authorLinks.map((a) => a.name).join(", ")]);
  if (translators.length) rows.push([dict.product.translator, translators.join(", ")]);
  if (publisher) rows.push([dict.product.publisher, tr(publisher.name, lang)]);
  if (product.isbn) rows.push([dict.product.isbn, <span key="isbn" className="font-sans tabular-nums">{product.isbn}</span>]);
  if (product.pages) rows.push([dict.product.pages, product.pages]);
  if (product.binding) rows.push([dict.product.binding, dict.formats[product.binding]]);
  if (product.languages.length) rows.push([dict.product.language, product.languages.map((l) => (dict.languages as Record<string, string>)[l] ?? l).join(", ")]);
  if (product.dimensions) rows.push([dict.product.dimensions, product.dimensions]);
  product.specs?.forEach((s) => rows.push([tr(s.label, lang), tr(s.value, lang)]));
  rows.push([dict.product.tradition, (dict.traditions as Record<string, string>)[product.tradition] ?? product.tradition]);
  if (product.saints.length) rows.push([dict.product.saints, product.saints.map((s) => tr(saintById(s)?.name, lang)).join(", ")]);

  const reviews = product.reviews ?? [];
  const views = isBook ? (["front", "back", "spine"] as const) : (["front"] as const);

  return (
    <>
      <div className="container-page pt-6">
        <nav aria-label="Breadcrumb" className="font-sans text-[0.85rem] text-ink-soft">
          <Link href={href(lang)} className="hover:text-oxblood">
            {dict.common.home}
          </Link>
          <span className="mx-2">/</span>
          <Link href={catalogHref(lang)} className="hover:text-oxblood">
            {dict.catalog.title}
          </Link>
          {cat && (
            <>
              <span className="mx-2">/</span>
              <Link href={categoryHref(lang, cat.id)} className="hover:text-oxblood">
                {tr(cat.title, lang)}
              </Link>
            </>
          )}
        </nav>
      </div>

      <section className="container-page grid gap-10 py-8 md:grid-cols-2 md:gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="md:sticky md:top-24 md:self-start">
          <ProductGallery
            product={product}
            views={[...views]}
            labels={{ front: dict.product.galleryFront, back: dict.product.galleryBack, spine: dict.product.gallerySpine }}
          />
        </div>

        <div className="min-w-0">
          {cat && (
            <Link href={categoryHref(lang, cat.id)} className="eyebrow inline-flex items-center gap-2 hover:text-oxblood">
              <Pictogram name={cat.pictogram} className="h-4 w-4" />
              {tr(cat.title, lang)}
            </Link>
          )}
          <h1 className="mt-3 text-[2rem] leading-tight text-ink md:text-[2.6rem]">{tr(product.title, lang)}</h1>
          {product.subtitle && <p className="mt-2 text-lg text-ink-soft italic">{tr(product.subtitle, lang)}</p>}
          {(authorLinks.length > 0 || translators.length > 0) && (
            <p className="mt-3 text-[1.08rem] text-ink">
              {authorLinks.map((a, i) => (
                <span key={a.id}>
                  {i > 0 && ", "}
                  <Link href={catalogHref(lang, `author=${a.id}`)} className="text-oxblood underline-offset-4 hover:underline">
                    {a.name}
                  </Link>
                </span>
              ))}
              {translators.length > 0 && (
                <span className="text-ink-soft">
                  {authorLinks.length > 0 && " · "}
                  {dict.common.translatedBy} {translators.join(", ")}
                </span>
              )}
            </p>
          )}

          <PurchasePanel product={product} />

          {product.staffNote && (
            <figure className="mt-8 rounded-md border-s-4 border-gold-foil bg-paper p-5">
              <p className="eyebrow mb-1.5">{dict.home.pickedBy}</p>
              <blockquote className="text-[1.08rem] text-ink italic">“{tr(product.staffNote, lang)}”</blockquote>
            </figure>
          )}

          <dl className="mt-8 grid grid-cols-[minmax(7rem,auto)_1fr] border-t border-rule text-[1rem]">
            {rows.map(([k, v], i) => (
              <div key={i} className="contents">
                <dt className="border-b border-rule py-2.5 pe-4 text-ink-soft">{k}</dt>
                <dd className="min-w-0 border-b border-rule py-2.5 break-words text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-page py-8">
        <Tabs defaultValue="description" className="gap-0">
          <TabsList variant="line" className="h-auto w-full justify-start gap-2 overflow-x-auto group-data-horizontal/tabs:h-auto rounded-none border-b border-rule bg-transparent p-0 [scrollbar-width:none]">
            {[
              ["description", dict.product.description],
              ["contents", dict.product.contents],
              ["inside", dict.product.lookInside],
              ["reviews", `${dict.product.reviews} (${reviews.length})`],
            ].map(([v, l]) => (
              <TabsTrigger key={v} value={v} className="flex-none rounded-none px-3 py-3 text-[1.02rem] data-active:text-oxblood after:!bg-oxblood">
                {l}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="description" className="pt-8">
            <div className="prose-reading max-w-[var(--tk-layout-readingWidth)] text-[1.12rem] leading-[1.75] text-ink">
              {paragraphs(tr(product.description, lang)).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="contents" className="pt-8">
            {product.toc?.length ? (
              <ol className="max-w-[var(--tk-layout-readingWidth)] divide-y divide-rule border-y border-rule">
                {product.toc.map((t, i) => (
                  <li key={i} className="py-2.5 text-[1.05rem] text-ink">
                    {tr(t, lang)}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-ink-soft">{dict.product.lookInsideSlot}</p>
            )}
          </TabsContent>
          <TabsContent value="inside" className="pt-8">
            <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
              {[1, 2].map((n) => (
                <div key={n} className="paper-grain grid aspect-[3/4] place-items-center rounded-sm border border-dashed border-rule bg-paper p-8 text-center">
                  <div>
                    <Pictogram name="open-book" className="mx-auto h-10 w-10 text-gold" />
                    <p className="mt-3 font-sans text-[0.85rem] text-ink-soft">{fmt(dict.product.galleryView, { n })}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 max-w-xl text-[0.95rem] text-ink-soft">{dict.product.lookInsideSlot}</p>
          </TabsContent>
          <TabsContent value="reviews" className="pt-8">
            {reviews.length ? (
              <ul className="grid max-w-4xl gap-5 md:grid-cols-2">
                {reviews.map((r, i) => (
                  <li key={i} className="rounded-md border border-rule bg-paper p-5">
                    <div className="flex items-center justify-between gap-3">
                      <Stars rating={r.rating} label={fmt(dict.product.rating, { rating: r.rating })} />
                      <span className="rounded-sm bg-parchment px-2 py-0.5 font-sans text-[0.72rem] text-ink-soft">{dict.product.sampleReview}</span>
                    </div>
                    <p className="mt-3 text-[1.05rem] text-ink">{tr(r.text, lang)}</p>
                    <p className="mt-2 text-[0.92rem] text-ink-soft">{tr(r.name, lang)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-soft">{dict.product.noReviews}</p>
            )}
            <div className="mt-6 flex max-w-4xl flex-wrap items-center gap-4 rounded-md bg-parchment/60 px-5 py-4">
              <button disabled className="rounded-md border border-ink/20 px-4 py-2 text-ink-soft">
                {dict.product.writeReview}
              </button>
              <p className="text-[0.95rem] text-ink-soft">{dict.product.reviewsSignIn}</p>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
}

export function RelatedProducts({ section, lang, product }: SectionProps & { product: Product }) {
  const score = (p: Product) =>
    (p.category === product.category ? 3 : 0) +
    p.saints.filter((s) => product.saints.includes(s)).length * 2 +
    p.seasons.filter((s) => product.seasons.includes(s)).length +
    p.authors.filter((a) => product.authors.includes(a)).length * 2;
  const related = products
    .filter((p) => p.id !== product.id)
    .map((p) => [p, score(p)] as const)
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([p]) => p);
  if (!related.length) return null;
  return (
    <section className="container-page border-t border-rule py-14">
      <SectionHeading lang={lang} heading={section.heading} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
        {related.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

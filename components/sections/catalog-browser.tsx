"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Pictogram } from "@/components/orthodox/pictogram";
import { ProductGrid } from "@/components/shop/product-card";
import { useSite } from "@/components/site/site-context";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { categories, categoryById, minPrice, personById, products, publisherById, saintById, seasonById } from "@/lib/content";
import { fmt, tr } from "@/lib/i18n";
import { catalogHref, categoryHref, href } from "@/lib/paths";
import { searchProducts } from "@/lib/search";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type Multi = "language" | "author" | "publisher" | "format" | "tradition";
const MULTI: Multi[] = ["language", "author", "publisher", "format", "tradition"];
const PRICE = { under15: [0, 15], "15to30": [15, 30], "30to60": [30, 60], "60plus": [60, Infinity] } as const;
type PriceKey = keyof typeof PRICE;
type Sort = "featured" | "title" | "price-asc" | "price-desc" | "newest";

interface State {
  q: string;
  saint: string;
  season: string;
  price: PriceKey | "";
  sort: Sort;
  available: boolean;
  multi: Record<Multi, string[]>;
}

const emptyMulti = (): Record<Multi, string[]> => ({ language: [], author: [], publisher: [], format: [], tradition: [] });

function readState(params: URLSearchParams | null): State {
  const multi = emptyMulti();
  MULTI.forEach((k) => (multi[k] = params?.get(k)?.split(",").filter(Boolean) ?? []));
  return {
    q: params?.get("q") ?? "",
    saint: params?.get("saint") ?? "",
    season: params?.get("season") ?? "",
    price: (params?.get("price") as PriceKey) ?? "",
    sort: (params?.get("sort") as Sort) ?? "featured",
    available: params?.get("available") === "1",
    multi,
  };
}

function writeState(s: State) {
  const p = new URLSearchParams();
  if (s.q) p.set("q", s.q);
  if (s.saint) p.set("saint", s.saint);
  if (s.season) p.set("season", s.season);
  if (s.price) p.set("price", s.price);
  if (s.sort !== "featured") p.set("sort", s.sort);
  if (s.available) p.set("available", "1");
  MULTI.forEach((k) => s.multi[k].length && p.set(k, s.multi[k].join(",")));
  const qs = p.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
}

function valuesOf(p: Product, key: Multi): string[] {
  switch (key) {
    case "language":
      return p.languages;
    case "author":
      return p.authors;
    case "publisher":
      return p.publisher ? [p.publisher] : [];
    case "format":
      return p.formats.map((f) => f.format).filter((f) => f !== "item" && f !== "gift-card");
    case "tradition":
      return [p.tradition];
  }
}

function applyFilters(list: Product[], s: State, lang: string, skip?: Multi) {
  let out = s.q ? searchProducts(s.q, lang, list) : list;
  if (s.saint) out = out.filter((p) => p.saints.includes(s.saint));
  if (s.season) out = out.filter((p) => p.seasons.includes(s.season));
  if (s.available) out = out.filter((p) => p.availability !== "out_of_stock");
  if (s.price) {
    const [lo, hi] = PRICE[s.price];
    out = out.filter((p) => p.formats.some((f) => f.price >= lo && f.price < hi));
  }
  MULTI.forEach((k) => {
    if (k === skip || !s.multi[k].length) return;
    out = out.filter((p) => valuesOf(p, k).some((v) => s.multi[k].includes(v)));
  });
  return out;
}

function sortList(list: Product[], sort: Sort, lang: string) {
  const out = [...list];
  switch (sort) {
    case "title":
      return out.sort((a, b) => tr(a.title, lang).localeCompare(tr(b.title, lang), lang));
    case "price-asc":
      return out.sort((a, b) => minPrice(a) - minPrice(b));
    case "price-desc":
      return out.sort((a, b) => minPrice(b) - minPrice(a));
    case "newest":
      return out.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
    default:
      return out.sort((a, b) => Number(b.flags.includes("featured")) - Number(a.flags.includes("featured")));
  }
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-rule py-5 first:pt-0">
      <legend className="eyebrow mb-3 !text-ink">{title}</legend>
      {children}
    </fieldset>
  );
}

/** Kept in its own Suspense boundary so the full catalog still renders into the static HTML. */
function ParamsSync({ onChange }: { onChange: (s: State) => void }) {
  const params = useSearchParams();
  useEffect(() => {
    onChange(readState(params));
  }, [params, onChange]);
  return null;
}

function Browser({ categoryId }: { categoryId?: string }) {
  const { lang, dict } = useSite();
  const [state, setState] = useState<State>(() => readState(null));
  const [sheetOpen, setSheetOpen] = useState(false);

  const update = (patch: Partial<State>) =>
    setState((s) => {
      const next = { ...s, ...patch };
      writeState(next);
      return next;
    });
  const toggle = (key: Multi, value: string) =>
    update({ multi: { ...state.multi, [key]: state.multi[key].includes(value) ? state.multi[key].filter((v) => v !== value) : [...state.multi[key], value] } });

  const category = categoryId ? categoryById(categoryId) : undefined;
  const scope = useMemo(() => (categoryId ? products.filter((p) => p.category === categoryId) : products), [categoryId]);
  const results = useMemo(() => sortList(applyFilters(scope, state, lang), state.sort, lang), [scope, state, lang]);

  const labelFor = (key: Multi, v: string) => {
    switch (key) {
      case "language":
        return (dict.languages as Record<string, string>)[v] ?? v;
      case "author":
        return tr(personById(v)?.name, lang);
      case "publisher":
        return tr(publisherById(v)?.name, lang);
      case "format":
        return (dict.formats as Record<string, string>)[v] ?? v;
      case "tradition":
        return (dict.traditions as Record<string, string>)[v] ?? v;
    }
  };

  const facet = (key: Multi) => {
    const base = applyFilters(scope, state, lang, key);
    const counts = new Map<string, number>();
    scope.forEach((p) => valuesOf(p, key).forEach((v) => counts.has(v) || counts.set(v, 0)));
    base.forEach((p) => new Set(valuesOf(p, key)).forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => labelFor(key, a[0]).localeCompare(labelFor(key, b[0]), lang));
  };

  const groups: { key: Multi; title: string }[] = [
    { key: "format", title: dict.catalog.format },
    { key: "language", title: dict.catalog.language },
    { key: "tradition", title: dict.catalog.tradition },
    { key: "author", title: dict.catalog.author },
    { key: "publisher", title: dict.catalog.publisher },
  ];

  const chips: { label: string; clear: () => void }[] = [];
  if (state.q) chips.push({ label: `“${state.q}”`, clear: () => update({ q: "" }) });
  if (state.saint) chips.push({ label: tr(saintById(state.saint)?.name, lang), clear: () => update({ saint: "" }) });
  if (state.season) chips.push({ label: tr(seasonById(state.season)?.title, lang), clear: () => update({ season: "" }) });
  if (state.price) chips.push({ label: `${dict.catalog.price}: ${dict.catalog[`price${state.price.charAt(0).toUpperCase()}${state.price.slice(1)}` as "priceUnder15"] ?? state.price}`, clear: () => update({ price: "" }) });
  if (state.available) chips.push({ label: dict.catalog.inStockOnly, clear: () => update({ available: false }) });
  MULTI.forEach((k) => state.multi[k].forEach((v) => chips.push({ label: labelFor(k, v), clear: () => toggle(k, v) })));
  const clearAll = () => update({ q: "", saint: "", season: "", price: "", available: false, multi: emptyMulti() });

  const filters = (
    <div>
      {!categoryId && (
        <FilterGroup title={dict.catalog.category}>
          <ul className="space-y-1.5">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={categoryHref(lang, c.id)} className="flex items-center gap-2.5 text-[0.98rem] text-ink hover:text-oxblood">
                  <Pictogram name={c.pictogram} className="h-5 w-5 text-gold" />
                  {tr(c.title, lang)}
                </Link>
              </li>
            ))}
          </ul>
        </FilterGroup>
      )}
      <FilterGroup title={dict.catalog.price}>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PRICE) as PriceKey[]).map((k) => {
            const label = dict.catalog[`price${k.charAt(0).toUpperCase()}${k.slice(1)}` as "priceUnder15"];
            return (
              <button
                key={k}
                type="button"
                aria-pressed={state.price === k}
                onClick={() => update({ price: state.price === k ? "" : k })}
                className={cn("rounded-full border px-3 py-1 font-sans text-[0.85rem]", state.price === k ? "border-oxblood bg-oxblood text-paper" : "border-rule bg-paper text-ink hover:border-ink/40")}
              >
                {label}
              </button>
            );
          })}
        </div>
      </FilterGroup>
      {groups.map(({ key, title }) => {
        const options = facet(key);
        if (!options.length) return null;
        return (
          <FilterGroup key={key} title={title}>
            <ul className="space-y-2">
              {options.map(([v, count]) => {
                const id = `f-${key}-${v}`;
                return (
                  <li key={v} className="flex items-start gap-2.5">
                    <Checkbox id={id} checked={state.multi[key].includes(v)} onCheckedChange={() => toggle(key, v)} className="mt-1" />
                    <label htmlFor={id} className={cn("flex-1 cursor-pointer text-[0.98rem] leading-snug", count === 0 && !state.multi[key].includes(v) ? "text-ink-soft/60" : "text-ink")}>
                      {labelFor(key, v)} <span className="font-sans text-[0.8rem] text-ink-soft">({count})</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </FilterGroup>
        );
      })}
      <FilterGroup title={dict.catalog.availability}>
        <div className="flex items-center gap-2.5">
          <Checkbox id="f-available" checked={state.available} onCheckedChange={(v) => update({ available: v === true })} />
          <label htmlFor="f-available" className="cursor-pointer text-[0.98rem] text-ink">
            {dict.catalog.inStockOnly}
          </label>
        </div>
      </FilterGroup>
    </div>
  );

  const title = category ? tr(category.title, lang) : dict.catalog.title;
  const intro = category ? tr(category.description, lang) : dict.catalog.intro;

  return (
    <>
      <Suspense fallback={null}>
        <ParamsSync onChange={setState} />
      </Suspense>
      <section className="border-b border-rule bg-paper/60">
        <div className="container-page py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="mb-3 font-sans text-[0.85rem] text-ink-soft">
            <Link href={href(lang)} className="hover:text-oxblood">
              {dict.common.home}
            </Link>
            <span className="mx-2">/</span>
            {category ? (
              <>
                <Link href={catalogHref(lang)} className="hover:text-oxblood">
                  {dict.catalog.title}
                </Link>
                <span className="mx-2">/</span>
                <span className="text-ink">{title}</span>
              </>
            ) : (
              <span className="text-ink">{title}</span>
            )}
          </nav>
          <div className="flex items-center gap-4">
            {category && <Pictogram name={category.pictogram} className="hidden h-12 w-12 text-gold sm:block" />}
            <h1 className="text-[2.1rem] text-ink md:text-[3rem]">{title}</h1>
          </div>
          <p className="mt-3 max-w-2xl text-lg text-ink-soft">{intro}</p>
          <div className="-mx-1 mt-6 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
            <Link href={catalogHref(lang)} className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-[0.95rem]", !category ? "border-ink bg-ink text-paper" : "border-rule bg-paper text-ink hover:border-ink/40")}>
              {dict.nav.allItems}
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={categoryHref(lang, c.id)}
                className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-[0.95rem] whitespace-nowrap", c.id === categoryId ? "border-ink bg-ink text-paper" : "border-rule bg-paper text-ink hover:border-ink/40")}
              >
                {tr(c.title, lang)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-10 py-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:py-12">
        <aside className="hidden lg:block" aria-label={dict.catalog.filters}>
          {filters}
        </aside>
        <div className="min-w-0">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <form role="search" className="relative flex-1" onSubmit={(e) => e.preventDefault()}>
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-gold" />
              <input
                type="search"
                value={state.q}
                onChange={(e) => update({ q: e.target.value })}
                placeholder={dict.catalog.searchWithin}
                aria-label={dict.catalog.searchWithin}
                className="h-11 w-full rounded-md border border-rule bg-paper ps-9 pe-3 text-[1rem] text-ink placeholder:text-ink-soft/60 focus:border-gold focus:outline-none"
              />
            </form>
            <div className="flex items-center gap-2">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <button className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-rule bg-paper px-4 text-ink sm:flex-none lg:hidden">
                    <SlidersHorizontal className="size-4" />
                    {dict.catalog.filters}
                    {chips.length > 0 && <span className="rounded-full bg-oxblood px-1.5 font-sans text-xs text-paper">{chips.length}</span>}
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[88dvh] gap-0 rounded-t-xl bg-paper p-0">
                  <SheetHeader className="border-b border-rule px-5 py-4">
                    <SheetTitle className="font-heading text-xl">{dict.catalog.filters}</SheetTitle>
                  </SheetHeader>
                  <div className="overflow-y-auto px-5 py-5">{filters}</div>
                  <SheetFooter className="flex-row gap-3 border-t border-rule px-5 py-4">
                    <button onClick={clearAll} className="h-11 flex-1 rounded-md border border-rule text-ink">
                      {dict.catalog.clearAll}
                    </button>
                    <button onClick={() => setSheetOpen(false)} className="h-11 flex-[2] rounded-md bg-oxblood text-paper">
                      {fmt(dict.catalog.showResults, { count: results.length })}
                    </button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
              <Select value={state.sort} onValueChange={(v) => update({ sort: v as Sort })}>
                <SelectTrigger className="!h-11 flex-1 bg-paper text-[0.98rem] sm:w-52 sm:flex-none" aria-label={dict.catalog.sort}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-paper">
                  <SelectItem value="featured">{dict.catalog.sortFeatured}</SelectItem>
                  <SelectItem value="newest">{dict.catalog.sortNewest}</SelectItem>
                  <SelectItem value="title">{dict.catalog.sortTitle}</SelectItem>
                  <SelectItem value="price-asc">{dict.catalog.sortPriceLow}</SelectItem>
                  <SelectItem value="price-desc">{dict.catalog.sortPriceHigh}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-2">
            <p className="me-2 font-sans text-[0.9rem] text-ink-soft" aria-live="polite">
              {fmt(dict.catalog.results, { count: results.length })}
            </p>
            {chips.map((c, i) => (
              <button key={i} onClick={c.clear} className="inline-flex items-center gap-1.5 rounded-full bg-parchment px-3 py-1 text-[0.9rem] text-ink hover:bg-rule">
                {c.label}
                <X className="size-3.5" />
              </button>
            ))}
            {chips.length > 1 && (
              <button onClick={clearAll} className="text-[0.9rem] text-oxblood underline-offset-4 hover:underline">
                {dict.catalog.clearAll}
              </button>
            )}
          </div>

          {results.length ? (
            <ProductGrid products={results} className="lg:grid-cols-3 xl:grid-cols-4" />
          ) : (
            <div className="rounded-md border border-dashed border-rule bg-paper/60 px-6 py-16 text-center">
              <Pictogram name="open-book" className="mx-auto h-12 w-12 text-gold" />
              <h2 className="mt-4 font-heading text-2xl text-ink">{dict.catalog.noResults}</h2>
              <p className="mx-auto mt-2 max-w-md text-ink-soft">{dict.catalog.noResultsHint}</p>
              <button onClick={clearAll} className="mt-6 rounded-md bg-oxblood px-5 py-2.5 text-paper">
                {dict.catalog.clearAll}
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function CatalogBrowser({ categoryId }: { categoryId?: string }) {
  return <Browser categoryId={categoryId} />;
}

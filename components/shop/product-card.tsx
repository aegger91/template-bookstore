"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { ProductArt } from "@/components/orthodox/product-art";
import { useSite } from "@/components/site/site-context";
import { personById } from "@/lib/content";
import { money } from "@/lib/format";
import { tr } from "@/lib/i18n";
import { productHref } from "@/lib/paths";
import { toggleWishlist, useHydrated, wishlistStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductBadges({ product, className }: { product: Product; className?: string }) {
  const { dict } = useSite();
  const badges: { key: string; label: string; tone: string }[] = [];
  if (product.availability === "preorder") badges.push({ key: "pre", label: dict.badges.preorder, tone: "bg-navy text-paper" });
  if (product.availability === "out_of_stock") badges.push({ key: "oos", label: dict.badges.out_of_stock, tone: "bg-ink/80 text-paper" });
  if (product.flags.includes("new") && product.availability !== "preorder") badges.push({ key: "new", label: dict.badges.new, tone: "bg-oxblood text-paper" });
  if (product.flags.includes("staff-pick")) badges.push({ key: "pick", label: dict.badges["staff-pick"], tone: "bg-gold-soft text-ink" });
  if (!badges.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {badges.map((b) => (
        <span key={b.key} className={cn("rounded-sm px-2 py-0.5 font-sans text-[0.72rem] font-semibold tracking-wide", b.tone)}>
          {b.label}
        </span>
      ))}
    </div>
  );
}

export function WishlistButton({ id, className }: { id: string; className?: string }) {
  const { dict } = useSite();
  const hydrated = useHydrated();
  const { ids } = wishlistStore.useStore();
  const saved = hydrated && ids.includes(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        toggleWishlist(id);
      }}
      aria-pressed={saved}
      aria-label={saved ? dict.product.inWishlist : dict.product.addToWishlist}
      className={cn(
        "grid size-9 place-items-center rounded-full bg-paper/90 text-ink shadow-sm transition-colors hover:text-oxblood",
        className,
      )}
    >
      <Heart className={cn("size-[1.05rem]", saved && "fill-oxblood text-oxblood")} strokeWidth={1.7} />
    </button>
  );
}

export function ProductCard({ product, className, priority }: { product: Product; className?: string; priority?: boolean }) {
  const { lang, dict } = useSite();
  const author = product.authors.map((a) => tr(personById(a)?.name, lang)).join(", ");
  const prices = product.formats.map((f) => f.price);
  const varied = new Set(prices).size > 1;

  return (
    <article className={cn("group relative flex flex-col", className)} data-priority={priority || undefined}>
      <Link href={productHref(lang, product.slug)} className="block" aria-label={tr(product.title, lang)}>
        <div className="paper-grain relative aspect-[4/5] overflow-hidden rounded-[var(--tk-radius-card)] bg-parchment/70 px-[14%] py-[10%] transition-colors group-hover:bg-parchment">
          <div className="size-full transition-transform duration-500 group-hover:-translate-y-1">
            <ProductArt product={product} lang={lang} />
          </div>
          <ProductBadges product={product} className="absolute start-2.5 top-2.5" />
        </div>
      </Link>
      <WishlistButton id={product.id} className="absolute end-2.5 top-2.5" />
      <div className="mt-3 flex flex-1 flex-col">
        <h3 className="line-clamp-2 font-heading text-[1.06rem] leading-snug text-ink">
          <Link href={productHref(lang, product.slug)} className="hover:text-oxblood">
            {tr(product.title, lang)}
          </Link>
        </h3>
        {author && <p className="mt-0.5 line-clamp-1 text-[0.95rem] text-ink-soft">{author}</p>}
        <p className="mt-auto line-clamp-2 pt-1.5 font-sans text-[0.95rem] text-ink">
          {varied && <span className="text-ink-soft">{dict.common.from} </span>}
          <span className="font-semibold">{money(Math.min(...prices), lang)}</span>
          {product.formats.length > 1 && product.formats[0].format !== "item" && product.formats[0].format !== "gift-card" && (
            <span className="text-ink-soft"> · {product.formats.map((f) => dict.formats[f.format]).join(", ")}</span>
          )}
        </p>
      </div>
    </article>
  );
}

export function ProductGrid({ products, className }: { products: Product[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4", className)}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}


"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { ProductArt } from "@/components/orthodox/product-art";
import { useSite } from "@/components/site/site-context";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { personById, productById, site } from "@/lib/content";
import { money } from "@/lib/format";
import { fmt, tr } from "@/lib/i18n";
import { catalogHref, href, productHref } from "@/lib/paths";
import { cartStore, setQty, useHydrated } from "@/lib/store";
import type { Product, ProductFormat } from "@/lib/types";

export interface ResolvedLine {
  product: Product;
  format: ProductFormat;
  qty: number;
}

export function useCartLines() {
  const hydrated = useHydrated();
  const cart = cartStore.useStore();
  const lines: ResolvedLine[] = cart.lines
    .map((l) => {
      const product = productById(l.productId);
      const format = product?.formats.find((f) => f.id === l.formatId);
      return product && format ? { product, format, qty: l.qty } : null;
    })
    .filter((l): l is ResolvedLine => l !== null);
  const subtotal = lines.reduce((s, l) => s + l.format.price * l.qty, 0);
  return { hydrated, cart, lines, subtotal };
}

export function formatLabel(line: ResolvedLine, lang: string, formats: Record<string, string>) {
  return line.format.label && line.format.format !== "gift-card" ? tr(line.format.label, lang) : formats[line.format.format];
}

export function GiftOptions() {
  const { dict, lang } = useSite();
  const { cart } = useCartLines();
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <Label htmlFor="gift-wrap" className="flex-1 cursor-pointer text-[1rem] leading-snug font-normal text-ink">
          {dict.cart.giftWrapLabel}
          <span className="block font-sans text-[0.85rem] text-ink-soft">+ {money(site.commerce.shipping.giftWrap, lang)}</span>
        </Label>
        <Switch id="gift-wrap" checked={cart.giftWrap} onCheckedChange={(v) => cartStore.set((s) => ({ ...s, giftWrap: v }))} />
      </div>
      {cart.giftWrap && (
        <div>
          <Label htmlFor="gift-message" className="mb-1.5 text-[0.95rem] text-ink">
            {dict.cart.giftMessage}
          </Label>
          <Textarea
            id="gift-message"
            maxLength={240}
            value={cart.giftMessage}
            onChange={(e) => cartStore.set((s) => ({ ...s, giftMessage: e.target.value }))}
            placeholder={dict.cart.giftMessagePlaceholder}
            className="min-h-20 bg-cream text-[1rem]"
          />
        </div>
      )}
    </div>
  );
}

export function CartSection() {
  const { lang, dict } = useSite();
  const { hydrated, cart, lines, subtotal } = useCartLines();
  const wrap = cart.giftWrap ? site.commerce.shipping.giftWrap : 0;

  return (
    <section className="container-page py-10 md:py-14">
      <h1 className="text-[2.1rem] text-ink md:text-[2.8rem]">{dict.cart.title}</h1>

      {!hydrated ? (
        <div className="mt-8 h-64 animate-pulse rounded-md bg-parchment/60" aria-label={dict.common.loading} />
      ) : lines.length === 0 ? (
        <div className="mt-8 rounded-md border border-dashed border-rule bg-paper/60 px-6 py-16 text-center">
          <ShoppingBag className="mx-auto size-10 text-gold" strokeWidth={1.4} />
          <h2 className="mt-4 font-heading text-2xl text-ink">{dict.cart.empty}</h2>
          <p className="mx-auto mt-2 max-w-md text-ink-soft">{dict.cart.emptyHint}</p>
          <Link href={catalogHref(lang)} className="mt-6 inline-flex rounded-md bg-oxblood px-5 py-2.5 text-paper hover:bg-oxblood-deep">
            {dict.cart.browse}
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <ul className="divide-y divide-rule border-y border-rule">
            {lines.map((l) => (
              <li key={`${l.product.id}-${l.format.id}`} className="flex gap-4 py-5 sm:gap-6">
                <Link href={productHref(lang, l.product.slug)} className="h-28 w-20 shrink-0 sm:h-32 sm:w-24">
                  <ProductArt product={l.product} lang={lang} />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                    <div className="min-w-0">
                      <Link href={productHref(lang, l.product.slug)} className="line-clamp-2 font-heading text-[1.12rem] leading-snug text-ink hover:text-oxblood">
                        {tr(l.product.title, lang)}
                      </Link>
                      <p className="text-[0.95rem] text-ink-soft">
                        {[l.product.authors.map((a) => tr(personById(a)?.name, lang)).join(", "), formatLabel(l, lang, dict.formats)].filter(Boolean).join(" · ")}
                      </p>
                      {l.product.availability === "preorder" && <p className="mt-0.5 font-sans text-[0.8rem] text-navy">{dict.badges.preorder}</p>}
                    </div>
                    <p className="font-sans font-semibold text-ink">{money(l.format.price * l.qty, lang)}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex h-10 items-center rounded-md border border-rule bg-paper" role="group" aria-label={dict.product.quantity}>
                      <button className="grid h-full w-9 place-items-center" onClick={() => setQty(l.product.id, l.format.id, l.qty - 1)} aria-label="−">
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-7 text-center font-sans tabular-nums">{l.qty}</span>
                      <button className="grid h-full w-9 place-items-center" onClick={() => setQty(l.product.id, l.format.id, l.qty + 1)} aria-label="+">
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <button onClick={() => setQty(l.product.id, l.format.id, 0)} className="inline-flex items-center gap-1.5 text-[0.95rem] text-ink-soft hover:text-oxblood">
                      <Trash2 className="size-4" />
                      {dict.cart.remove}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit space-y-5 rounded-md border border-rule bg-paper p-6 lg:sticky lg:top-24">
            <dl className="space-y-2 text-[1rem]">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">{dict.cart.subtotal}</dt>
                <dd className="font-sans text-ink">{money(subtotal, lang)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">{dict.cart.shipping}</dt>
                <dd className="text-end text-[0.95rem] text-ink-soft">{dict.cart.shippingAtCheckout}</dd>
              </div>
              {wrap > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft">{dict.cart.giftWrap}</dt>
                  <dd className="font-sans text-ink">{money(wrap, lang)}</dd>
                </div>
              )}
            </dl>
            <div className="border-t border-rule pt-4">
              <GiftOptions />
            </div>
            <div className="flex justify-between gap-4 border-t border-rule pt-4 text-lg">
              <span className="text-ink">{dict.cart.total}</span>
              <span className="font-sans font-semibold text-ink">{money(subtotal + wrap, lang)}</span>
            </div>
            <p className="text-[0.9rem] text-ink-soft">{fmt(dict.cart.freeOver, { amount: money(site.commerce.shipping.freeOver, lang) })}</p>
            <Link href={href(lang, "checkout")} className="flex h-12 items-center justify-center rounded-md bg-oxblood text-[1.05rem] text-paper hover:bg-oxblood-deep">
              {dict.cart.checkout}
            </Link>
            <Link href={catalogHref(lang)} className="block text-center text-[0.95rem] text-oxblood hover:underline">
              {dict.cart.continue}
            </Link>
            {site.commerce.parishBulk.enabled && (
              <p className="rounded-md bg-parchment/70 px-4 py-3 text-[0.95rem] text-ink">
                {dict.cart.bulkHint}{" "}
                <Link href={href(lang, "wholesale")} className="text-oxblood underline underline-offset-4">
                  {dict.cart.bulkLink}
                </Link>
              </p>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, Minus, Plus, Store, Truck, Users } from "lucide-react";
import { toast } from "sonner";
import { type ArtView, ProductArt } from "@/components/orthodox/product-art";
import { ProductBadges, WishlistButton } from "@/components/shop/product-card";
import { useSite } from "@/components/site/site-context";
import { submitForm } from "@/lib/commerce";
import { site } from "@/lib/content";
import { dateLong, money } from "@/lib/format";
import { fmt, tr } from "@/lib/i18n";
import { href } from "@/lib/paths";
import { addToCart } from "@/lib/store";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductGallery({ product, views, labels }: { product: Product; views: ArtView[]; labels: Record<ArtView, string> }) {
  const { lang } = useSite();
  const [view, setView] = useState<ArtView>("front");
  return (
    <div>
      <div className="paper-grain relative aspect-[4/5] overflow-hidden rounded-md bg-parchment/70 px-[16%] py-[9%]">
        <ProductArt product={product} lang={lang} view={view} />
      </div>
      {views.length > 1 && (
        <div className="mt-3 grid grid-cols-3 gap-3" role="tablist" aria-label="Gallery">
          {views.map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border-2 bg-parchment/60 p-3 transition-colors",
                view === v ? "border-oxblood" : "border-transparent hover:border-rule",
              )}
              data-overflow-ok
            >
              <ProductArt product={product} lang={lang} view={v} />
              <span className="sr-only">{labels[v]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NotifyForm({ productId }: { productId: string }) {
  const { lang, dict } = useSite();
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  if (state === "done")
    return (
      <p role="status" className="rounded-md bg-parchment px-4 py-3 text-ink">
        {dict.product.notifyDone}
      </p>
    );
  return (
    <form
      className="rounded-md border border-rule bg-paper p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("sending");
        await submitForm("notify", { productId, email: new FormData(e.currentTarget).get("email"), language: lang });
        setState("done");
      }}
    >
      <p className="flex items-center gap-2 font-heading text-lg text-ink">
        <Bell className="size-4 text-gold" />
        {dict.product.notifyTitle}
      </p>
      <p className="mt-1 text-[0.98rem] text-ink-soft">{dict.product.notifyText}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="notify-email" className="sr-only">
          {dict.common.emailLabel}
        </label>
        <input
          id="notify-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={dict.common.emailLabel}
          className="h-11 min-w-0 flex-1 rounded-md border border-rule bg-cream px-3 text-ink focus:border-gold focus:outline-none"
        />
        <button type="submit" disabled={state === "sending"} className="h-11 rounded-md bg-navy px-5 text-paper hover:bg-navy-deep disabled:opacity-60">
          {state === "sending" ? dict.common.sending : dict.product.notifySubmit}
        </button>
      </div>
    </form>
  );
}

export function PurchasePanel({ product }: { product: Product }) {
  const { lang, dict } = useSite();
  const [formatId, setFormatId] = useState(product.formats[0].id);
  const [qty, setQty] = useState(1);
  const format = product.formats.find((f) => f.id === formatId) ?? product.formats[0];
  const isOut = product.availability === "out_of_stock";
  const isPre = product.availability === "preorder";
  const optionLabel = (f: Product["formats"][number]) =>
    f.format === "gift-card" ? money(f.price, lang) : f.label ? tr(f.label, lang) : dict.formats[f.format];
  const formatTitle = product.formats.some((f) => f.label) ? dict.product.chooseOption : dict.product.chooseFormat;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="font-sans text-[1.7rem] font-semibold text-ink">{money(format.price, lang)}</p>
        <span className="rounded-sm border border-rule px-2 py-0.5 font-sans text-[0.75rem] text-ink-soft">{dict.common.samplePrice}</span>
        <ProductBadges product={product} />
        {product.availability === "low_stock" && <span className="font-sans text-[0.85rem] text-oxblood">{dict.badges.low_stock}</span>}
        {product.availability === "in_stock" && <span className="font-sans text-[0.85rem] text-success">{dict.badges.in_stock}</span>}
      </div>

      {product.formats.length > 1 && (
        <fieldset className="mt-6">
          <legend className="eyebrow mb-2.5 !text-ink">{formatTitle}</legend>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {product.formats.map((f) => (
              <label
                key={f.id}
                className={cn(
                  "flex cursor-pointer flex-col rounded-md border-2 bg-paper px-3 py-2.5 transition-colors",
                  f.id === formatId ? "border-oxblood" : "border-rule hover:border-ink/30",
                )}
              >
                <input type="radio" name="format" value={f.id} checked={f.id === formatId} onChange={() => setFormatId(f.id)} className="sr-only" />
                <span className="text-[1rem] leading-snug break-words text-ink">{optionLabel(f)}</span>
                {f.format !== "gift-card" && <span className="mt-0.5 font-sans text-[0.85rem] text-ink-soft">{money(f.price, lang)}</span>}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {isPre && (
        <p className="mt-5 rounded-md bg-navy/5 px-4 py-3 text-[0.98rem] text-ink">
          <span className="font-semibold">{dict.product.releaseDate}:</span> {dateLong(product.releaseDate, lang)}. {dict.product.preorderNote}
        </p>
      )}

      {isOut ? (
        <div className="mt-6">
          <NotifyForm productId={product.id} />
          <div className="mt-3 flex justify-end">
            <WishlistButton id={product.id} className="border border-rule" />
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-stretch gap-3">
          <div className="flex h-12 items-center rounded-md border border-rule bg-paper" role="group" aria-label={dict.product.quantity}>
            <button className="grid h-full w-11 place-items-center text-ink hover:text-oxblood" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="−">
              <Minus className="size-4" />
            </button>
            <span className="w-8 text-center font-sans tabular-nums" aria-live="polite">
              {qty}
            </span>
            <button className="grid h-full w-11 place-items-center text-ink hover:text-oxblood" onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="+">
              <Plus className="size-4" />
            </button>
          </div>
          <button
            className="h-12 min-w-0 flex-1 rounded-md bg-oxblood px-6 text-[1.05rem] text-paper shadow-sm hover:bg-oxblood-deep"
            onClick={() => {
              addToCart(product.id, format.id, qty);
              toast.success(dict.product.added, {
                description: tr(product.title, lang),
                action: { label: dict.product.viewCart, onClick: () => (window.location.href = href(lang, "cart")) },
              });
            }}
          >
            {isPre ? dict.product.preorder : dict.product.addToCart}
          </button>
          <WishlistButton id={product.id} className="size-12 border border-rule" />
        </div>
      )}

      <ul className="mt-6 grid gap-2 text-[0.95rem] text-ink-soft">
        <li className="flex items-center gap-2.5">
          <Truck className="size-4 text-gold" />
          {fmt(dict.cart.freeOver, { amount: money(site.commerce.shipping.freeOver, lang) })}
        </li>
        {site.commerce.pickup.enabled && (
          <li className="flex items-center gap-2.5">
            <Store className="size-4 text-gold" />
            {dict.checkout.pickup}. {dict.checkout.pickupNote}
          </li>
        )}
        {site.commerce.parishBulk.enabled && (
          <li className="flex items-center gap-2.5">
            <Users className="size-4 text-gold" />
            <span>
              {dict.cart.bulkHint}{" "}
              <Link href={href(lang, "wholesale")} className="text-oxblood underline-offset-4 hover:underline">
                {dict.cart.bulkLink}
              </Link>
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}

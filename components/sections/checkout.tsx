"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Lock, Store, Truck, Users } from "lucide-react";
import { ProductArt } from "@/components/orthodox/product-art";
import { useSite } from "@/components/site/site-context";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Fulfillment, shippingFor, submitOrder } from "@/lib/commerce";
import { site } from "@/lib/content";
import { money } from "@/lib/format";
import { fmt, tr } from "@/lib/i18n";
import { catalogHref, href } from "@/lib/paths";
import { clearCart } from "@/lib/store";
import { cn } from "@/lib/utils";
import { formatLabel, GiftOptions, useCartLines } from "./cart";

function Field({ id, label, optional, className, ...props }: React.ComponentProps<typeof Input> & { id: string; label: string; optional?: string }) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-1.5 text-[0.95rem] font-normal text-ink">
        {label}
        {optional && <span className="text-ink-soft"> ({optional})</span>}
      </Label>
      <Input id={id} name={id} className="h-11 bg-cream text-[1rem]" {...props} />
    </div>
  );
}

function Block({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-md border border-rule bg-paper p-5 md:p-6">
      <legend className="sr-only">{title}</legend>
      <h2 className="mb-5 flex items-center gap-3 font-heading text-[1.35rem] text-ink" aria-hidden>
        <span className="grid size-7 place-items-center rounded-full bg-oxblood font-sans text-sm text-paper">{n}</span>
        {title}
      </h2>
      {children}
    </fieldset>
  );
}

const providerName = { stripe: "Stripe", "authorize-net": "Authorize.net", none: "" } as const;

export function CheckoutSection() {
  const { lang, dict } = useSite();
  const { hydrated, cart, lines, subtotal } = useCartLines();
  const [fulfillment, setFulfillment] = useState<Fulfillment>("ship");
  const [taxExempt, setTaxExempt] = useState(false);
  const [invoice, setInvoice] = useState(true);
  const [status, setStatus] = useState<{ kind: "idle" | "sending" | "error"; message?: string } | { kind: "done"; order: string }>({ kind: "idle" });

  const shipping = shippingFor(subtotal, fulfillment);
  const wrap = cart.giftWrap ? site.commerce.shipping.giftWrap : 0;
  const total = subtotal + (shipping ?? 0) + wrap;
  const provider = site.commerce.provider;

  if (status.kind === "done") {
    return (
      <section className="container-page py-16">
        <div className="mx-auto max-w-xl rounded-md border border-rule bg-paper p-8 text-center shadow-card">
          <CheckCircle2 className="mx-auto size-12 text-success" strokeWidth={1.4} />
          <h1 className="mt-4 text-[2rem] text-ink">{dict.checkout.confirmTitle}</h1>
          <p className="mt-3 text-ink-soft">{dict.checkout.confirmText}</p>
          <p className="mt-5 font-sans text-sm text-ink-soft">
            {dict.checkout.orderNumber}: <span className="font-semibold text-ink">{status.order}</span>
          </p>
          <Link href={catalogHref(lang)} className="mt-8 inline-flex rounded-md bg-oxblood px-5 py-2.5 text-paper">
            {dict.cart.continue}
          </Link>
        </div>
      </section>
    );
  }

  const options: { id: Fulfillment; title: string; note: string; icon: typeof Truck; enabled: boolean }[] = [
    { id: "ship", title: dict.checkout.ship, note: fmt(dict.checkout.shipNote, { amount: money(site.commerce.shipping.freeOver, lang) }), icon: Truck, enabled: true },
    { id: "pickup", title: dict.checkout.pickup, note: dict.checkout.pickupNote, icon: Store, enabled: site.commerce.pickup.enabled },
    { id: "parish", title: dict.checkout.parish, note: dict.checkout.parishNote, icon: Users, enabled: site.commerce.parishBulk.enabled },
  ];

  return (
    <section className="container-page py-10 md:py-14">
      <h1 className="text-[2.1rem] text-ink md:text-[2.8rem]">{dict.checkout.title}</h1>
      {!hydrated ? (
        <div className="mt-8 h-96 animate-pulse rounded-md bg-parchment/60" aria-label={dict.common.loading} />
      ) : lines.length === 0 ? (
        <div className="mt-8 rounded-md border border-dashed border-rule bg-paper/60 px-6 py-14 text-center">
          <p className="text-lg text-ink-soft">{dict.checkout.emptyCart}</p>
          <Link href={catalogHref(lang)} className="mt-6 inline-flex rounded-md bg-oxblood px-5 py-2.5 text-paper">
            {dict.cart.browse}
          </Link>
        </div>
      ) : (
        <form
          className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-10"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const v = (k: string) => String(fd.get(k) ?? "");
            setStatus({ kind: "sending" });
            const result = await submitOrder({
              lines: lines.map((l) => ({ productId: l.product.id, formatId: l.format.id, title: tr(l.product.title, lang), qty: l.qty, unitPrice: l.format.price })),
              fulfillment,
              contact: { name: v("name"), email: v("email"), phone: v("phone") },
              address: fulfillment !== "pickup" ? { street: v("street"), city: v("city"), region: v("region"), postal: v("postal"), country: v("country") } : undefined,
              parish: fulfillment === "parish" ? { name: v("parishName"), role: v("parishRole"), taxExempt, invoice } : undefined,
              gift: { wrap: cart.giftWrap, message: cart.giftMessage },
              totals: { subtotal, shipping, giftWrap: wrap, total },
              currency: site.commerce.currency,
              language: lang,
            });
            if (result.kind === "redirect") window.location.href = result.url;
            else if (result.kind === "demo") {
              clearCart();
              setStatus({ kind: "done", order: result.orderNumber });
              window.scrollTo({ top: 0 });
            } else setStatus({ kind: "error", message: result.message });
          }}
        >
          <div className="space-y-6">
            <Block n={1} title={dict.checkout.contact}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="name" label={dict.common.nameLabel} required autoComplete="name" className="sm:col-span-2" />
                <Field id="email" type="email" label={dict.common.emailLabel} required autoComplete="email" />
                <Field id="phone" type="tel" label={dict.common.phoneLabel} optional={dict.common.optional} autoComplete="tel" />
              </div>
            </Block>

            <Block n={2} title={dict.checkout.fulfillment}>
              <div className="grid gap-3 md:grid-cols-3" role="radiogroup" aria-label={dict.checkout.fulfillment}>
                {options
                  .filter((o) => o.enabled)
                  .map((o) => (
                    <label
                      key={o.id}
                      className={cn("flex cursor-pointer flex-col gap-1 rounded-md border-2 p-4 transition-colors", fulfillment === o.id ? "border-oxblood bg-cream" : "border-rule hover:border-ink/30")}
                    >
                      <input type="radio" name="fulfillment" value={o.id} checked={fulfillment === o.id} onChange={() => setFulfillment(o.id)} className="sr-only" />
                      <o.icon className="size-5 text-gold" strokeWidth={1.6} />
                      <span className="mt-1 text-[1.02rem] leading-tight text-ink">{o.title}</span>
                      <span className="text-[0.88rem] leading-snug text-ink-soft">{o.note}</span>
                    </label>
                  ))}
              </div>

              {fulfillment === "parish" && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field id="parishName" label={dict.checkout.parishName} required className="sm:col-span-2" />
                  <Field id="parishRole" label={dict.checkout.parishRole} optional={dict.common.optional} className="sm:col-span-2" />
                  <div className="flex items-center gap-2.5 sm:col-span-2">
                    <Checkbox id="taxExempt" checked={taxExempt} onCheckedChange={(v) => setTaxExempt(v === true)} />
                    <Label htmlFor="taxExempt" className="text-[0.98rem] font-normal text-ink">
                      {dict.checkout.taxExempt}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2.5 sm:col-span-2">
                    <Checkbox id="invoice" checked={invoice} onCheckedChange={(v) => setInvoice(v === true)} />
                    <Label htmlFor="invoice" className="text-[0.98rem] font-normal text-ink">
                      {dict.checkout.invoice}
                    </Label>
                  </div>
                </div>
              )}

              {fulfillment !== "pickup" && (
                <div className="mt-6">
                  <p className="eyebrow mb-3 !text-ink">{dict.checkout.address}</p>
                  <div className="grid gap-4 sm:grid-cols-6">
                    <Field id="street" label={dict.checkout.street} required autoComplete="street-address" className="sm:col-span-6" />
                    <Field id="city" label={dict.checkout.city} required autoComplete="address-level2" className="sm:col-span-3" />
                    <Field id="region" label={dict.checkout.region} autoComplete="address-level1" className="sm:col-span-3" />
                    <Field id="postal" label={dict.checkout.postal} required autoComplete="postal-code" className="sm:col-span-2" />
                    <Field id="country" label={dict.checkout.country} required autoComplete="country-name" defaultValue={tr(site.contact.address.country, lang)} className="sm:col-span-4" />
                  </div>
                </div>
              )}
            </Block>

            <Block n={3} title={dict.checkout.gift}>
              <GiftOptions />
            </Block>

            <Block n={4} title={dict.checkout.payment}>
              <div className="flex gap-3 rounded-md bg-parchment/70 p-4 text-[0.98rem] text-ink">
                <Lock className="mt-0.5 size-4 shrink-0 text-gold" />
                <div>
                  <p>{provider === "none" ? dict.checkout.paymentNone : fmt(dict.checkout.paymentProvider, { provider: providerName[provider] })}</p>
                  <p className="mt-1 text-[0.9rem] text-ink-soft">{dict.checkout.secureNote}</p>
                </div>
              </div>
            </Block>
          </div>

          <aside className="h-fit space-y-4 rounded-md border border-rule bg-paper p-6 lg:sticky lg:top-24">
            <h2 className="font-heading text-[1.35rem] text-ink">{dict.checkout.summary}</h2>
            <ul className="space-y-3">
              {lines.map((l) => (
                <li key={`${l.product.id}-${l.format.id}`} className="flex items-center gap-3">
                  <span className="relative h-16 w-12 shrink-0">
                    <ProductArt product={l.product} lang={lang} />
                    <span className="absolute -end-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-ink font-sans text-[0.7rem] text-paper">{l.qty}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-[0.98rem] leading-snug text-ink">{tr(l.product.title, lang)}</span>
                    <span className="block text-[0.85rem] text-ink-soft">{formatLabel(l, lang, dict.formats)}</span>
                  </span>
                  <span className="font-sans text-[0.95rem] text-ink">{money(l.format.price * l.qty, lang)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 border-t border-rule pt-4 text-[1rem]">
              <div className="flex justify-between">
                <dt className="text-ink-soft">{dict.cart.subtotal}</dt>
                <dd className="font-sans">{money(subtotal, lang)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">{dict.cart.shipping}</dt>
                <dd className="font-sans">{shipping === null ? dict.checkout.quoted : shipping === 0 ? dict.checkout.free : money(shipping, lang)}</dd>
              </div>
              {wrap > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-soft">{dict.cart.giftWrap}</dt>
                  <dd className="font-sans">{money(wrap, lang)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-rule pt-3 text-lg">
                <dt className="text-ink">{dict.cart.total}</dt>
                <dd className="font-sans font-semibold">{money(total, lang)}</dd>
              </div>
            </dl>
            {status.kind === "error" && (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-[0.95rem] text-destructive">
                {dict.common.errorTitle}. {status.message}
              </p>
            )}
            <button type="submit" disabled={status.kind === "sending"} className="h-12 w-full rounded-md bg-oxblood text-[1.05rem] text-paper hover:bg-oxblood-deep disabled:opacity-60">
              {status.kind === "sending" ? dict.common.sending : dict.checkout.placeOrder}
            </button>
            <Link href={href(lang, "cart")} className="block text-center text-[0.95rem] text-oxblood hover:underline">
              {dict.cart.title}
            </Link>
          </aside>
        </form>
      )}
    </section>
  );
}

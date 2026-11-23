"use client";

import { useState } from "react";
import { CheckCircle2, Heart, Package, UserRound } from "lucide-react";
import Link from "next/link";
import { ProductGrid } from "@/components/shop/product-card";
import { useSite } from "@/components/site/site-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitForm } from "@/lib/commerce";
import { productById, site } from "@/lib/content";
import { catalogHref } from "@/lib/paths";
import { useHydrated, wishlistStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "done" | "error";

function useFormSubmit(form: Parameters<typeof submitForm>[0]) {
  const { lang } = useSite();
  const [status, setStatus] = useState<Status>("idle");
  const [demo, setDemo] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>, extra: Record<string, unknown> = {}) => {
    e.preventDefault();
    setStatus("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await submitForm(form, { ...data, ...extra, language: lang });
    setDemo(res.demo);
    setStatus(res.ok ? "done" : "error");
  };
  return { status, demo, onSubmit };
}

function Done({ text, demo }: { text: string; demo: boolean }) {
  const { dict } = useSite();
  return (
    <div role="status" className="rounded-md border border-rule bg-paper p-8 text-center">
      <CheckCircle2 className="mx-auto size-10 text-success" strokeWidth={1.4} />
      <p className="mt-3 text-lg text-ink">{text}</p>
      {demo && <p className="mx-auto mt-2 max-w-md text-[0.9rem] text-ink-soft">{dict.common.formDemo}</p>}
    </div>
  );
}

function F({ id, label, optional, className, textarea, hint, ...props }: { id: string; label: string; optional?: boolean; className?: string; textarea?: boolean; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const { dict } = useSite();
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-1.5 text-[0.95rem] font-normal text-ink">
        {label}
        {optional && <span className="text-ink-soft"> ({dict.common.optional})</span>}
      </Label>
      {textarea ? (
        <Textarea id={id} name={id} required={props.required} placeholder={props.placeholder} className="min-h-28 bg-cream text-[1rem]" />
      ) : (
        <Input id={id} name={id} className="h-11 bg-cream text-[1rem]" {...props} />
      )}
      {hint && <p className="mt-1 text-[0.85rem] text-ink-soft">{hint}</p>}
    </div>
  );
}

export function WholesaleForm() {
  const { dict } = useSite();
  const w = dict.wholesale;
  const { status, demo, onSubmit } = useFormSubmit("wholesale");
  const [orgType, setOrgType] = useState("parish");
  return (
    <section className="container-page pb-16" id="request">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-6 text-[1.75rem] text-ink md:text-[2.2rem]">{w.formTitle}</h2>
        {status === "done" ? (
          <Done text={w.done} demo={demo} />
        ) : (
          <form onSubmit={(e) => onSubmit(e, { orgType })} className="grid gap-5 rounded-md border border-rule bg-paper p-5 sm:grid-cols-2 md:p-8">
            <F id="organization" label={w.organization} required className="sm:col-span-2" />
            <div>
              <Label className="mb-1.5 text-[0.95rem] font-normal text-ink">{w.orgType}</Label>
              <Select value={orgType} onValueChange={setOrgType}>
                <SelectTrigger className="!h-11 w-full bg-cream text-[1rem]" aria-label={w.orgType}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-paper">
                  <SelectItem value="parish">{w.orgParish}</SelectItem>
                  <SelectItem value="monastery">{w.orgMonastery}</SelectItem>
                  <SelectItem value="school">{w.orgSchool}</SelectItem>
                  <SelectItem value="other">{w.orgOther}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <F id="jurisdiction" label={w.jurisdiction} optional />
            <F id="contactName" label={w.contactName} required autoComplete="name" />
            <F id="email" type="email" label={dict.common.emailLabel} required autoComplete="email" />
            <F id="phone" type="tel" label={dict.common.phoneLabel} optional autoComplete="tel" />
            <F id="neededBy" type="date" label={w.neededBy} optional />
            <F id="address" label={w.address} required autoComplete="street-address" className="sm:col-span-2" />
            <F id="titles" label={w.titles} textarea required placeholder={w.titlesHint} hint={w.titlesHint} className="sm:col-span-2" />
            <label className="flex items-center gap-2.5 text-[0.98rem] text-ink sm:col-span-2">
              <input type="checkbox" name="taxExempt" className="size-4 accent-[var(--tk-color-oxblood)]" />
              {w.taxExempt}
            </label>
            <F id="notes" label={w.notes} textarea optional className="sm:col-span-2" />
            {status === "error" && <p className="text-destructive sm:col-span-2">{dict.common.errorText}</p>}
            <div className="sm:col-span-2">
              <button type="submit" disabled={status === "sending"} className="h-12 w-full rounded-md bg-oxblood px-8 text-[1.05rem] text-paper hover:bg-oxblood-deep disabled:opacity-60 sm:w-auto">
                {status === "sending" ? dict.common.sending : w.submit}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export function ContactForm() {
  const { dict } = useSite();
  const { status, demo, onSubmit } = useFormSubmit("contact");
  return (
    <section className="container-page grid gap-10 py-12 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:py-16">
      {status === "done" ? (
        <Done text={dict.common.thanks} demo={demo} />
      ) : (
        <form onSubmit={(e) => onSubmit(e)} className="grid gap-5 rounded-md border border-rule bg-paper p-5 sm:grid-cols-2 md:p-8">
          <F id="name" label={dict.common.nameLabel} required autoComplete="name" />
          <F id="email" type="email" label={dict.common.emailLabel} required autoComplete="email" />
          <F id="subject" label={dict.contact.subject} optional className="sm:col-span-2" />
          <F id="message" label={dict.contact.message} textarea required className="sm:col-span-2" />
          {status === "error" && <p className="text-destructive sm:col-span-2">{dict.common.errorText}</p>}
          <div className="sm:col-span-2">
            <button type="submit" disabled={status === "sending"} className="h-12 w-full rounded-md bg-oxblood px-8 text-[1.05rem] text-paper hover:bg-oxblood-deep disabled:opacity-60 sm:w-auto">
              {status === "sending" ? dict.common.sending : dict.common.send}
            </button>
          </div>
        </form>
      )}
      <aside className="space-y-4 text-[1.05rem]">
        <p className="eyebrow">{dict.contact.orWrite}</p>
        <p>
          <a href={`mailto:${site.contact.email}`} className="break-all text-oxblood underline-offset-4 hover:underline">
            {site.contact.email}
          </a>
        </p>
        <p>
          <a href={`tel:${site.contact.phone.replace(/[^\d+]/g, "")}`} className="text-ink hover:text-oxblood">
            {site.contact.phone}
          </a>
        </p>
      </aside>
    </section>
  );
}

export function WishlistSection() {
  const { lang, dict } = useSite();
  const hydrated = useHydrated();
  const { ids } = wishlistStore.useStore();
  const items = ids.map(productById).filter((p): p is NonNullable<typeof p> => Boolean(p));
  return (
    <section className="container-page py-10 md:py-14">
      {!hydrated ? (
        <div className="h-64 animate-pulse rounded-md bg-parchment/60" />
      ) : items.length ? (
        <ProductGrid products={items} />
      ) : (
        <div className="rounded-md border border-dashed border-rule bg-paper/60 px-6 py-16 text-center">
          <Heart className="mx-auto size-10 text-gold" strokeWidth={1.4} />
          <h2 className="mt-4 font-heading text-2xl text-ink">{dict.wishlist.empty}</h2>
          <p className="mx-auto mt-2 max-w-md text-ink-soft">{dict.wishlist.emptyHint}</p>
          <Link href={catalogHref(lang)} className="mt-6 inline-flex rounded-md bg-oxblood px-5 py-2.5 text-paper">
            {dict.cart.browse}
          </Link>
        </div>
      )}
    </section>
  );
}

export function AccountSection() {
  const { dict } = useSite();
  const a = dict.account;
  return (
    <section className="container-page grid gap-8 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:py-14">
      <div className="rounded-md border border-rule bg-paper p-6 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2.5 font-heading text-2xl text-ink">
            <UserRound className="size-5 text-gold" />
            {a.signInTitle}
          </h2>
          <span className="rounded-sm bg-parchment px-2 py-0.5 font-sans text-[0.72rem] text-ink-soft">{a.placeholder}</span>
        </div>
        <p className="mt-2 text-[0.98rem] text-ink-soft">{a.signInText}</p>
        <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <F id="acct-email" type="email" label={dict.common.emailLabel} disabled />
          <F id="acct-password" type="password" label={a.password} disabled />
          <button disabled className="h-11 w-full rounded-md bg-oxblood/50 text-paper">
            {a.signIn}
          </button>
          <button disabled className="h-11 w-full rounded-md border border-rule text-ink-soft">
            {a.create}
          </button>
        </form>
      </div>
      <div className="space-y-6">
        {[
          { icon: Package, title: a.orders, text: a.ordersEmpty },
          { icon: Package, title: a.preorders, text: a.preordersEmpty },
        ].map((b) => (
          <div key={b.title} className={cn("rounded-md border border-dashed border-rule bg-paper/60 p-6")}>
            <h3 className="flex items-center gap-2.5 font-heading text-xl text-ink">
              <b.icon className="size-5 text-gold" strokeWidth={1.5} />
              {b.title}
            </h3>
            <p className="mt-2 text-ink-soft">{b.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

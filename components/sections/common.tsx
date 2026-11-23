import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { OrthodoxCross } from "@/components/orthodox/orthodox-cross";
import { ProductCard } from "@/components/shop/product-card";
import { productById, site } from "@/lib/content";
import { getDictionary, paragraphs, tr } from "@/lib/i18n";
import { href } from "@/lib/paths";
import type { Localized, SectionConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface SectionProps {
  section: SectionConfig;
  lang: string;
}

export function SectionHeading({
  lang,
  eyebrow,
  heading,
  link,
  className,
  align = "start",
}: {
  lang: string;
  eyebrow?: Localized;
  heading?: Localized;
  link?: { href: string; label: string };
  className?: string;
  align?: "start" | "center";
}) {
  if (!eyebrow && !heading) return null;
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 md:mb-10", align === "center" && "justify-center text-center", className)}>
      <div className={cn("min-w-0", align === "center" && "mx-auto")}>
        {eyebrow && <p className="eyebrow mb-2">{tr(eyebrow, lang)}</p>}
        {heading && <h2 className="max-w-3xl text-[1.75rem] text-ink md:text-[2.3rem]">{tr(heading, lang)}</h2>}
      </div>
      {link && (
        <Link href={link.href} className="group inline-flex items-center gap-1.5 text-[1.02rem] text-oxblood">
          <span className="underline-offset-4 group-hover:underline">{link.label}</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function Ornament({ className }: { className?: string }) {
  return (
    <div className={cn("rule-ornament", className)} aria-hidden>
      <OrthodoxCross variant="byzantine" className="h-3.5" />
    </div>
  );
}

export function PageHeader({ section, lang }: SectionProps) {
  return (
    <section className="border-b border-rule bg-paper/60">
      <div className="container-page py-12 md:py-16">
        {section.eyebrow && <p className="eyebrow mb-3">{tr(section.eyebrow, lang)}</p>}
        <h1 className="max-w-4xl text-[2.1rem] text-ink md:text-[3.1rem]">{tr(section.heading, lang)}</h1>
        {section.intro && <p className="mt-4 max-w-2xl text-lg text-ink-soft md:text-xl">{tr(section.intro, lang)}</p>}
      </div>
    </section>
  );
}

export function RichText({ section, lang }: SectionProps) {
  const text = tr(section.body ?? section.text, lang);
  return (
    <section className="container-page py-12 md:py-16">
      <div className="prose-reading mx-auto max-w-[var(--tk-layout-readingWidth)] text-[1.12rem] leading-[1.75] text-ink">
        {section.heading && <h2>{tr(section.heading, lang)}</h2>}
        {paragraphs(text).map((p, i) => (
          <p key={i} className={cn(i === 0 && "first-letter:float-start first-letter:me-2 first-letter:font-display first-letter:text-[3.6rem] first-letter:leading-[0.85] first-letter:text-oxblood")}>
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

export function ProductShelf({ section, lang }: SectionProps) {
  const ids = (section.products as string[]) ?? [];
  const items = ids.map(productById).filter((p): p is NonNullable<typeof p> => Boolean(p));
  return (
    <section className="container-page py-12 md:py-16">
      <SectionHeading lang={lang} eyebrow={section.eyebrow} heading={section.heading} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

export function VisitStrip({ lang }: SectionProps) {
  const dict = getDictionary(lang);
  const a = site.contact.address;
  return (
    <section className="container-page py-12 md:py-16">
      <div className="grid gap-px overflow-hidden rounded-md border border-rule bg-rule md:grid-cols-[1.2fr_1fr_auto]">
        <div className="bg-paper p-6 md:p-8">
          <p className="eyebrow mb-3 flex items-center gap-2">
            <Clock className="size-3.5" /> {dict.visit.hours}
          </p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-[1rem]">
            {site.hours.map((h, i) => (
              <div key={i} className="contents">
                <dt className="text-ink-soft">{tr(h.days, lang)}</dt>
                <dd className="text-ink">{tr(h.time, lang)}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="bg-paper p-6 md:p-8">
          <p className="eyebrow mb-3 flex items-center gap-2">
            <MapPin className="size-3.5" /> {dict.visit.address}
          </p>
          <p className="text-[1.05rem] leading-relaxed text-ink">
            {tr(a.line1, lang)}
            <br />
            {tr(a.line2, lang)}
            <br />
            {tr(a.city, lang)}, {a.region} {a.postalCode}
          </p>
        </div>
        <div className="flex flex-col justify-center gap-3 bg-navy p-6 md:p-8">
          <Link href={href(lang, "visit")} className="inline-flex items-center justify-center rounded-md bg-gold-foil px-5 py-2.5 text-navy-deep hover:bg-gold-soft">
            {dict.visit.directions}
          </Link>
          <a href={`tel:${site.contact.phone.replace(/[^\d+]/g, "")}`} className="text-center text-paper/80 hover:text-gold-soft">
            {site.contact.phone}
          </a>
        </div>
      </div>
    </section>
  );
}

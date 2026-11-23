import Link from "next/link";
import { ArrowLeft, ExternalLink, MapPin, Phone } from "lucide-react";
import { Pictogram } from "@/components/orthodox/pictogram";
import { ProductCard } from "@/components/shop/product-card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faq, people, posts, productById, products, publishers, site, splitEvents } from "@/lib/content";
import { dateLong, eventParts } from "@/lib/format";
import { fmt, getDictionary, paragraphs, tr } from "@/lib/i18n";
import { catalogHref, href, productHref } from "@/lib/paths";
import { clothStyle } from "@/lib/tokens";
import type { Localized, Post } from "@/lib/types";
import { SectionHeading, type SectionProps } from "./common";
import { EventCard, PostCard } from "./home";

export function WholesaleTiers({ lang }: SectionProps) {
  const w = getDictionary(lang).wholesale;
  const tiers = [
    [w.tierA, w.discountA],
    [w.tierB, w.discountB],
    [w.tierC, w.discountC],
  ];
  return (
    <section className="container-page grid gap-8 py-12 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:py-16">
      <div>
        <h2 className="text-[1.75rem] text-ink md:text-[2.2rem]">{w.tiersTitle}</h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-3">
          {tiers.map(([t, d], i) => (
            <li key={i} className="cloth relative rounded-md p-5 text-paper shadow-book" style={clothStyle(["navy", "oxblood", "forest"][i])}>
              <span className="absolute inset-2 rounded-sm border border-gold-foil/35" />
              <p className="relative font-display text-3xl text-gold-foil">{["Α", "Β", "Γ"][i]}</p>
              <p className="relative mt-3 text-[1.02rem] leading-snug">{t}</p>
              <p className="foil-text relative mt-3 font-heading text-xl">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[0.9rem] text-ink-soft">{w.tiersNote}</p>
      </div>
      <div className="rounded-md border border-rule bg-paper p-6">
        <Pictogram name="censer" className="h-10 w-10 text-gold" />
        <h3 className="mt-3 font-heading text-xl text-ink">{w.whoTitle}</h3>
        <p className="mt-2 text-[1.02rem] text-ink-soft">{w.whoText}</p>
        <a href="#request" className="mt-5 inline-flex rounded-md bg-oxblood px-5 py-2.5 text-paper hover:bg-oxblood-deep">
          {w.formTitle}
        </a>
      </div>
    </section>
  );
}

export function PublishersList({ section, lang }: SectionProps) {
  const dict = getDictionary(lang);
  return (
    <section className="container-page py-12 md:py-16">
      <SectionHeading lang={lang} heading={section.heading} />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {publishers.map((p) => {
          const count = products.filter((x) => x.publisher === p.id).length;
          return (
            <li key={p.id} className="flex flex-col rounded-md border border-rule bg-paper p-6">
              <span className="grid size-12 place-items-center rounded-full bg-parchment text-oxblood">
                <Pictogram name="open-book" className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-heading text-[1.25rem] leading-snug text-ink">{tr(p.name, lang)}</h3>
              <p className="font-sans text-[0.85rem] text-gold">{tr(p.place, lang)}</p>
              <p className="mt-3 text-[0.98rem] text-ink-soft">{tr(p.about, lang)}</p>
              <Link href={catalogHref(lang, `publisher=${p.id}`)} className="mt-auto pt-4 text-oxblood hover:underline">
                {fmt(dict.catalog.results, { count })}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function AuthorsList({ section, lang }: SectionProps) {
  const groups: { title: Localized; kind: "father" | "sample" }[] = [
    { title: section.fathersHeading as Localized, kind: "father" },
    { title: section.modernHeading as Localized, kind: "sample" },
  ];
  return (
    <section className="border-t border-rule bg-paper/60">
      <div className="container-page grid gap-12 py-12 md:py-16 lg:grid-cols-2">
        {groups.map((g) => (
          <div key={g.kind}>
            <h2 className="mb-6 text-[1.6rem] text-ink md:text-[2rem]">{tr(g.title, lang)}</h2>
            <ul className="divide-y divide-rule border-y border-rule">
              {people
                .filter((p) => p.kind === g.kind)
                .map((p) => {
                  const count = products.filter((x) => x.authors.includes(p.id) || x.translators.includes(p.id)).length;
                  return (
                    <li key={p.id}>
                      <Link href={catalogHref(lang, `author=${p.id}`)} className="group flex items-baseline justify-between gap-4 py-3">
                        <span className="min-w-0">
                          <span className="block text-[1.08rem] text-ink group-hover:text-oxblood">{tr(p.name, lang)}</span>
                          <span className="block text-[0.92rem] text-ink-soft">{tr(p.note, lang)}</span>
                        </span>
                        <span className="shrink-0 font-sans text-[0.85rem] text-gold">{count}</span>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function EventsList({ lang }: SectionProps) {
  const dict = getDictionary(lang);
  const { upcoming, past } = splitEvents();
  const byMonth = new Map<string, typeof upcoming>();
  upcoming.forEach((e) => {
    const k = eventParts(e.start, lang).monthYear;
    byMonth.set(k, [...(byMonth.get(k) ?? []), e]);
  });
  return (
    <section className="container-page py-12 md:py-16">
      <h2 className="eyebrow mb-6">{dict.events.upcoming}</h2>
      {upcoming.length === 0 && <p className="text-ink-soft">{dict.events.noUpcoming}</p>}
      <div className="space-y-12">
        {[...byMonth.entries()].map(([month, list]) => (
          <div key={month}>
            <h3 className="mb-5 font-display text-[1.6rem] text-oxblood capitalize">{month}</h3>
            <ul className="grid gap-5 lg:grid-cols-2">
              {list.map((e) => {
                const related = e.product ? productById(e.product) : undefined;
                return (
                  <li key={e.id} className="flex flex-col gap-3">
                    <EventCard id={e.id} lang={lang} />
                    {related && (
                      <Link href={productHref(lang, related.slug)} className="ms-2 inline-flex items-center gap-2 text-[0.95rem] text-ink-soft hover:text-oxblood">
                        <Pictogram name="open-book" className="h-4 w-4 text-gold" />
                        {dict.events.related}: {tr(related.title, lang)}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      {past.length > 0 && (
        <div className="mt-16 border-t border-rule pt-10">
          <h2 className="eyebrow mb-5 !text-ink-soft">{dict.events.past}</h2>
          <ul className="divide-y divide-rule">
            {past.map((e) => (
              <li key={e.id} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 py-3 text-ink-soft">
                <span className="w-40 shrink-0 font-sans text-[0.9rem]">{dateLong(e.start.slice(0, 10), lang)}</span>
                <span className="text-[1.05rem] text-ink">{tr(e.title, lang)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function JournalList({ lang }: SectionProps) {
  const list = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <section className="container-page py-12 md:py-16">
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <li key={p.slug}>
            <PostCard slug={p.slug} lang={lang} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PostArticle({ lang, post }: SectionProps & { post: Post }) {
  const dict = getDictionary(lang);
  return (
    <article className="container-page py-10 md:py-14">
      <div className="mx-auto max-w-[var(--tk-layout-readingWidth)]">
        <Link href={href(lang, "journal")} className="inline-flex items-center gap-1.5 font-sans text-[0.9rem] text-ink-soft hover:text-oxblood">
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {dict.journal.back}
        </Link>
        <p className="eyebrow mt-8">{dict.journal.kinds[post.kind]}</p>
        <h1 className="mt-3 text-[2.2rem] leading-tight text-ink md:text-[3rem]">{tr(post.title, lang)}</h1>
        <p className="mt-4 font-sans text-[0.95rem] text-ink-soft">
          {dateLong(post.date, lang)} · {fmt(dict.journal.by, { name: tr(post.author, lang) })}
        </p>
        <div className="rule-ornament my-8" aria-hidden />
        <div className="prose-reading text-[1.15rem] leading-[1.8] text-ink">
          {paragraphs(tr(post.body, lang)).map((p, i) => (
            <p key={i} className={i === 0 ? "first-letter:float-start first-letter:me-2 first-letter:font-display first-letter:text-[3.6rem] first-letter:leading-[0.85] first-letter:text-oxblood" : undefined}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}

export function PostProducts({ section, lang, post }: SectionProps & { post: Post }) {
  const items = post.products.map(productById).filter((p): p is NonNullable<typeof p> => Boolean(p));
  if (!items.length) return null;
  return (
    <section className="container-page border-t border-rule py-12">
      <SectionHeading lang={lang} heading={section.heading} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-5">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

export function VisitInfo({ section, lang }: SectionProps) {
  const dict = getDictionary(lang);
  const a = site.contact.address;
  const directions = (section.directions as { title: Localized; text: Localized }[]) ?? [];
  return (
    <section className="container-page grid gap-10 py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="space-y-8">
        <div>
          <h2 className="eyebrow mb-3">{dict.visit.hours}</h2>
          <dl className="divide-y divide-rule border-y border-rule">
            {site.hours.map((h, i) => (
              <div key={i} className="flex flex-wrap justify-between gap-x-6 gap-y-0.5 py-3">
                <dt className="text-ink">{tr(h.days, lang)}</dt>
                <dd className="text-ink-soft">{tr(h.time, lang)}</dd>
              </div>
            ))}
          </dl>
          {site.hoursNote && <p className="mt-3 text-[0.92rem] text-ink-soft">{tr(site.hoursNote, lang)}</p>}
        </div>
        <div>
          <h2 className="eyebrow mb-3">{dict.visit.address}</h2>
          <address className="text-[1.1rem] leading-relaxed not-italic text-ink">
            {tr(a.line1, lang)}
            <br />
            {tr(a.line2, lang)}
            <br />
            {tr(a.city, lang)}, {a.region} {a.postalCode}
            <br />
            {tr(a.country, lang)}
          </address>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={site.map.directionsUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-md bg-oxblood px-4 py-2.5 text-paper hover:bg-oxblood-deep">
              <MapPin className="size-4" />
              {dict.visit.getDirections}
              <ExternalLink className="size-3.5" />
            </a>
            <a href={`tel:${site.contact.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-2 rounded-md border border-rule px-4 py-2.5 text-ink hover:border-oxblood">
              <Phone className="size-4" />
              {site.contact.phone}
            </a>
          </div>
        </div>
        {directions.length > 0 && (
          <div>
            <h2 className="eyebrow mb-3">{dict.visit.directions}</h2>
            <ul className="space-y-4">
              {directions.map((d, i) => (
                <li key={i}>
                  <h3 className="font-heading text-lg text-ink">{tr(d.title, lang)}</h3>
                  <p className="text-ink-soft">{tr(d.text, lang)}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="lg:sticky lg:top-24 lg:self-start">
        {site.map.embedUrl ? (
          <iframe title={dict.visit.address} src={site.map.embedUrl} className="aspect-[4/3] w-full rounded-md border border-rule" loading="lazy" />
        ) : (
          <div className="paper-grain relative aspect-[4/3] overflow-hidden rounded-md border border-rule bg-parchment">
            <svg viewBox="0 0 400 300" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
              <g stroke="#d8c8a8" strokeWidth="14" fill="none" strokeLinecap="round">
                <path d="M-10 90 H410" />
                <path d="M-10 220 C120 200 260 240 410 205" />
                <path d="M130 -10 V310" />
                <path d="M300 -10 C290 100 320 200 300 310" />
              </g>
              <g stroke="#fbf7ee" strokeWidth="2" strokeDasharray="8 8" fill="none">
                <path d="M-10 90 H410" />
                <path d="M130 -10 V310" />
              </g>
              <rect x="160" y="112" width="110" height="80" rx="4" fill="#ede2cb" stroke="#c9a55e" />
              <circle cx="40" cy="250" r="26" fill="#cbd5b8" opacity=".7" />
              <circle cx="360" cy="40" r="20" fill="#cbd5b8" opacity=".7" />
            </svg>
            <div className="absolute start-1/2 top-[50%] -translate-x-1/2 -translate-y-full text-center rtl:translate-x-1/2">
              <span className="grid size-12 place-items-center rounded-full bg-oxblood text-paper shadow-card">
                <MapPin className="size-6" />
              </span>
            </div>
            <p className="absolute inset-x-4 bottom-4 rounded-md bg-paper/90 px-4 py-2 text-center text-[0.9rem] text-ink-soft">{dict.visit.mapPlaceholder}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function FaqSection({ lang }: SectionProps) {
  return (
    <section className="container-page py-12 md:py-16">
      <div className="mx-auto grid max-w-4xl gap-12">
        {faq.map((g) => (
          <div key={g.id}>
            <h2 className="mb-4 text-[1.5rem] text-ink md:text-[1.9rem]">{tr(g.title, lang)}</h2>
            <Accordion type="single" collapsible className="border-y border-rule">
              {g.items.map((item, i) => (
                <AccordionItem key={i} value={`${g.id}-${i}`} className="border-rule">
                  <AccordionTrigger className="py-4 text-start text-[1.08rem] font-normal text-ink hover:no-underline">{tr(item.q, lang)}</AccordionTrigger>
                  <AccordionContent className="pb-4 text-[1.02rem] leading-relaxed text-ink-soft">{tr(item.a, lang)}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </section>
  );
}

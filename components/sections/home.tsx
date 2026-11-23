import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OrthodoxCross } from "@/components/orthodox/orthodox-cross";
import { Pictogram } from "@/components/orthodox/pictogram";
import { ProductArt } from "@/components/orthodox/product-art";
import { activeSeasonId, categories, categoryGroups, personById, posts, products, saints, seasons, splitEvents } from "@/lib/content";
import { dateLong, eventParts } from "@/lib/format";
import { fmt, getDictionary, paragraphs, tr } from "@/lib/i18n";
import { catalogHref, categoryHref, href, postHref, productHref } from "@/lib/paths";
import { clothStyle } from "@/lib/tokens";
import type { LinkConfig, Localized } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SectionHeading, type SectionProps } from "./common";
import { FeastTabs } from "./feast-tabs";
import { RsvpLink } from "./rsvp-link";

export function Hero({ section, lang }: SectionProps) {
  const dict = getDictionary(lang);
  const primary = section.primaryLink as LinkConfig | undefined;
  const secondary = section.secondaryLink as LinkConfig | undefined;
  const newReleases = products
    .filter((p) => p.flags.includes("new"))
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))
    .slice(0, 3);
  const picks = products.filter((p) => p.flags.includes("staff-pick") && p.staffNote).slice(0, 3);

  return (
    <section className="paper-grain relative overflow-hidden border-b border-rule">
      <div className="container-page grid items-center gap-10 pt-10 pb-12 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-20">
        <div>
          {section.eyebrow && <p className="eyebrow mb-4">{tr(section.eyebrow, lang)}</p>}
          <h1 className="text-[2.35rem] leading-[1.08] text-ink sm:text-[2.9rem] lg:text-[3.6rem]">{tr(section.heading, lang)}</h1>
          <p className="mt-5 max-w-xl text-lg text-ink-soft md:text-xl">{tr(section.text, lang)}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {primary && (
              <Link href={href(lang, primary.href)} className="inline-flex h-12 items-center gap-2 rounded-md bg-oxblood px-6 text-[1.05rem] text-paper shadow-sm hover:bg-oxblood-deep">
                {tr(primary.label, lang)}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            )}
            {secondary && (
              <Link href={href(lang, secondary.href)} className="inline-flex h-12 items-center rounded-md border border-ink/25 px-6 text-[1.05rem] text-ink hover:border-oxblood hover:text-oxblood">
                {tr(secondary.label, lang)}
              </Link>
            )}
          </div>
          {section.epigraph ? (
            <figure className="mt-10 flex max-w-md items-start gap-4 border-s-2 border-gold-foil ps-5">
              <blockquote>
                <p className="font-display text-[1.5rem] leading-snug text-oxblood md:text-[1.7rem]">{tr(section.epigraph as Localized, lang)}</p>
                <figcaption className="mt-1 text-[0.95rem] text-ink-soft">{tr(section.epigraphSource as Localized, lang)}</figcaption>
              </blockquote>
            </figure>
          ) : null}
        </div>

        {section.showNewReleases !== false && newReleases.length > 0 && (
          <div>
            <div className="mb-4 flex items-baseline justify-between">
              <p className="eyebrow">{dict.home.newReleases}</p>
              <Link href={catalogHref(lang, "sort=newest")} className="text-[0.95rem] text-oxblood hover:underline">
                {dict.common.viewAll}
              </Link>
            </div>
            <div className="relative">
              <div className="grid grid-cols-3 items-end gap-3 px-1 sm:gap-6 sm:px-4">
                {newReleases.map((p, i) => (
                  <Link
                    key={p.id}
                    href={productHref(lang, p.slug)}
                    className={cn("group block transition-transform hover:-translate-y-1.5", i === 1 ? "h-[13rem] sm:h-[18rem] lg:h-[20rem]" : "h-[11.5rem] sm:h-[16rem] lg:h-[17.5rem]")}
                    aria-label={tr(p.title, lang)}
                  >
                    <ProductArt product={p} lang={lang} className="items-end" />
                  </Link>
                ))}
              </div>
              <div className="relative z-[1] -mt-px h-3 rounded-sm bg-gradient-to-b from-[#7a5a3a] to-[#4d361f] shadow-[0_10px_18px_-10px_rgba(43,35,32,.7)]" />
              <div className="grid grid-cols-3 gap-3 px-1 pt-3 sm:gap-6 sm:px-4">
                {newReleases.map((p) => (
                  <div key={p.id} className="min-w-0">
                    <p className="line-clamp-2 text-[0.9rem] leading-snug text-ink">{tr(p.title, lang)}</p>
                    <p className="truncate text-[0.82rem] text-ink-soft">{p.authors.map((a) => tr(personById(a)?.name, lang)).join(", ")}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {section.showStaffPicks !== false && picks.length > 0 && (
        <div className="border-t border-rule bg-paper/70">
          <div className="container-page py-8 md:py-10">
            <p className="eyebrow mb-5">{dict.home.staffPicks}</p>
            <ul className="grid gap-5 md:grid-cols-3 md:gap-8">
              {picks.map((p) => (
                <li key={p.id}>
                  <Link href={productHref(lang, p.slug)} className="group flex gap-4">
                    <span className="h-24 w-16 shrink-0">
                      <ProductArt product={p} lang={lang} />
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-2 font-heading text-[1.06rem] leading-snug text-ink group-hover:text-oxblood">{tr(p.title, lang)}</span>
                      <span className="mt-1 block text-[0.98rem] leading-snug text-ink-soft italic">“{tr(p.staffNote, lang)}”</span>
                      <span className="mt-1 block font-sans text-[0.75rem] tracking-[0.14em] text-gold uppercase">{dict.home.pickedBy}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

export function FeastCollection({ section, lang }: SectionProps) {
  const dict = getDictionary(lang);
  const data = seasons.map((s) => ({
    id: s.id,
    cloth: s.accent,
    title: tr(s.title, lang),
    dates: tr(s.dates, lang),
    intro: tr(s.intro, lang),
    href: catalogHref(lang, `season=${s.id}`),
    productIds: products.filter((p) => p.seasons.includes(s.id)).slice(0, 4).map((p) => p.id),
  }));
  return (
    <section className="container-page py-14 md:py-20">
      <SectionHeading lang={lang} eyebrow={section.eyebrow} heading={section.heading} />
      <FeastTabs seasons={data} initial={activeSeasonId()} nowLabel={dict.home.nowObserving} shopLabel={dict.nav.shopTheCollection} />
    </section>
  );
}

export function CategoryGrid({ section, lang }: SectionProps) {
  const books = categories.filter((c) => c.group === "books");
  const rest = categories.filter((c) => c.group !== "books");
  return (
    <section className="border-y border-rule bg-paper/60">
      <div className="container-page py-14 md:py-20">
        <SectionHeading lang={lang} eyebrow={section.eyebrow} heading={section.heading} link={{ href: catalogHref(lang), label: getDictionary(lang).nav.allItems }} />
        <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-12">
          <div>
            <p className="eyebrow mb-4 !text-ink-soft">{tr(categoryGroups.find((g) => g.id === "books")?.title, lang)}</p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
              {books.map((c) => (
                <li key={c.id}>
                  <Link
                    href={categoryHref(lang, c.id)}
                    className="cloth group relative flex h-36 flex-col justify-between overflow-hidden rounded-[3px] p-4 shadow-book transition-transform hover:-translate-y-0.5 sm:h-44 md:p-5"
                    style={clothStyle(c.cloth)}
                  >
                    <span className="absolute inset-2 rounded-[2px] border border-gold-foil/35" />
                    <Pictogram name={c.pictogram} className="relative h-8 w-8 text-gold-foil md:h-10 md:w-10" />
                    <span className="foil-text relative font-heading text-[1.06rem] leading-tight sm:text-[1.2rem]">{tr(c.title, lang)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4 !text-ink-soft">
              {categoryGroups
                .filter((g) => g.id !== "books")
                .map((g) => tr(g.title, lang))
                .join(" · ")}
            </p>
            <ul className="divide-y divide-rule border-y border-rule">
              {rest.map((c) => (
                <li key={c.id}>
                  <Link href={categoryHref(lang, c.id)} className="group flex items-center gap-4 py-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-parchment text-oxblood">
                      <Pictogram name={c.pictogram} className="h-6 w-6" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[1.05rem] text-ink group-hover:text-oxblood">{tr(c.title, lang)}</span>
                      <span className="block truncate text-[0.9rem] text-ink-soft">{tr(c.description, lang)}</span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-gold rtl:rotate-180" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SaintShelf({ section, lang }: SectionProps) {
  const dict = getDictionary(lang);
  return (
    <section className="container-page py-14 md:py-20">
      <SectionHeading lang={lang} eyebrow={section.eyebrow} heading={section.heading} />
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
        {saints.map((s) => {
          const count = products.filter((p) => p.saints.includes(s.id)).length;
          return (
            <li key={s.id} className="text-center">
              <Link href={catalogHref(lang, `saint=${s.id}`)} className="group block">
                <span className="relative mx-auto grid size-28 place-items-center rounded-full bg-gradient-to-b from-[#e6cc86] via-gold-foil to-gold p-[5px] shadow-card transition-transform group-hover:-translate-y-1 md:size-32">
                  <span className="grid size-full place-items-center rounded-full bg-oxblood ring-1 ring-gold-soft/60 ring-inset">
                    {s.inscription ? (
                      <span className="flex gap-3 font-heading text-[1.35rem] tracking-wide text-gold-soft" dir="ltr">
                        {s.inscription.split(" ").map((w) => (
                          <span key={w} className="relative pt-1.5">
                            <span className="absolute inset-x-0 top-0 mx-auto h-px w-[80%] bg-gold-soft" />
                            {w}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <OrthodoxCross variant="byzantine" className="h-10 text-gold-foil" />
                    )}
                  </span>
                </span>
                <span className="mt-4 block font-heading text-[1.08rem] leading-snug text-ink group-hover:text-oxblood">{tr(s.name, lang)}</span>
                <span className="mt-1 block text-[0.88rem] text-ink-soft">
                  {dict.home.feastDay}: {tr(s.feast, lang)}
                </span>
                {count > 0 && <span className="mt-1 block font-sans text-[0.78rem] text-gold">{fmt(dict.catalog.results, { count })}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function BlessingNote({ section, lang }: SectionProps) {
  const link = section.link as LinkConfig | undefined;
  return (
    <section className="container-page py-14 md:py-20">
      <div className="grid overflow-hidden rounded-md border border-rule bg-paper shadow-card md:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)]">
        <div className="cloth relative grid min-h-56 place-items-center p-10" style={clothStyle("oxblood")}>
          <div className="relative grid h-48 w-36 place-items-center border-2 border-gold-foil/80 md:h-60 md:w-44" style={{ borderRadius: "999px 999px 4px 4px" }}>
            <div className="absolute inset-2 border border-gold-foil/40" style={{ borderRadius: "999px 999px 2px 2px" }} />
            <OrthodoxCross variant="slavic" className="h-24 text-gold-foil md:h-28" />
          </div>
        </div>
        <div className="p-7 md:p-12">
          {section.eyebrow && <p className="eyebrow mb-3">{tr(section.eyebrow, lang)}</p>}
          <h2 className="text-[1.75rem] text-ink md:text-[2.2rem]">{tr(section.heading, lang)}</h2>
          <div className="mt-5 space-y-4 text-[1.1rem] leading-relaxed text-ink">
            {paragraphs(tr(section.text, lang)).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {section.blessing ? <p className="mt-6 text-ink-soft italic">{tr(section.blessing as Localized, lang)}</p> : null}
          {section.signature ? <p className="mt-1 font-display text-xl text-oxblood">{tr(section.signature as Localized, lang)}</p> : null}
          {link && (
            <Link href={href(lang, link.href)} className="mt-6 inline-flex items-center gap-1.5 text-oxblood hover:underline">
              {tr(link.label, lang)}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export function EventCard({ id, lang, compact }: { id: string; lang: string; compact?: boolean }) {
  const dict = getDictionary(lang);
  const e = splitEvents().upcoming.concat(splitEvents().past).find((x) => x.id === id);
  if (!e) return null;
  const start = eventParts(e.start, lang);
  const end = eventParts(e.end, lang);
  return (
    <article className="flex h-full gap-5 rounded-md border border-rule bg-paper p-5 md:p-6">
      <div className="flex w-16 shrink-0 flex-col items-center rounded-sm border border-gold-foil/50 bg-cream py-2 text-center">
        <span className="font-sans text-[0.75rem] tracking-[0.14em] text-oxblood uppercase">{start.month}</span>
        <span className="font-display text-[2rem] leading-none text-ink">{start.day}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="eyebrow !text-[0.7rem]">{dict.events.kinds[e.kind]}</p>
        <h3 className="mt-1 font-heading text-[1.18rem] leading-snug text-ink">{tr(e.title, lang)}</h3>
        <p className="mt-1 text-[0.95rem] text-ink-soft">
          {start.weekday}, {start.time}–{end.time} · {tr(e.place, lang)}
        </p>
        {!compact && <p className="mt-3 text-[1rem] text-ink">{tr(e.summary, lang)}</p>}
        {!compact && <p className="mt-2 text-[0.95rem] text-ink-soft">{tr(e.speaker, lang)}</p>}
        <div className="mt-auto pt-4">
          <RsvpLink event={e} label={dict.events.rsvp} note={dict.events.rsvpNote} />
        </div>
      </div>
    </article>
  );
}

export function EventsPreview({ section, lang }: SectionProps) {
  const dict = getDictionary(lang);
  const { upcoming } = splitEvents();
  const list = upcoming.slice(0, Number(section.limit ?? 3));
  return (
    <section className="border-y border-rule bg-parchment/50">
      <div className="container-page py-14 md:py-20">
        <SectionHeading lang={lang} eyebrow={section.eyebrow} heading={section.heading} link={{ href: href(lang, "events"), label: dict.home.allEvents }} />
        {list.length ? (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {list.map((e) => (
              <li key={e.id}>
                <EventCard id={e.id} lang={lang} compact />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-soft">{dict.events.noUpcoming}</p>
        )}
      </div>
    </section>
  );
}

export function PostCard({ slug, lang }: { slug: string; lang: string }) {
  const dict = getDictionary(lang);
  const p = posts.find((x) => x.slug === slug);
  if (!p) return null;
  return (
    <article className="group relative flex h-full flex-col border-t-2 border-oxblood bg-paper p-6 shadow-card">
      <p className="eyebrow">{dict.journal.kinds[p.kind]}</p>
      <h3 className="mt-2 font-heading text-[1.35rem] leading-snug text-ink">
        <Link href={postHref(lang, p.slug)} className="after:absolute after:inset-0 group-hover:text-oxblood">
          {tr(p.title, lang)}
        </Link>
      </h3>
      <p className="mt-3 text-[1.02rem] text-ink-soft">{tr(p.excerpt, lang)}</p>
      <p className="mt-auto pt-5 font-sans text-[0.85rem] text-ink-soft">
        {dateLong(p.date, lang)} · {tr(p.author, lang)}
      </p>
    </article>
  );
}

export function JournalPreview({ section, lang }: SectionProps) {
  const dict = getDictionary(lang);
  const list = [...posts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, Number(section.limit ?? 3));
  return (
    <section className="container-page py-14 md:py-20">
      <SectionHeading lang={lang} eyebrow={section.eyebrow} heading={section.heading} link={{ href: href(lang, "journal"), label: dict.home.allPosts }} />
      <ul className="grid gap-6 md:grid-cols-3">
        {list.map((p) => (
          <li key={p.slug}>
            <PostCard slug={p.slug} lang={lang} />
          </li>
        ))}
      </ul>
    </section>
  );
}

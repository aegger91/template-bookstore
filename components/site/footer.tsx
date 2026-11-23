import Link from "next/link";
import { Logo } from "@/components/orthodox/logo";
import { OrthodoxCross } from "@/components/orthodox/orthodox-cross";
import { navigation, site } from "@/lib/content";
import { getDictionary, tr } from "@/lib/i18n";
import { href } from "@/lib/paths";
import { NewsletterForm } from "./newsletter-form";

export function Footer({ lang }: { lang: string }) {
  const dict = getDictionary(lang);
  const a = site.contact.address;
  const showNewsletter = site.orthodoxConnect.enabled && site.orthodoxConnect.newsletter.enabled;

  return (
    <footer className="mt-24 bg-navy-deep text-paper/80">
      {showNewsletter && (
        <div className="border-b border-white/10">
          <div className="container-page grid items-center gap-6 py-12 md:grid-cols-[1.1fr_1fr] md:gap-12">
            <div>
              <h2 className="font-heading text-2xl text-paper md:text-3xl">{dict.footer.newsletterTitle}</h2>
              <p className="mt-2 max-w-prose text-paper/70">{dict.footer.newsletterText}</p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      )}
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Link href={href(lang)} className="inline-block">
            <Logo lang={lang} tone="paper" />
          </Link>
          <p className="max-w-xs text-paper/70">{tr(site.brand.tagline, lang)}</p>
          <address className="text-[0.95rem] leading-relaxed not-italic text-paper/70">
            {tr(a.line1, lang)}
            <br />
            {a.line2 ? (
              <>
                {tr(a.line2, lang)}
                <br />
              </>
            ) : null}
            {tr(a.city, lang)}, {a.region} {a.postalCode}
            <br />
            <a href={`tel:${site.contact.phone.replace(/[^\d+]/g, "")}`} className="hover:text-gold-soft">
              {site.contact.phone}
            </a>
            <br />
            <a href={`mailto:${site.contact.email}`} className="break-all hover:text-gold-soft">
              {site.contact.email}
            </a>
          </address>
        </div>
        {navigation.footer.map((col) => (
          <div key={col.id}>
            <h3 className="eyebrow mb-3 !text-gold-foil">{tr(col.title, lang)}</h3>
            <ul className="space-y-2 text-[0.98rem]">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={href(lang, l.href)} className="hover:text-gold-soft">
                    {tr(l.label, lang)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-sm text-paper/55 md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-2">
            <OrthodoxCross variant="slavic" className="h-4 text-gold-foil/70" />
            {tr(site.brand.sampleNotice, lang)} {dict.footer.rights}
          </p>
          <p>{dict.footer.builtWith}</p>
        </div>
      </div>
    </footer>
  );
}

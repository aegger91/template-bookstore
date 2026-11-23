import type { Metadata } from "next";
import "./fonts";
import "./globals.css";
import { OrthodoxCross } from "@/components/orthodox/orthodox-cross";
import { site } from "@/lib/content";
import { getDictionary, tr } from "@/lib/i18n";
import { tokensCss } from "@/lib/tokens";

export const metadata: Metadata = { title: "404" };

export default function GlobalNotFound() {
  return (
    <html lang={site.defaultLanguage}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: tokensCss() }} />
      </head>
      <body className="grid min-h-dvh place-items-center bg-cream p-8 text-center">
        <div className="max-w-lg space-y-8">
          <OrthodoxCross variant="slavic" className="mx-auto h-14 text-oxblood" />
          {site.languages.map((l) => {
            const d = getDictionary(l.code);
            return (
              <div key={l.code} lang={l.code} dir={l.dir} className="space-y-2">
                <h1 className="font-heading text-2xl text-ink">{d.notFound.title}</h1>
                <p className="text-ink-soft">{d.notFound.text}</p>
                <a href={`/${l.code}/`} className="text-oxblood underline underline-offset-4">
                  {d.notFound.back}
                </a>
              </div>
            );
          })}
          <p className="text-sm text-ink-soft">{tr(site.brand.name, site.defaultLanguage)}</p>
        </div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { OrthodoxCross } from "@/components/orthodox/orthodox-cross";
import { site } from "@/lib/content";
import { tr } from "@/lib/i18n";

export const metadata: Metadata = {
  title: tr(site.brand.name, site.defaultLanguage),
  icons: { icon: "/brand/favicon.svg" },
};

const codes = site.languages.map((l) => l.code);

/** Static hosts cannot redirect by Accept-Language, so the root page picks a language in the browser. */
const script = `(function(){var c=${JSON.stringify(codes)},d=${JSON.stringify(site.defaultLanguage)};var p=(navigator.languages||[navigator.language||""]).map(function(x){return String(x).slice(0,2).toLowerCase()});var l=d;for(var i=0;i<p.length;i++){if(c.indexOf(p[i])>-1){l=p[i];break}}location.replace("/"+l+"/")})();`;

export default function RootPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-cream p-8 text-center">
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <noscript>
        <meta httpEquiv="refresh" content={`0; url=/${site.defaultLanguage}/`} />
      </noscript>
      <div className="space-y-6">
        <OrthodoxCross variant="slavic" className="mx-auto h-14 text-oxblood" />
        <h1 className="font-heading text-3xl text-ink">{tr(site.brand.name, site.defaultLanguage)}</h1>
        <ul className="flex flex-wrap justify-center gap-3">
          {site.languages.map((l) => (
            <li key={l.code}>
              <a href={`/${l.code}/`} lang={l.code} className="rounded-full border border-rule px-4 py-1.5 text-ink hover:border-oxblood">
                {l.nativeLabel}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

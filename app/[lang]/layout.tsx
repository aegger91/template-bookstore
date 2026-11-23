import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../fonts";
import "../globals.css";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { SiteProvider } from "@/components/site/site-context";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getLanguage, languageCodes, site } from "@/lib/content";
import { getDictionary, tr } from "@/lib/i18n";
import { tokensCss } from "@/lib/tokens";

export const dynamicParams = false;

export function generateStaticParams() {
  return languageCodes.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const name = tr(site.brand.name, lang);
  return {
    title: { default: name, template: `%s · ${name}` },
    description: tr(site.brand.tagline, lang),
    icons: { icon: "/brand/favicon.svg" },
    alternates: {
      languages: Object.fromEntries(languageCodes.map((c) => [c, `/${c}/`])),
    },
  };
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!languageCodes.includes(lang)) notFound();
  const language = getLanguage(lang);
  const dict = getDictionary(lang);
  const displayVar = `var(--tk-font-display-${language.displayFont ?? "default"})`;

  return (
    <html lang={lang} dir={language.dir} style={{ ["--display-font" as string]: displayVar }} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: tokensCss() }} />
      </head>
      <body className="min-h-dvh antialiased">
        <SiteProvider value={{ lang, language, dict }}>
          <TooltipProvider>
            <Header />
            <main id="main">{children}</main>
            <Footer lang={lang} />
            <Toaster position="bottom-center" />
          </TooltipProvider>
        </SiteProvider>
      </body>
    </html>
  );
}

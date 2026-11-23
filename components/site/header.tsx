"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { Logo } from "@/components/orthodox/logo";
import { Pictogram } from "@/components/orthodox/pictogram";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { activeSeasonId, categories, categoryGroups, navigation, seasonById, site } from "@/lib/content";
import { tr } from "@/lib/i18n";
import { catalogHref, categoryHref, href } from "@/lib/paths";
import { cartStore, useHydrated } from "@/lib/store";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./language-switcher";
import { SearchDialog } from "./search-dialog";
import { useSite } from "./site-context";

function useCondensed() {
  const [condensed, setCondensed] = useState(false);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setCondensed((c) => (c ? y > 8 : y > 64));
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return condensed;
}

function CartButton() {
  const { lang, dict } = useSite();
  const hydrated = useHydrated();
  const cart = cartStore.useStore();
  const count = hydrated ? cart.lines.reduce((n, l) => n + l.qty, 0) : 0;
  return (
    <Link
      href={href(lang, "cart")}
      className="relative grid size-10 place-items-center rounded-full text-ink transition-colors hover:bg-parchment"
      aria-label={`${dict.common.cart}${count ? ` (${count})` : ""}`}
    >
      <ShoppingBag className="size-[1.3rem]" strokeWidth={1.6} />
      {count > 0 && (
        <span className="absolute -end-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-oxblood px-1 font-sans text-[0.7rem] leading-5 text-paper">
          {count}
        </span>
      )}
    </Link>
  );
}

function MegaMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang, dict } = useSite();
  const season = seasonById(activeSeasonId());
  return (
    <div
      className={cn(
        "absolute inset-x-0 top-full origin-top border-y border-rule bg-paper shadow-card transition-all duration-200",
        open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
      )}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="container-page grid gap-10 py-8 lg:grid-cols-[1fr_1fr_0.9fr_1.1fr]">
        {categoryGroups.map((g) => (
          <div key={g.id}>
            <p className="eyebrow mb-3">{tr(g.title, lang)}</p>
            <ul className="space-y-1">
              {categories
                .filter((c) => c.group === g.id)
                .map((c) => (
                  <li key={c.id}>
                    <Link
                      href={categoryHref(lang, c.id)}
                      onClick={onClose}
                      className="group flex items-center gap-3 rounded-md py-1.5 text-[1.02rem] text-ink transition-colors hover:text-oxblood"
                    >
                      <Pictogram name={c.pictogram} className="h-6 w-6 text-gold transition-colors group-hover:text-oxblood" />
                      {tr(c.title, lang)}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
        {season && (
          <Link
            href={catalogHref(lang, `season=${season.id}`)}
            onClick={onClose}
            className="cloth group relative flex flex-col justify-end overflow-hidden rounded-md p-6 text-paper"
            style={{ ["--cloth-a" as string]: "var(--tk-color-oxblood)", ["--cloth-b" as string]: "var(--tk-color-oxbloodDeep)" }}
          >
            <span className="absolute inset-3 rounded-sm border border-gold-foil/40" />
            <span className="eyebrow relative !text-gold-soft">{dict.nav.featuredSeason}</span>
            <span className="relative mt-2 font-heading text-2xl">{tr(season.title, lang)}</span>
            <span className="relative mt-1 text-sm text-paper/75">{tr(season.dates, lang)}</span>
            <span className="relative mt-4 text-sm text-gold-soft underline-offset-4 group-hover:underline">
              {dict.nav.shopTheCollection}
            </span>
          </Link>
        )}
      </div>
      <div className="border-t border-rule bg-cream/60">
        <div className="container-page flex items-center justify-between py-3 text-sm">
          <Link href={catalogHref(lang)} onClick={onClose} className="font-medium text-oxblood hover:underline">
            {dict.nav.allItems}
          </Link>
          <span className="text-ink-soft">{tr(site.brand.sampleNotice, lang)}</span>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const { lang, dict, language } = useSite();
  const pathname = usePathname();
  const condensed = useCondensed();
  const [megaOpen, setMegaOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMegaOpen(false);
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!megaOpen) return;
    const onDown = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMegaOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMegaOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [megaOpen]);

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 160);
  };

  const isActive = (path: string) => pathname?.startsWith(href(lang, path));

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded bg-ink px-3 py-2 text-paper focus:not-sr-only focus:fixed focus:start-3 focus:top-3"
      >
        {dict.common.skipToContent}
      </a>
      <header
        ref={headerRef}
        data-condensed={condensed}
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow] duration-300",
          condensed ? "bg-paper/95 shadow-[0_1px_0_var(--tk-color-rule),0_8px_24px_-18px_rgba(43,35,32,.5)] backdrop-blur" : "bg-cream",
        )}
      >
        <div
          className={cn(
            "hidden overflow-hidden border-b border-rule/70 bg-navy text-paper/85 transition-[max-height,opacity] duration-300 md:block",
            condensed ? "max-h-0 opacity-0" : "max-h-10 opacity-100",
          )}
        >
          <div className="container-page flex h-9 items-center justify-between gap-6 font-sans text-[0.82rem]">
            <p className="truncate">{tr(site.brand.sampleNotice, lang)}</p>
            <nav className="flex shrink-0 items-center gap-5" aria-label="Utility">
              {navigation.utility.map((n) => (
                <Link key={n.id} href={href(lang, n.href)} className="hover:text-gold-soft">
                  {tr(n.label, lang)}
                </Link>
              ))}
              <LanguageSwitcher tone="dark" />
            </nav>
          </div>
        </div>

        <div className="container-page">
          <div
            className={cn(
              "flex items-center gap-3 transition-[height] duration-300 lg:gap-8",
              condensed ? "h-14 md:h-16" : "h-16 md:h-[4.5rem]",
            )}
          >
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <button
                  className="-ms-2 grid size-10 place-items-center rounded-full text-ink hover:bg-parchment lg:hidden"
                  aria-label={dict.common.menu}
                >
                  <Menu className="size-5" strokeWidth={1.6} />
                </button>
              </SheetTrigger>
              <SheetContent side={language.dir === "rtl" ? "right" : "left"} className="w-[88vw] max-w-sm gap-0 overflow-y-auto bg-paper p-0">
                <SheetHeader className="border-b border-rule px-5 py-4">
                  <SheetTitle asChild>
                    <div>
                      <Logo lang={lang} condensed />
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <nav className="px-5 py-4" aria-label={dict.common.menu}>
                  <p className="eyebrow mb-2">{dict.nav.browseByCategory}</p>
                  <ul className="mb-6 grid grid-cols-1 gap-0.5">
                    <li>
                      <Link href={catalogHref(lang)} className="block py-2 text-lg font-medium text-oxblood">
                        {dict.nav.allItems}
                      </Link>
                    </li>
                    {categories.map((c) => (
                      <li key={c.id}>
                        <Link href={categoryHref(lang, c.id)} className="flex items-center gap-3 py-1.5 text-[1.05rem] text-ink">
                          <Pictogram name={c.pictogram} className="h-5 w-5 text-gold" />
                          {tr(c.title, lang)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <ul className="space-y-1 border-t border-rule pt-4">
                    {navigation.header
                      .filter((n) => n.kind !== "mega")
                      .map((n) => (
                        <li key={n.id}>
                          <Link href={href(lang, n.href)} className="block py-1.5 font-heading text-xl text-ink">
                            {tr(n.label, lang)}
                          </Link>
                        </li>
                      ))}
                  </ul>
                  <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-rule pt-4 text-[0.98rem] text-ink-soft">
                    {navigation.utility.map((n) => (
                      <li key={n.id}>
                        <Link href={href(lang, n.href)} className="block py-1">
                          {tr(n.label, lang)}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link href={href(lang, "account")} className="block py-1">
                        {dict.common.account}
                      </Link>
                    </li>
                    <li>
                      <Link href={href(lang, "wishlist")} className="block py-1">
                        {dict.common.wishlist}
                      </Link>
                    </li>
                  </ul>
                  <div className="mt-6 border-t border-rule pt-4">
                    <p className="eyebrow mb-2">{dict.common.language}</p>
                    <LanguageSwitcher tone="light" variant="list" />
                  </div>
                  <p className="mt-6 text-sm text-ink-soft">{tr(site.brand.sampleNotice, lang)}</p>
                </nav>
              </SheetContent>
            </Sheet>

            <Link href={href(lang)} className="flex min-w-0 items-center" aria-label={tr(site.brand.name, lang)}>
              <Logo lang={lang} condensed={condensed} />
            </Link>

            <nav className="ms-auto hidden items-center gap-1 lg:flex" aria-label="Main">
              {navigation.header.map((n) =>
                n.kind === "mega" ? (
                  <div key={n.id} onMouseEnter={openMega} onMouseLeave={scheduleClose}>
                    <button
                      className={cn(
                        "flex items-center gap-1 rounded-md px-3 py-2 text-[1.02rem] text-ink transition-colors hover:text-oxblood",
                        (megaOpen || isActive(n.href)) && "text-oxblood",
                      )}
                      aria-expanded={megaOpen}
                      aria-haspopup="true"
                      onClick={() => setMegaOpen((o) => !o)}
                    >
                      {tr(n.label, lang)}
                      <ChevronDown className={cn("size-4 transition-transform", megaOpen && "rotate-180")} />
                    </button>
                  </div>
                ) : (
                  <Link
                    key={n.id}
                    href={href(lang, n.href)}
                    className={cn(
                      "rounded-md px-3 py-2 text-[1.02rem] whitespace-nowrap text-ink transition-colors hover:text-oxblood",
                      isActive(n.href) && "text-oxblood",
                    )}
                  >
                    {tr(n.label, lang)}
                  </Link>
                ),
              )}
            </nav>

            <div className="ms-auto flex items-center gap-0.5 lg:ms-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="grid size-10 place-items-center rounded-full text-ink hover:bg-parchment"
                aria-label={dict.common.search}
              >
                <Search className="size-[1.2rem]" strokeWidth={1.6} />
              </button>
              <Link
                href={href(lang, "wishlist")}
                className="hidden size-10 place-items-center rounded-full text-ink hover:bg-parchment sm:grid"
                aria-label={dict.common.wishlist}
              >
                <Heart className="size-[1.2rem]" strokeWidth={1.6} />
              </Link>
              <Link
                href={href(lang, "account")}
                className="hidden size-10 place-items-center rounded-full text-ink hover:bg-parchment sm:grid"
                aria-label={dict.common.account}
              >
                <User className="size-[1.2rem]" strokeWidth={1.6} />
              </Link>
              <CartButton />
            </div>
          </div>
        </div>
        <div className="hidden lg:block" onMouseEnter={openMega} onMouseLeave={scheduleClose}>
          <MegaMenu open={megaOpen} onClose={() => setMegaOpen(false)} />
        </div>
        {!condensed && <div className="h-px bg-rule" />}
      </header>
      <div aria-hidden className="h-[4.0625rem] md:h-[6.875rem]" />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

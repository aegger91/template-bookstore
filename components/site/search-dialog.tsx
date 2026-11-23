"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ProductArt } from "@/components/orthodox/product-art";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { searchProducts } from "@/lib/search";
import { tr } from "@/lib/i18n";
import { catalogHref, productHref } from "@/lib/paths";
import { personById } from "@/lib/content";
import { useSite } from "./site-context";

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { lang, dict } = useSite();
  const router = useRouter();
  const [q, setQ] = useState("");
  const results = useMemo(() => (q.trim().length >= 2 ? searchProducts(q, lang).slice(0, 6) : []), [q, lang]);

  const go = () => {
    if (!q.trim()) return;
    onOpenChange(false);
    router.push(catalogHref(lang, `q=${encodeURIComponent(q.trim())}`));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[12%] max-w-[calc(100%-1.5rem)] translate-y-0 gap-0 overflow-hidden bg-paper p-0 sm:max-w-xl" showCloseButton={false}>
        <DialogTitle className="sr-only">{dict.common.search}</DialogTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            go();
          }}
          className="flex items-center gap-3 border-b border-rule px-4"
          role="search"
        >
          <Search className="size-5 shrink-0 text-gold" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={dict.common.searchPlaceholder}
            className="h-14 w-full min-w-0 bg-transparent text-lg text-ink outline-none placeholder:text-ink-soft/60"
            aria-label={dict.common.search}
          />
          <kbd className="hidden rounded border border-rule px-1.5 font-sans text-xs text-ink-soft sm:block">Esc</kbd>
        </form>
        <div className="max-h-[60vh] overflow-y-auto">
          {q.trim().length < 2 ? (
            <p className="px-5 py-6 text-ink-soft">{dict.common.searchHint}</p>
          ) : results.length === 0 ? (
            <p className="px-5 py-6 text-ink-soft">{dict.common.searchNoResults}</p>
          ) : (
            <ul className="divide-y divide-rule/60">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={productHref(lang, p.slug)}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-parchment/60"
                  >
                    <span className="h-16 w-12 shrink-0">
                      <ProductArt product={p} lang={lang} />
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-2 font-heading text-[1.05rem] leading-snug text-ink">{tr(p.title, lang)}</span>
                      <span className="block truncate text-sm text-ink-soft">
                        {p.authors.map((a) => tr(personById(a)?.name, lang)).join(", ")}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        {q.trim().length >= 2 && (
          <button onClick={go} className="w-full border-t border-rule bg-cream px-5 py-3 text-start text-oxblood hover:underline">
            {dict.common.searchAll}
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}

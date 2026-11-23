"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { site } from "@/lib/content";
import { cn } from "@/lib/utils";
import { useSite } from "./site-context";

function useSwap() {
  const pathname = usePathname() ?? "/";
  const { lang } = useSite();
  return (code: string) => {
    const rest = pathname.replace(new RegExp(`^/${lang}(?=/|$)`), "");
    return `/${code}${rest || "/"}`;
  };
}

export function LanguageSwitcher({ tone = "light", variant = "menu" }: { tone?: "dark" | "light"; variant?: "menu" | "list" }) {
  const { lang, dict } = useSite();
  const swap = useSwap();
  const current = site.languages.find((l) => l.code === lang);

  if (variant === "list") {
    return (
      <ul className="flex flex-wrap gap-2">
        {site.languages.map((l) => (
          <li key={l.code}>
            <Link
              href={swap(l.code)}
              hrefLang={l.code}
              lang={l.code}
              className={cn(
                "inline-block rounded-full border px-3 py-1 text-[0.95rem]",
                l.code === lang ? "border-oxblood bg-oxblood text-paper" : "border-rule text-ink hover:border-oxblood",
              )}
              aria-current={l.code === lang ? "true" : undefined}
            >
              {l.nativeLabel}
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-1.5 rounded px-1.5 py-0.5 outline-none",
          tone === "dark" ? "text-paper/85 hover:text-gold-soft" : "text-ink hover:text-oxblood",
        )}
        aria-label={dict.common.language}
      >
        <Globe className="size-3.5" />
        {current?.nativeLabel}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36 bg-paper">
        {site.languages.map((l) => (
          <DropdownMenuItem key={l.code} asChild>
            <Link href={swap(l.code)} hrefLang={l.code} lang={l.code} className={cn(l.code === lang && "font-semibold text-oxblood")}>
              {l.nativeLabel}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


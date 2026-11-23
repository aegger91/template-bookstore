"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { OrthodoxCross } from "@/components/orthodox/orthodox-cross";
import { ProductCard } from "@/components/shop/product-card";
import { activeSeasonId, productById } from "@/lib/content";
import { clothStyle } from "@/lib/tokens";
import { cn } from "@/lib/utils";

interface SeasonData {
  id: string;
  cloth: string;
  title: string;
  dates: string;
  intro: string;
  href: string;
  productIds: string[];
}

export function FeastTabs({ seasons, initial, nowLabel, shopLabel }: { seasons: SeasonData[]; initial: string; nowLabel: string; shopLabel: string }) {
  const [current, setCurrent] = useState(initial);
  const [now, setNow] = useState(initial);

  useEffect(() => {
    const today = activeSeasonId(new Date());
    if (today !== initial) {
      setNow(today);
      setCurrent(today);
    }
  }, [initial]);

  const s = seasons.find((x) => x.id === current) ?? seasons[0];
  const items = s.productIds.map(productById).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div>
      <div role="tablist" className="mb-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {seasons.map((x) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={x.id === current}
            onClick={() => setCurrent(x.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-[1rem] transition-colors",
              x.id === current ? "border-ink bg-ink text-paper" : "border-rule bg-paper text-ink hover:border-ink/50",
            )}
          >
            {x.title}
            {x.id === now && (
              <span className={cn("rounded-full px-1.5 font-sans text-[0.68rem] tracking-wide uppercase", x.id === current ? "bg-gold-foil text-ink" : "bg-parchment text-oxblood")}>
                {nowLabel}
              </span>
            )}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] lg:gap-10">
        <div className="cloth relative flex flex-col overflow-hidden rounded-md p-7 text-paper shadow-book md:p-8" style={clothStyle(s.cloth)}>
          <span className="absolute inset-3 rounded-sm border border-gold-foil/40" />
          <OrthodoxCross variant="byzantine" className="relative h-9 text-gold-foil" />
          <h3 className="foil-text relative mt-6 font-heading text-[2rem] leading-tight">{s.title}</h3>
          <p className="relative mt-1 text-[0.95rem] text-gold-soft/85">{s.dates}</p>
          <p className="relative mt-4 text-[1.05rem] leading-relaxed text-paper/85">{s.intro}</p>
          <Link href={s.href} className="relative mt-6 inline-flex items-center gap-2 self-start rounded-md bg-gold-foil px-4 py-2 text-navy-deep hover:bg-gold-soft lg:mt-auto">
            {shopLabel}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-5">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

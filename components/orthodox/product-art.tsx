import { personById } from "@/lib/content";
import { tr } from "@/lib/i18n";
import { clothStyle } from "@/lib/tokens";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { OrthodoxCross } from "./orthodox-cross";
import { Pictogram } from "./pictogram";

export type ArtView = "front" | "back" | "spine";

function starPoints(cx: number, cy: number, outer: number, inner: number) {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

function EightPointStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden direction="ltr">
      <polygon points={starPoints(50, 50, 50, 22)} fill="currentColor" />
    </svg>
  );
}

function Vine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={className} aria-hidden direction="ltr" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 20c14-14 26 14 40 0s26 14 40 0 26 14 32 4" />
      <path d="M24 13c-2-6 4-9 6-5M64 13c-2-6 4-9 6-5M44 27c2 6-4 9-6 5M84 27c2 6-4 9-6 5" />
    </svg>
  );
}

function Emblem({ name, className }: { name?: string; className?: string }) {
  switch (name) {
    case "slavic-cross":
      return <OrthodoxCross variant="slavic" className={className} />;
    case "byzantine-cross":
      return <OrthodoxCross variant="byzantine" className={className} />;
    case "icxc":
      return <OrthodoxCross variant="icxc-nika" className={className} />;
    case "star":
      return <EightPointStar className={className} />;
    case "vine":
      return <Vine className={cn("!h-auto w-[70%]", className)} />;
    case "lampada":
    case "halo":
    case "prayer-rope":
      return <Pictogram name={name} className={className} />;
    default:
      return null;
  }
}

function SampleTag({ light }: { light?: boolean }) {
  return (
    <span
      className={cn(
        "absolute inset-x-0 bottom-[3.5%] text-center font-sans text-[3.4cqw] tracking-[0.18em] uppercase",
        light ? "text-ink/45" : "text-gold-soft/55",
      )}
    >
      Sample
    </span>
  );
}

function BookCover({ product, lang, view }: { product: Product; lang: string; view: ArtView }) {
  const { cloth = "oxblood", design = "frame", emblem } = product.art;
  const light = cloth === "cream";
  const title = tr(product.title, lang).replace(/\s*\((sample[^)]*|образец[^)]*|условн[^)]*|δείγμα|ενδεικτικ[^)]*)\)\s*$/i, "");
  const author = product.authors.map((id) => tr(personById(id)?.name, lang)).join(", ");
  const ink = light ? "text-oxblood" : "foil-text";
  const emblemColor = light ? "text-oxblood" : "text-gold-foil";

  if (view === "spine") {
    return (
      <div className="grid size-full place-items-center bg-parchment">
        <div className="cloth relative flex h-[92%] w-[22%] flex-col items-center justify-between rounded-[2px] py-[6%] shadow-book" style={clothStyle(cloth)}>
          <span className="block h-px w-[70%] bg-gold-foil/70" />
          <span
            className={cn("max-h-full overflow-hidden font-heading text-[5.5cqw] leading-none", ink)}
            style={{ writingMode: "vertical-rl" }}
            data-overflow-ok
          >
            {title.length > 28 ? `${title.slice(0, 26)}…` : title}
          </span>
          <Emblem name={emblem} className={cn("h-[7cqw]", emblemColor)} />
          <span className="block h-px w-[70%] bg-gold-foil/70" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid size-full place-items-center">
      <div
        className="cloth @container relative aspect-[2/3] h-auto max-h-full w-full max-w-full overflow-hidden rounded-[2px_5px_5px_2px] shadow-book"
        style={clothStyle(cloth)}
        data-overflow-ok
      >
        <div className="absolute inset-y-0 start-0 w-[6%] bg-gradient-to-r from-black/25 to-transparent" />
        <div className="absolute inset-y-0 start-[6%] w-px bg-white/10" />

        {view === "back" ? (
          <div className="absolute inset-[11%] flex flex-col items-center gap-[4cqw] pt-[6cqw]">
            <Emblem name={emblem} className={cn("h-[12cqw]", emblemColor)} />
            {[92, 84, 88, 70, 90, 60].map((w, i) => (
              <span key={i} className={cn("block h-[1.6cqw] rounded-full", light ? "bg-ink/15" : "bg-gold-soft/20")} style={{ width: `${w}%` }} />
            ))}
            <span className={cn("mt-auto self-end border px-[2cqw] py-[1cqw] font-sans text-[3cqw]", light ? "border-ink/30 text-ink/50" : "border-gold-soft/40 text-gold-soft/60")}>
              ISBN 000-0 SAMPLE
            </span>
          </div>
        ) : (
          <>
            {design === "frame" && (
              <div className="absolute inset-[7%] border border-gold-foil/80 outline outline-1 outline-offset-[3px] outline-gold-foil/50" />
            )}
            {design === "band" && (
              <>
                <div className="absolute inset-x-0 top-[9%] h-[2.2%] bg-gold-foil/80" />
                <div className="absolute inset-x-0 top-[12.5%] h-[0.6%] bg-gold-foil/60" />
                <div className="absolute inset-x-0 bottom-[12.5%] h-[0.6%] bg-gold-foil/60" />
                <div className="absolute inset-x-0 bottom-[9%] h-[2.2%] bg-gold-foil/80" />
              </>
            )}
            {design === "panel" && (
              <div className="absolute inset-x-[12%] top-[10%] bottom-[30%] rounded-[1px] border border-gold-foil/70 bg-black/15 shadow-[inset_0_2px_6px_rgba(0,0,0,.35)]" />
            )}
            {design === "gospel" && (
              <>
                <div className="absolute inset-[5%] border-2 border-gold-foil/80" />
                {["top-[5%] start-[5%]", "top-[5%] end-[5%]", "bottom-[5%] start-[5%]", "bottom-[5%] end-[5%]"].map((pos) => (
                  <div key={pos} className={cn("absolute grid size-[17%] place-items-center bg-gold-foil/85", pos)}>
                    <EightPointStar className="size-[55%] text-oxblood-deep/80" />
                  </div>
                ))}
              </>
            )}
            {design === "picture" && (
              <div className="absolute inset-x-[8%] top-[34%] bottom-[18%] overflow-hidden rounded-[2px] bg-gradient-to-b from-navy-deep/80 to-navy/40">
                <svg viewBox="0 0 100 60" className="absolute inset-x-0 bottom-0 w-full" preserveAspectRatio="none" aria-hidden>
                  <path d="M0 60V42c15-10 30-12 50-4s35 6 50-2v24Z" fill="rgba(255,255,255,.14)" />
                  <path d="M0 60V50c20-8 40-6 60 0s30 2 40-2v12Z" fill="rgba(0,0,0,.25)" />
                </svg>
              </div>
            )}

            <div className="absolute inset-[13%] flex flex-col items-center text-center">
              <h3
                className={cn(
                  "line-clamp-4 max-w-full font-heading leading-[1.22] font-medium break-words hyphens-auto",
                  ink,
                  title.length > 38 ? "text-[6.2cqw]" : title.length > 22 ? "text-[7.6cqw]" : "text-[9.2cqw]",
                  design === "picture" && "text-[7cqw]",
                )}
              >
                {title}
              </h3>
              <div className={cn("my-auto grid place-items-center", design === "picture" && "mt-[10%]")}>
                {design === "medallion" ? (
                  <div className="grid size-[34cqw] place-items-center rounded-full border border-gold-foil/80 outline outline-1 outline-offset-2 outline-gold-foil/40">
                    <Emblem name={emblem} className={cn("h-[18cqw]", emblemColor)} />
                  </div>
                ) : (
                  <Emblem name={emblem} className={cn(design === "gospel" ? "h-[26cqw]" : "h-[17cqw]", design === "picture" ? "text-gold-soft" : emblemColor)} />
                )}
              </div>
              {author ? (
                <p className={cn("line-clamp-2 max-w-full font-sans text-[4.2cqw] tracking-[0.08em] uppercase", light ? "text-ink/70" : "text-gold-soft/85")}>
                  {author.length > 40 ? author.split(" (")[0] : author}
                </p>
              ) : null}
            </div>
          </>
        )}
        <SampleTag light={light} />
      </div>
    </div>
  );
}

function IconArt({ subject }: { subject: Product["art"]["subject"] }) {
  const left = subject === "christ" ? "IC" : subject === "theotokos" ? "ΜΡ" : "Ο ΑΓΙΟΣ";
  const right = subject === "christ" ? "XC" : subject === "theotokos" ? "ΘΥ" : "ΝΙΚΟΛΑΟΣ";
  const small = subject === "nicholas";
  return (
    <svg viewBox="0 0 100 125" className="h-full max-h-full w-auto max-w-full drop-shadow-[0_14px_18px_rgba(43,35,32,.35)]" direction="ltr" role="img" aria-label="Icon placeholder">
      <defs>
        <linearGradient id={`wood-${subject}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#8a5a32" />
          <stop offset="1" stopColor="#5a3a1e" />
        </linearGradient>
        <linearGradient id={`gold-${subject}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e6cc86" />
          <stop offset=".55" stopColor="#c9a55e" />
          <stop offset="1" stopColor="#a8823c" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="125" rx="2" fill={`url(#wood-${subject})`} />
      <rect x="7" y="7" width="86" height="111" fill="#3c2614" opacity=".35" />
      <rect x="8" y="8" width="84" height="109" fill={`url(#gold-${subject})`} />
      <rect x="11" y="11" width="78" height="103" fill="none" stroke="#7a2330" strokeWidth=".8" />

      <circle cx="50" cy="42" r="19" fill="#d8b866" stroke="#7a5a22" strokeWidth=".9" />
      <circle cx="50" cy="42" r="13.5" fill="none" stroke="#7a5a22" strokeWidth=".4" opacity=".6" />
      {subject === "christ" && (
        <g fill="#7a2330">
          <path d="M46.5 23.2h7l-1 9.5h-5Z" />
          <path d="M31.2 38.5v7l9.5-1v-5Z" />
          <path d="M68.8 38.5v7l-9.5-1v-5Z" />
        </g>
      )}

      {subject === "theotokos" && (
        <g>
          <path d="M22 117c1-30 10-52 28-58 18 6 27 28 28 58Z" fill="#5a1a22" />
          <path d="M22 117c1-30 10-52 28-58 18 6 27 28 28 58" fill="none" stroke="#c9a55e" strokeWidth="1.2" />
          {[
            [50, 66],
            [33, 86],
            [67, 86],
          ].map(([x, y]) => (
            <polygon key={`${x}-${y}`} points={starPoints(x, y, 3.2, 1.4)} fill="#e6cc86" />
          ))}
        </g>
      )}
      {subject === "christ" && (
        <g>
          <path d="M24 117c1-30 10-52 26-58 16 6 25 28 26 58Z" fill="#7a2a24" />
          <path d="M50 59c10 6 20 22 24 58H56c-2-24-4-40-6-58Z" fill="#1f3554" />
          <path d="M50 64v28" stroke="#c9a55e" strokeWidth="1.4" />
        </g>
      )}
      {subject === "nicholas" && (
        <g>
          <path d="M22 117c1-30 10-52 28-58 18 6 27 28 28 58Z" fill="#6b2a22" />
          <path d="M36 66c8 8 20 8 28 0l3 9c-10 8-24 8-34 0Z" fill="#f2ead8" />
          <path d="M46 72h8v45h-8Z" fill="#f2ead8" />
          {[
            [39, 71],
            [61, 71],
            [50, 88],
            [50, 104],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`} fill="#1d1b1a">
              <rect x={x - 0.8} y={y - 3} width="1.6" height="6" />
              <rect x={x - 3} y={y - 0.8} width="6" height="1.6" />
            </g>
          ))}
        </g>
      )}

      <g fill="#7a2330" fontFamily="var(--tk-font-heading)" fontWeight="600" textAnchor="middle" style={{ direction: "ltr" }}>
        <text x={small ? 20 : 24} y={small ? 30 : 36} fontSize={small ? 4.4 : 9}>
          {left}
        </text>
        <text x={small ? 80 : 76} y={small ? 30 : 36} fontSize={small ? 4.4 : 9}>
          {right}
        </text>
        {!small && (
          <>
            <path d="M18 26.5q6-2.5 12 0" stroke="#7a2330" strokeWidth="1" fill="none" />
            <path d="M70 26.5q6-2.5 12 0" stroke="#7a2330" strokeWidth="1" fill="none" />
          </>
        )}
      </g>
      <text x="50" y="112" textAnchor="middle" fontSize="3.6" fill="#f5eedf" fontFamily="var(--tk-font-ui)" letterSpacing=".8" opacity=".85">
        ICON PHOTO PLACEHOLDER
      </text>
    </svg>
  );
}

function PrayerRopeArt({ knots = 33 }: { knots?: number }) {
  const n = Math.min(knots, 60);
  const items = [];
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const a = -Math.PI / 2 + 0.22 + t * (Math.PI * 2 - 0.44);
    const x = 50 + 30 * Math.cos(a + Math.PI);
    const y = 50 + 34 * Math.sin(a + Math.PI);
    const bead = knots >= 100 ? i % Math.round(n / 4) === 0 && i > 0 : false;
    items.push(<circle key={i} cx={x} cy={y} r={bead ? 3.2 : 2.3} fill={bead ? "#7a2330" : "#1d1b1a"} />);
  }
  return (
    <svg viewBox="0 0 100 125" className="h-full w-auto max-w-full" direction="ltr" role="img" aria-label="Prayer rope placeholder">
      {items}
      <g fill="#1d1b1a">
        <circle cx="50" cy="88" r="2.6" />
        <circle cx="50" cy="93.5" r="2.6" />
        <circle cx="50" cy="99" r="2.6" />
        <circle cx="44.5" cy="93.5" r="2.6" />
        <circle cx="55.5" cy="93.5" r="2.6" />
      </g>
      <path d="M50 101v4" stroke="#1d1b1a" strokeWidth="2.6" />
      <path d="M47 105l-2 15M50 105v16M53 105l2 15M48.5 105l-1 15.5M51.5 105l1 15.5" stroke="#1d1b1a" strokeWidth="1" />
    </svg>
  );
}

function Goods({ kind, lang, product }: { kind: Product["art"]["kind"]; lang: string; product: Product }) {
  if (kind === "candles") {
    return (
      <svg viewBox="0 0 100 125" className="h-full w-auto max-w-full" direction="ltr" aria-hidden>
        {[30, 50, 70].map((x, i) => (
          <g key={x}>
            <rect x={x - 3.5} y={30 + i * 4} width="7" height={85 - i * 4} rx="1.5" fill="#d9a743" />
            <rect x={x - 3.5} y={30 + i * 4} width="2" height={85 - i * 4} fill="#f0cf7a" opacity=".6" />
            <path d={`M${x} ${17 + i * 4}c-4 5-4 9 0 12 4-3 4-7 0-12Z`} fill="#f2b84b" />
            <path d={`M${x} ${21 + i * 4}c-2 3-2 5 0 7 2-2 2-4 0-7Z`} fill="#fff3c4" />
          </g>
        ))}
        <rect x="15" y="112" width="70" height="4" rx="2" fill="#5e5049" opacity=".35" />
      </svg>
    );
  }
  if (kind === "incense") {
    return (
      <svg viewBox="0 0 100 125" className="h-full w-auto max-w-full" direction="ltr" aria-hidden>
        <ellipse cx="50" cy="104" rx="30" ry="7" fill="#5e5049" opacity=".25" />
        <rect x="22" y="48" width="56" height="56" rx="4" fill="#6b1e28" />
        <rect x="22" y="40" width="56" height="12" rx="3" fill="#a98238" />
        <rect x="30" y="62" width="40" height="26" rx="2" fill="#f5eedf" />
        <OrthodoxCross variant="slavic" x={44} y={64} width={12} height={20} fill="#6b1e28" />
        {[[40, 30], [52, 24], [61, 32]].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="3.5" fill="#d9a743" opacity=".8" />
        ))}
      </svg>
    );
  }
  if (kind === "bookmarks") {
    return (
      <svg viewBox="0 0 100 125" className="h-full w-auto max-w-full" direction="ltr" aria-hidden>
        {[
          ["#6b1e28", 30],
          ["#1e2942", 50],
          ["#a98238", 70],
        ].map(([c, x]) => (
          <g key={String(x)}>
            <path d={`M${Number(x) - 7} 10h14v84l-7-6-7 6Z`} fill={String(c)} />
            <path d={`M${Number(x) - 7} 14h14`} stroke="#e7d6a8" strokeWidth=".8" />
          </g>
        ))}
      </svg>
    );
  }
  if (kind === "gift") {
    return (
      <svg viewBox="0 0 100 125" className="h-full w-auto max-w-full" direction="ltr" aria-hidden>
        <ellipse cx="50" cy="106" rx="36" ry="6" fill="#5e5049" opacity=".2" />
        <rect x="16" y="54" width="68" height="50" rx="2" fill="#2e4636" />
        <rect x="12" y="44" width="76" height="14" rx="2" fill="#34503d" />
        <rect x="45" y="44" width="10" height="60" fill="#c9a55e" />
        <path d="M50 44c-8-14-24-14-20-4 3 6 14 5 20 4ZM50 44c8-14 24-14 20-4-3 6-14 5-20 4Z" fill="#c9a55e" />
      </svg>
    );
  }
  if (kind === "gift-card") {
    return (
      <div className="grid size-full place-items-center px-[8%]">
        <div className="cloth @container relative aspect-[1.6] w-full rounded-lg p-[7%] shadow-book" style={clothStyle("navy")}>
          <div className="absolute inset-[4%] rounded-md border border-gold-foil/60" />
          <div className="relative flex h-full flex-col justify-between">
            <OrthodoxCross variant="slavic" className="h-[24cqw] text-gold-foil" />
            <div>
              <p className="foil-text line-clamp-3 max-w-full font-heading text-[7cqw] leading-[1.25] break-words">{tr(product.title, lang).split("(")[0]}</p>
              <p className="font-sans text-[4cqw] tracking-[0.16em] text-gold-soft/70 uppercase">Sample</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function ProductArt({
  product,
  lang,
  view = "front",
  className,
}: {
  product: Product;
  lang: string;
  view?: ArtView;
  className?: string;
}) {
  const { kind } = product.art;
  const photo = product.photos?.[view];
  if (photo) {
    return (
      <div className={cn("relative grid size-full place-items-center", className)} data-overflow-ok>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt={tr(product.title, lang)} loading="lazy" className="max-h-full max-w-full object-contain shadow-book" />
      </div>
    );
  }
  return (
    <div className={cn("relative grid size-full place-items-center", className)} data-overflow-ok>
      {kind === "book" && <BookCover product={product} lang={lang} view={view} />}
      {kind === "audio" && (
        <div className="@container relative aspect-square w-[92%]">
          <div className="absolute end-0 top-[6%] aspect-square w-[86%] rounded-full bg-[radial-gradient(circle,#ddd_0_8%,#222_8.5%_14%,#3a3a3a_14.5%_48%,#1a1a1a_49%)] shadow-book" />
          <div className="cloth absolute start-0 top-0 aspect-square w-[86%] overflow-hidden shadow-book" style={clothStyle(product.art.cloth)} data-overflow-ok>
            <div className="absolute inset-[7%] flex flex-col items-center justify-between border border-gold-foil/70 p-[8%] text-center">
              <Emblem name={product.art.emblem} className="h-[16cqw] text-gold-foil" />
              <p className="foil-text line-clamp-3 max-w-full font-heading text-[5.8cqw] leading-[1.25] break-words">{tr(product.title, lang).split("(")[0]}</p>
              <p className="font-sans text-[3.6cqw] tracking-[0.18em] text-gold-soft/60 uppercase">Sample</p>
            </div>
          </div>
        </div>
      )}
      {kind === "icon" && <IconArt subject={product.art.subject} />}
      {kind === "prayer-rope" && <PrayerRopeArt knots={product.art.knots} />}
      {kind === "cross" && (
        <div className="cloth grid aspect-square w-[78%] place-items-center rounded-full shadow-book" style={clothStyle("oxblood")}>
          <OrthodoxCross
            variant={product.art.variant === "icxc-nika" ? "icxc-nika" : product.art.variant === "byzantine" ? "byzantine" : "slavic"}
            className={cn("text-gold-foil", product.art.variant === "icxc-nika" ? "h-[62%] text-gold-soft" : "h-[70%]")}
            fill="var(--tk-color-goldFoil)"
          />
        </div>
      )}
      {(kind === "candles" || kind === "incense" || kind === "bookmarks" || kind === "gift" || kind === "gift-card") && (
        <Goods kind={kind} lang={lang} product={product} />
      )}
    </div>
  );
}

import { site } from "@/lib/content";
import { tr } from "@/lib/i18n";
import type { LogoMark, LogoStyle } from "@/lib/types";
import { cn } from "@/lib/utils";
import { OrthodoxCross } from "./orthodox-cross";

function Mark({ mark, className }: { mark: LogoMark; className?: string }) {
  if (mark === "none") return null;
  const variant = mark === "slavic-cross" ? "slavic" : mark === "byzantine-cross" ? "byzantine" : "icxc-nika";
  return <OrthodoxCross variant={variant} className={className} />;
}

interface Props {
  lang: string;
  condensed?: boolean;
  /** Override for previews; the site uses content/site.json logo.style. */
  style?: LogoStyle;
  className?: string;
  tone?: "ink" | "paper";
}

export function Logo({ lang, condensed, style = site.logo.style, className, tone = "ink" }: Props) {
  const name = tr(site.brand.name, lang);
  const short = tr(site.brand.shortName, lang);
  const mark = site.logo.mark;
  const text = tone === "ink" ? "text-ink" : "text-paper";

  const Words = (
    <span
      className={cn(
        "flex min-w-0 flex-col font-heading tracking-[0.01em]",
        // Fixed sizes (no size animation) so glyphs do not appear to shrink away on scroll / language switch.
        condensed ? "text-[1.05rem] md:text-[1.15rem]" : "text-[1.1rem] md:text-[1.25rem] lg:text-[1.1rem] xl:text-[1.3rem]",
        text,
      )}
    >
      <span className="hidden max-w-[22rem] leading-[1.22] text-balance xl:block">{name}</span>
      <span className="line-clamp-2 leading-[1.22] text-balance xl:hidden">{short}</span>
    </span>
  );

  if (style === "seal") {
    const id = `seal-path-${lang}`;
    return (
      <span className={cn("flex items-center gap-3", className)}>
        <span className={cn("relative shrink-0 transition-all", condensed ? "size-10" : "size-14")}>
        <svg viewBox="0 0 120 120" className="size-full" direction="ltr" aria-hidden>
          <defs>
            <path id={id} d="M60,60 m-43,0 a43,43 0 1,1 86,0 a43,43 0 1,1 -86,0" />
          </defs>
          <circle cx="60" cy="60" r="57" fill="var(--tk-color-oxblood)" />
          <circle cx="60" cy="60" r="53" fill="none" stroke="var(--tk-color-goldFoil)" strokeWidth="1.2" />
          <circle cx="60" cy="60" r="33" fill="none" stroke="var(--tk-color-goldFoil)" strokeWidth="0.8" />
          <text fill="var(--tk-color-goldSoft)" fontSize="9.5" letterSpacing="1.6" fontFamily="var(--tk-font-heading)">
            <textPath href={`#${id}`} startOffset="0">
              {short.toUpperCase()} ·
            </textPath>
          </text>
        </svg>
          <span className="absolute inset-0 grid place-items-center text-gold-foil">
            <Mark mark={mark === "none" ? "slavic-cross" : mark} className="h-[38%]" />
          </span>
        </span>
        <span className="sr-only">{name}</span>
        <span className="hidden sm:block">{Words}</span>
      </span>
    );
  }

  if (style === "kiot") {
    return (
      <span className={cn("flex items-center gap-3", className)}>
        <span
          className={cn(
            "relative grid shrink-0 place-items-center border-2 border-gold-foil bg-oxblood text-gold-foil transition-all",
            condensed ? "h-11 w-9" : "h-14 w-11",
          )}
          style={{ borderRadius: "999px 999px 3px 3px" }}
          aria-hidden
        >
          <span className="absolute inset-[3px] border border-gold-foil/50" style={{ borderRadius: "999px 999px 2px 2px" }} />
          <Mark mark={mark === "none" ? "slavic-cross" : mark} className="h-[55%]" />
        </span>
        {Words}
      </span>
    );
  }

  if (style === "square" && site.logo.image) {
    return (
      <span className={cn("flex items-center gap-3", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={site.logo.image}
          alt={tr(site.logo.alt, lang) || name}
          className={cn("shrink-0 rounded-sm transition-all", condensed ? "size-9" : "size-12")}
        />
        {Words}
      </span>
    );
  }

  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <Mark mark={mark} className={cn("shrink-0 text-oxblood", condensed ? "h-7" : "h-8 md:h-9", tone === "paper" && "text-gold-foil")} />
      {Words}
    </span>
  );
}

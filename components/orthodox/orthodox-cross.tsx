import { cn } from "@/lib/utils";

export type CrossVariant = "slavic" | "byzantine" | "icxc-nika";

interface Props {
  variant?: CrossVariant;
  className?: string;
  title?: string;
  /** Fill for the cross itself. Inscriptions use currentColor. */
  fill?: string;
  /** Position and size when nested inside another SVG. */
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

/**
 * The one cross used across the template. Never use the U+2626 cross glyph and never flip this component:
 * it carries an explicit direction="ltr" and is excluded from RTL mirroring.
 *
 * Slavic: short top bar (title), main bar, and a slanted footrest whose LEFT end (viewer's left) is HIGHER.
 */
export function OrthodoxCross({ variant = "slavic", className, title, fill = "currentColor", x, y, width, height }: Props) {
  const a11y = { ...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true }), x, y, width, height };

  if (variant === "slavic") {
    return (
      <svg viewBox="0 0 60 100" className={cn("shrink-0", className)} direction="ltr" data-no-mirror {...a11y}>
        {title ? <title>{title}</title> : null}
        <g fill={fill}>
          <rect x="27" y="1" width="6" height="98" rx="0.6" />
          <rect x="18.5" y="13" width="23" height="5" rx="0.6" />
          <rect x="5" y="28" width="50" height="6" rx="0.6" />
          {/* Footrest: viewer's left end higher (smaller y), right end lower. */}
          <polygon points="15,69 45,79 45,85 15,75" />
        </g>
      </svg>
    );
  }

  if (variant === "byzantine") {
    return (
      <svg viewBox="0 0 100 100" className={cn("shrink-0", className)} direction="ltr" data-no-mirror {...a11y}>
        {title ? <title>{title}</title> : null}
        <g fill={fill}>
          <path d="M44 44 L39 7 Q50 4 61 7 L56 44 Z" />
          <path d="M44 56 L39 93 Q50 96 61 93 L56 56 Z" />
          <path d="M44 44 L7 39 Q4 50 7 61 L44 56 Z" />
          <path d="M56 44 L93 39 Q96 50 93 61 L56 56 Z" />
          <rect x="43.5" y="43.5" width="13" height="13" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" className={cn("shrink-0", className)} direction="ltr" data-no-mirror {...a11y}>
      {title ? <title>{title}</title> : null}
      <g fill={fill}>
        <rect x="45" y="6" width="10" height="88" />
        <rect x="6" y="45" width="88" height="10" />
      </g>
      <g
        fill="currentColor"
        fontFamily="var(--tk-font-heading)"
        fontSize="19"
        fontWeight="600"
        textAnchor="middle"
        style={{ direction: "ltr", unicodeBidi: "isolate" }}
      >
        {/* IC and XC above the bar carry a titlo (abbreviation mark). */}
        <path d="M17 13.5 Q27 10 37 13.5" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M63 13.5 Q73 10 83 13.5" stroke="currentColor" strokeWidth="2" fill="none" />
        <text x="27" y="36">IC</text>
        <text x="73" y="36">XC</text>
        <text x="27" y="80">NI</text>
        <text x="73" y="80">KA</text>
      </g>
    </svg>
  );
}

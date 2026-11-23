import { cn } from "@/lib/utils";
import { OrthodoxCross } from "./orthodox-cross";

/** Line pictograms for categories. Drawn on a 48 grid, stroke uses currentColor. */
export function Pictogram({ name, className }: { name: string; className?: string }) {
  if (name === "cross") return <OrthodoxCross variant="slavic" className={cn("h-full", className)} />;

  const common = {
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: cn("shrink-0", className),
    dir: "ltr",
    "aria-hidden": true,
  };

  switch (name) {
    case "open-book":
      return (
        <svg {...common}>
          <path d="M24 14c-4-3-10-4-17-3v24c7-1 13 0 17 3 4-3 10-4 17-3V11c-7-1-13 0-17 3Z" />
          <path d="M24 14v24" />
          <path d="M11 17c3-.3 6 0 9 1.2M11 22c3-.3 6 0 9 1.2M28 18.2c3-1.2 6-1.5 9-1.2M28 23.2c3-1.2 6-1.5 9-1.2" />
        </svg>
      );
    case "halo":
      return (
        <svg {...common}>
          <circle cx="24" cy="16" r="9" />
          <circle cx="24" cy="16" r="6.5" strokeDasharray="1 2.2" />
          <path d="M9 40c3-2 9-3 15-1 6-2 12-1 15 1V30c-3-2-9-3-15-1-6-2-12-1-15 1Z" />
          <path d="M24 29v10" />
        </svg>
      );
    case "lampada":
      return (
        <svg {...common}>
          <path d="M24 4v6M16 10h16M17 10l-2 14M31 10l2 14" />
          <path d="M13 24h22c0 6-5 11-11 11s-11-5-11-11Z" />
          <path d="M24 35v4M21 39h6" />
          <path d="M24 17c-1.5 2-1.5 3.5 0 5 1.5-1.5 1.5-3 0-5Z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "scroll":
      return (
        <svg {...common}>
          <path d="M14 9h22a4 4 0 0 1 0 8H14" />
          <path d="M14 9a4 4 0 0 0 0 8v22a4 4 0 0 0 4 4h20a4 4 0 0 0 0-8H18" />
          <path d="M18 23h14M18 28h14M18 33h8" />
        </svg>
      );
    case "censer":
      return (
        <svg {...common}>
          <path d="M24 3v3M21 6h6" />
          <path d="M24 6v4" />
          <path d="M14 12l3 12M34 12l-3 12M24 10v14" />
          <path d="M12 24h24c0 7-5 12-12 12s-12-5-12-12Z" />
          <path d="M20 36l-2 5h12l-2-5" />
          <path d="M29 19c2-2 4-2 6-1M31 15c2-1 4 0 5 1" strokeDasharray="1 1.8" />
        </svg>
      );
    case "picture-book":
      return (
        <svg {...common}>
          <rect x="9" y="8" width="30" height="34" rx="2" />
          <path d="M14 8v34" />
          <path d="M26.5 15l1.6 3.4 3.7.4-2.8 2.5.8 3.6-3.3-1.9-3.3 1.9.8-3.6-2.8-2.5 3.7-.4Z" />
          <path d="M18 34c3-3 6-3 9 0s6 2 8 0" />
        </svg>
      );
    case "analogion":
      return (
        <svg {...common}>
          <path d="M10 16l14 6 14-6" />
          <path d="M10 16c4-2 9-2 14 1 5-3 10-3 14-1" />
          <path d="M24 22v18M17 42h14M20 30l-5 12M28 30l5 12" />
          <path d="M15 12c2-1 4-1 5 0M28 12c2-1 4-1 5 0" />
        </svg>
      );
    case "kiot":
      return (
        <svg {...common}>
          <path d="M10 42V18a14 14 0 0 1 28 0v24Z" />
          <path d="M14 42V19a10 10 0 0 1 20 0v23" />
          <circle cx="24" cy="22" r="5" />
          <path d="M17 38c1-5 4-8 7-8s6 3 7 8" />
        </svg>
      );
    case "prayer-rope":
      return (
        <svg {...common}>
          {Array.from({ length: 18 }).map((_, i) => {
            const a = (i / 18) * Math.PI * 2 - Math.PI / 2;
            if (Math.abs(Math.cos(a + Math.PI / 2)) < 0.12 && Math.sin(a + Math.PI / 2) > 0.9) return null;
            return <circle key={i} cx={24 + 13 * Math.cos(a)} cy={20 + 13 * Math.sin(a)} r="1.7" fill="currentColor" stroke="none" />;
          })}
          <path d="M24 33v4M22 37h4M24 37v3" />
          <path d="M21 40l-1 5M24 40v5M27 40l1 5" />
        </svg>
      );
    case "candle":
      return (
        <svg {...common}>
          <path d="M18 18h4v24h-4zM26 14h4v28h-4z" />
          <path d="M20 9c-1.5 2-1.5 4 0 6 1.5-2 1.5-4 0-6ZM28 5c-1.5 2-1.5 4 0 6 1.5-2 1.5-4 0-6Z" fill="currentColor" stroke="none" />
          <path d="M12 42h24" />
        </svg>
      );
    case "gift":
      return (
        <svg {...common}>
          <rect x="9" y="18" width="30" height="22" rx="1.5" />
          <path d="M7 13h34v5H7zM24 13v27" />
          <path d="M24 13c-3-5-9-6-9-2s6 2 9 2ZM24 13c3-5 9-6 9-2s-6 2-9 2Z" />
        </svg>
      );
    case "gift-card":
      return (
        <svg {...common}>
          <rect x="6" y="12" width="36" height="24" rx="2.5" />
          <path d="M6 19h36" />
          <path d="M32 12v24" />
          <path d="M32 19c-2-3-6-4-6-1.5s4 1.5 6 1.5ZM32 19c2-3 6-4 6-1.5s-4 1.5-6 1.5Z" />
          <path d="M11 30h12" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="10" y="8" width="28" height="32" rx="2" />
        </svg>
      );
  }
}

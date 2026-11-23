import type { CSSProperties } from "react";
import tokens from "@/design/tokens.json";

type Tree = { [k: string]: string | string[] | Tree };

function flatten(prefix: string, node: Tree, out: string[]) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$") || key === "name") continue;
    const name = `${prefix}-${key}`;
    if (Array.isArray(value)) {
      value.forEach((v, i) => out.push(`${name}-${i}:${v}`));
    } else if (typeof value === "object") {
      flatten(name, value, out);
    } else {
      out.push(`${name}:${value}`);
    }
  }
}

/** design/tokens.json as CSS custom properties: color.oxblood becomes --tk-color-oxblood. */
export function tokensCss() {
  const out: string[] = [];
  flatten("--tk", tokens as unknown as Tree, out);
  return `:root{${out.join(";")}}`;
}

export const clothColors = tokens.cloth as unknown as Record<string, [string, string]>;

export function clothStyle(name: string | undefined): CSSProperties {
  const [a, b] = clothColors[name ?? "oxblood"] ?? clothColors.oxblood;
  return { ["--cloth-a" as string]: a, ["--cloth-b" as string]: b };
}

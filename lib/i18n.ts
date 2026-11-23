import en from "@/content/i18n/en.json";
import ru from "@/content/i18n/ru.json";
import el from "@/content/i18n/el.json";
import siteJson from "@/content/site.json";
import type { Localized } from "./types";

export type Dictionary = typeof en;

const DEFAULT_LANG = (siteJson as { defaultLanguage: string }).defaultLanguage;

/** Add a language: drop content/i18n/<code>.json here and list it in content/site.json. */
const dictionaries: Record<string, unknown> = { en, ru, el };

function deepMerge<T>(base: T, over: unknown): T {
  if (typeof base !== "object" || base === null || typeof over !== "object" || over === null) {
    return (over ?? base) as T;
  }
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(over as Record<string, unknown>)) {
    const b = (base as Record<string, unknown>)[k];
    out[k] = typeof b === "object" && b !== null && typeof v === "object" && v !== null ? deepMerge(b, v) : v ?? b;
  }
  return out as T;
}

/** UI strings with per-key fallback to the default language. */
export function getDictionary(lang: string): Dictionary {
  const base = (dictionaries[DEFAULT_LANG] ?? en) as Dictionary;
  return deepMerge(base, dictionaries[lang] ?? {});
}

/** Resolves a localized content field with per-field fallback: lang, then default language, then any value. */
export function tr(value: Localized | undefined | null, lang: string): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[lang] ?? value[DEFAULT_LANG] ?? Object.values(value)[0] ?? "";
}

export function fmt(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

export function paragraphs(text: string) {
  return text.split(/\n{2,}/).filter(Boolean);
}

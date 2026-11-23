"use client";

import { createContext, useContext } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { LanguageConfig } from "@/lib/types";

interface SiteContextValue {
  lang: string;
  language: LanguageConfig;
  dict: Dictionary;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ value, children }: { value: SiteContextValue; children: React.ReactNode }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside SiteProvider");
  return ctx;
}

import siteJson from "@/content/site.json";

const site = siteJson as { commerce: { currency: string }; languages: { code: string; locale: string }[] };

export function localeFor(lang: string) {
  return site.languages.find((l) => l.code === lang)?.locale ?? lang;
}

export function money(amount: number, lang: string) {
  return new Intl.NumberFormat(localeFor(lang), {
    style: "currency",
    currency: site.commerce.currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function dateLong(iso: string, lang: string) {
  return new Intl.DateTimeFormat(localeFor(lang), { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso.length === 10 ? `${iso}T12:00:00` : iso),
  );
}

export function eventParts(iso: string, lang: string) {
  const d = new Date(iso);
  const loc = localeFor(lang);
  return {
    day: new Intl.DateTimeFormat(loc, { day: "numeric" }).format(d),
    month: new Intl.DateTimeFormat(loc, { month: "short" }).format(d).replace(".", ""),
    weekday: new Intl.DateTimeFormat(loc, { weekday: "long" }).format(d),
    time: new Intl.DateTimeFormat(loc, { hour: "numeric", minute: "2-digit" }).format(d),
    monthYear: new Intl.DateTimeFormat(loc, { month: "long", year: "numeric" }).format(d),
  };
}

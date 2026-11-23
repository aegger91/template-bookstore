"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { submitForm } from "@/lib/commerce";
import { useSite } from "./site-context";

export function NewsletterForm() {
  const { lang, dict } = useSite();
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  if (state === "done") {
    return (
      <p role="status" className="rounded-md border border-gold-foil/30 bg-white/5 px-4 py-3 text-paper">
        {dict.footer.subscribed}
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row"
      onSubmit={async (e) => {
        e.preventDefault();
        const email = new FormData(e.currentTarget).get("email");
        setState("sending");
        const res = await submitForm("newsletter", { email, language: lang });
        setState(res.ok ? "done" : "error");
      }}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        {dict.common.emailLabel}
      </label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder={dict.common.emailLabel}
        className="h-12 min-w-0 flex-1 rounded-md border border-white/20 bg-white/5 px-4 text-paper placeholder:text-paper/45 focus:border-gold-foil focus:outline-none"
      />
      <Button type="submit" disabled={state === "sending"} className="h-12 bg-gold-foil px-6 text-base text-navy-deep hover:bg-gold-soft">
        {state === "sending" ? dict.common.sending : dict.footer.subscribe}
      </Button>
      {state === "error" && <p className="text-sm text-gold-soft sm:basis-full">{dict.common.errorText}</p>}
    </form>
  );
}

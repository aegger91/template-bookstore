import siteJson from "@/content/site.json";
import type { SiteConfig } from "./types";

const site = siteJson as unknown as SiteConfig;

export type Fulfillment = "ship" | "pickup" | "parish";

export interface OrderLine {
  productId: string;
  formatId: string;
  title: string;
  qty: number;
  unitPrice: number;
}

export interface OrderDraft {
  lines: OrderLine[];
  fulfillment: Fulfillment;
  contact: { name: string; email: string; phone?: string };
  address?: { street: string; city: string; region: string; postal: string; country: string };
  parish?: { name: string; role?: string; taxExempt: boolean; invoice: boolean };
  gift: { wrap: boolean; message: string };
  totals: { subtotal: number; shipping: number | null; giftWrap: number; total: number };
  currency: string;
  language: string;
}

export type CheckoutResult =
  | { kind: "redirect"; url: string }
  | { kind: "demo"; orderNumber: string }
  | { kind: "error"; message: string };

export function shippingFor(subtotal: number, fulfillment: Fulfillment): number | null {
  if (fulfillment === "pickup") return 0;
  if (fulfillment === "parish") return null;
  const { flatRate, freeOver } = site.commerce.shipping;
  return subtotal >= freeOver ? 0 : flatRate;
}

/**
 * Provider-agnostic checkout. A static site cannot hold payment secrets, so every provider
 * needs a small server endpoint (commerce.checkoutEndpoint) that creates the hosted payment page
 * and returns its URL as { url }.
 */
export async function submitOrder(order: OrderDraft): Promise<CheckoutResult> {
  const { provider, checkoutEndpoint } = site.commerce;

  if (provider === "none" || !checkoutEndpoint) {
    await new Promise((r) => setTimeout(r, 600));
    return { kind: "demo", orderNumber: `DEMO-${Date.now().toString(36).toUpperCase()}` };
  }

  try {
    const res = await fetch(checkoutEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, order }),
    });
    if (!res.ok) throw new Error(`Checkout endpoint returned ${res.status}`);
    const data = (await res.json()) as { url?: string };
    if (!data.url) throw new Error("Checkout endpoint did not return a url");

    switch (provider) {
      case "stripe":
        // TODO(Stripe): endpoint creates a Checkout Session and returns session.url.
        return { kind: "redirect", url: data.url };
      case "authorize-net":
        // TODO(Authorize.net): endpoint calls getHostedPaymentPageRequest and returns the Accept Hosted URL with token.
        return { kind: "redirect", url: data.url };
    }
  } catch (err) {
    return { kind: "error", message: err instanceof Error ? err.message : String(err) };
  }
}

/** Shared by contact, wholesale, notify and newsletter forms. Without an endpoint the forms run in demo mode. */
export async function submitForm(
  form: "contact" | "wholesale" | "notify" | "newsletter",
  data: Record<string, unknown>,
): Promise<{ ok: boolean; demo: boolean }> {
  const endpoint =
    form === "newsletter" ? site.orthodoxConnect.newsletter.endpoint ?? site.forms.endpoint : site.forms.endpoint;
  if (!endpoint) {
    await new Promise((r) => setTimeout(r, 500));
    return { ok: true, demo: true };
  }
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ form, site: site.slug, ...data }),
    });
    return { ok: res.ok, demo: false };
  } catch {
    return { ok: false, demo: false };
  }
}

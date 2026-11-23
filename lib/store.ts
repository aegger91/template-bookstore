"use client";

import { useSyncExternalStore } from "react";
import siteJson from "@/content/site.json";

const NS = `${(siteJson as { slug: string }).slug}:`;

export interface CartLine {
  productId: string;
  formatId: string;
  qty: number;
}

export interface CartState {
  lines: CartLine[];
  giftWrap: boolean;
  giftMessage: string;
}

function createStore<T>(key: string, initial: T) {
  let state = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(NS + key);
      if (raw) state = { ...initial, ...JSON.parse(raw) };
    } catch {
      /* storage can be unavailable in private modes */
    }
  };

  const set = (next: T | ((prev: T) => T)) => {
    load();
    state = typeof next === "function" ? (next as (p: T) => T)(state) : next;
    try {
      window.localStorage.setItem(NS + key, JSON.stringify(state));
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (l: () => void) => {
    listeners.add(l);
    const onStorage = (e: StorageEvent) => {
      if (e.key === NS + key) {
        loaded = false;
        load();
        l();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener("storage", onStorage);
    };
  };

  const useStore = () =>
    useSyncExternalStore(
      subscribe,
      () => {
        load();
        return state;
      },
      () => initial,
    );

  return { useStore, set, get: () => (load(), state) };
}

export const cartStore = createStore<CartState>("cart", { lines: [], giftWrap: false, giftMessage: "" });
export const wishlistStore = createStore<{ ids: string[] }>("wishlist", { ids: [] });

/** True after hydration, so client-only state (cart, wishlist) never mismatches the static HTML. */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function addToCart(productId: string, formatId: string, qty = 1) {
  cartStore.set((s) => {
    const existing = s.lines.find((l) => l.productId === productId && l.formatId === formatId);
    const lines = existing
      ? s.lines.map((l) => (l === existing ? { ...l, qty: Math.min(99, l.qty + qty) } : l))
      : [...s.lines, { productId, formatId, qty }];
    return { ...s, lines };
  });
}

export function setQty(productId: string, formatId: string, qty: number) {
  cartStore.set((s) => ({
    ...s,
    lines: s.lines
      .map((l) => (l.productId === productId && l.formatId === formatId ? { ...l, qty: Math.max(0, Math.min(99, qty)) } : l))
      .filter((l) => l.qty > 0),
  }));
}

export function clearCart() {
  cartStore.set({ lines: [], giftWrap: false, giftMessage: "" });
}

export function toggleWishlist(id: string) {
  wishlistStore.set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id] }));
}

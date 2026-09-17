"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";

/**
 * Ensures Zustand persist finishes and hasHydrated flips true.
 * Without this, a missed onRehydrateStorage callback leaves the cart
 * stuck on "Loading…" and hides the header badge forever.
 */
export function CartHydrator() {
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        await useCartStore.persist.rehydrate();
      } catch {
        // ignore — still mark hydrated so UI unblocks
      }
      if (!cancelled) {
        useCartStore.getState().setHasHydrated(true);
      }
    }

    void hydrate();
    // Fallback if rehydrate hangs
    const t = window.setTimeout(() => {
      useCartStore.getState().setHasHydrated(true);
    }, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);

  return null;
}

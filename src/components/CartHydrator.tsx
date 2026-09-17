"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";

/** Unblocks cart UI if persist hydration is slow or skipped. */
export function CartHydrator() {
  useEffect(() => {
    useCartStore.setState({ hasHydrated: true });
    const unsub = useCartStore.persist.onFinishHydration(() => {
      useCartStore.setState({ hasHydrated: true });
    });
    void useCartStore.persist.rehydrate();
    const t = window.setTimeout(() => {
      useCartStore.setState({ hasHydrated: true });
    }, 300);
    return () => {
      unsub();
      window.clearTimeout(t);
    };
  }, []);

  return null;
}

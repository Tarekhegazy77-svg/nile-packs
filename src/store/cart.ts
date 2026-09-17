"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { discountedPrice } from "@/lib/discount";
import { getProductById, type Product } from "@/lib/products";

export type CartItem = {
  productId: string;
  quantity: number;
};

export type CartLine = {
  product: Product;
  quantity: number;
  lineOriginal: number;
  lineDiscounted: number;
};

type CartState = {
  items: CartItem[];
  hasHydrated: boolean;
  addItem: (productId: string, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setHasHydrated: (value: boolean) => void;
};

export function getCartTotalItems(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function getCartLineItems(items: CartItem[]): CartLine[] {
  return items
    .map((i) => {
      const product = getProductById(i.productId);
      if (!product) return null;
      return {
        product,
        quantity: i.quantity,
        lineOriginal: product.priceLE * i.quantity,
        lineDiscounted: discountedPrice(product.priceLE) * i.quantity,
      };
    })
    .filter((x): x is CartLine => x !== null);
}

export function getCartSubtotalOriginal(items: CartItem[]): number {
  return items.reduce((sum, i) => {
    const p = getProductById(i.productId);
    return sum + (p ? p.priceLE * i.quantity : 0);
  }, 0);
}

export function getCartSubtotalDiscounted(items: CartItem[]): number {
  return items.reduce((sum, i) => {
    const p = getProductById(i.productId);
    return sum + (p ? discountedPrice(p.priceLE) * i.quantity : 0);
  }, 0);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,

      addItem: (productId, qty = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === productId
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            };
          }
          return { items: [...state.items, { productId, quantity: qty }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      setQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "nile-packs-cart-v2",
      partialize: (s) => ({ items: s.items }),
    }
  )
);

// Mark hydrated after persist finishes (avoids TDZ / init races)
if (typeof window !== "undefined") {
  useCartStore.persist.onFinishHydration(() => {
    useCartStore.setState({ hasHydrated: true });
  });
  // If already hydrated (fast path)
  if (useCartStore.persist.hasHydrated()) {
    useCartStore.setState({ hasHydrated: true });
  }
}

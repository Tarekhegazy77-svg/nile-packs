"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { discountedPrice } from "@/lib/discount";
import { getProductById, type Product } from "@/lib/products";

export type CartItem = {
  productId: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (productId: string, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotalOriginal: () => number;
  subtotalDiscounted: () => number;
  lineItems: () => Array<{
    product: Product;
    quantity: number;
    lineOriginal: number;
    lineDiscounted: number;
  }>;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

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

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotalOriginal: () =>
        get().items.reduce((sum, i) => {
          const p = getProductById(i.productId);
          return sum + (p ? p.priceLE * i.quantity : 0);
        }, 0),

      subtotalDiscounted: () =>
        get().items.reduce((sum, i) => {
          const p = getProductById(i.productId);
          return sum + (p ? discountedPrice(p.priceLE) * i.quantity : 0);
        }, 0),

      lineItems: () =>
        get()
          .items.map((i) => {
            const product = getProductById(i.productId);
            if (!product) return null;
            return {
              product,
              quantity: i.quantity,
              lineOriginal: product.priceLE * i.quantity,
              lineDiscounted: discountedPrice(product.priceLE) * i.quantity,
            };
          })
          .filter((x): x is NonNullable<typeof x> => x !== null),
    }),
    {
      name: "packages-store-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

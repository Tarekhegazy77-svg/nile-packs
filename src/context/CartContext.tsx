"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { discountedPrice } from "@/lib/discount";
import { getProductById, type Product } from "@/lib/products";

export type CartItem = { productId: string; quantity: number };

export type CartLine = {
  product: Product;
  quantity: number;
  lineOriginal: number;
  lineDiscounted: number;
};

type CartContextValue = {
  ready: boolean;
  items: CartItem[];
  addItem: (productId: string, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  lines: CartLine[];
  subtotalOriginal: number;
  subtotalDiscounted: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "nile-packs-cart-v3";

function buildLines(items: CartItem[]): CartLine[] {
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // ignore bad storage
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota
    }
  }, [items, ready]);

  const addItem = useCallback((productId: string, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { productId, quantity: qty }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      );
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const lines = buildLines(items);
    return {
      ready,
      items,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      totalItems: items.reduce((s, i) => s + i.quantity, 0),
      lines,
      subtotalOriginal: lines.reduce((s, l) => s + l.lineOriginal, 0),
      subtotalDiscounted: lines.reduce((s, l) => s + l.lineDiscounted, 0),
    };
  }, [items, ready, addItem, removeItem, setQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

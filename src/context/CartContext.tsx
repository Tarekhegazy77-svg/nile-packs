"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { discountedPrice } from "@/lib/discount";
import { getProductById, type Product } from "@/lib/products";
import { useCatalogOptional } from "@/context/CatalogContext";

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

function buildLines(
  items: CartItem[],
  resolve: (id: string) => Product | undefined
): CartLine[] {
  return items
    .map((i) => {
      const product = resolve(i.productId);
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

function subscribe() {
  return () => {};
}

export function CartProvider({ children }: { children: ReactNode }) {
  // true only on client — avoids depending on useEffect for "ready"
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);
  const catalog = useCatalogOptional();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const resolveProduct = useCallback(
    (id: string): Product | undefined => {
      const live = catalog?.getById(id);
      if (live) {
        if (live.removed || live.inStock === false) return undefined;
        return live;
      }
      return getProductById(id);
    },
    [catalog]
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, loaded]);

  const addItem = useCallback(
    (productId: string, qty = 1) => {
      const product = resolveProduct(productId);
      if (!product) return;
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
    },
    [resolveProduct]
  );

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

  const ready = isClient; // interactive as soon as we're on the client

  const value = useMemo<CartContextValue>(() => {
    const lines = buildLines(items, resolveProduct);
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
  }, [items, ready, addItem, removeItem, setQuantity, clearCart, resolveProduct]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

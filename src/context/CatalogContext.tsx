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
import {
  products as staticProducts,
  type Product,
} from "@/lib/products";
import {
  fetchPublicCatalog,
  type AdminProduct,
} from "@/lib/admin-api";

export type CatalogProduct = Product & {
  inStock: boolean;
  stockQty: number | null;
  removed: boolean;
};

type CatalogContextValue = {
  ready: boolean;
  usingLiveCatalog: boolean;
  products: CatalogProduct[];
  getById: (id: string) => CatalogProduct | undefined;
  getBySlug: (slug: string) => CatalogProduct | undefined;
  featured: CatalogProduct[];
  refresh: () => Promise<void>;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

function toCatalog(p: Product | AdminProduct, live?: boolean): CatalogProduct {
  if (live && "inStock" in p) {
    const a = p as AdminProduct;
    return {
      id: a.id,
      slug: a.slug,
      name: a.name,
      description: a.description,
      includes: a.includes,
      priceLE: a.priceLE,
      featured: a.featured,
      image: a.image,
      inStock: a.inStock !== false,
      stockQty: a.stockQty ?? null,
      removed: Boolean(a.removed),
    };
  }
  return {
    ...(p as Product),
    inStock: true,
    stockQty: null,
    removed: false,
  };
}

const staticCatalog: CatalogProduct[] = staticProducts.map((p) =>
  toCatalog(p)
);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<CatalogProduct[]>(staticCatalog);
  const [usingLive, setUsingLive] = useState(false);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const live = await fetchPublicCatalog();
      if (live.length > 0) {
        setProducts(live.filter((p) => !p.removed).map((p) => toCatalog(p, true)));
        setUsingLive(true);
      } else {
        setProducts(staticCatalog);
        setUsingLive(false);
      }
    } catch {
      setProducts(staticCatalog);
      setUsingLive(false);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<CatalogContextValue>(() => {
    const map = new Map(products.map((p) => [p.id, p]));
    const slugMap = new Map(products.map((p) => [p.slug, p]));
    return {
      ready,
      usingLiveCatalog: usingLive,
      products,
      getById: (id) => map.get(id),
      getBySlug: (slug) => slugMap.get(slug),
      featured: products.filter((p) => p.featured && p.inStock),
      refresh,
    };
  }, [products, ready, usingLive, refresh]);

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}

/** Safe optional hook when provider may be absent (should not happen). */
export function useCatalogOptional(): CatalogContextValue | null {
  return useContext(CatalogContext);
}

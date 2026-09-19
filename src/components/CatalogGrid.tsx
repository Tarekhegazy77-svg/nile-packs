"use client";

import { ProductCard } from "@/components/ProductCard";
import { useCatalog } from "@/context/CatalogContext";
import { products as staticProducts } from "@/lib/products";

type Props = {
  mode?: "all" | "featured";
};

export function CatalogGrid({ mode = "all" }: Props) {
  const { ready, products, featured, usingLiveCatalog } = useCatalog();

  const list =
    mode === "featured"
      ? ready
        ? featured.length
          ? featured
          : staticProducts.filter((p) => p.featured)
        : staticProducts.filter((p) => p.featured)
      : ready
        ? products.length
          ? products
          : staticProducts
        : staticProducts;

  return (
    <>
      {usingLiveCatalog ? (
        <p className="mb-4 text-xs text-silver">Live stock from admin catalog</p>
      ) : null}
      <div
        className={
          mode === "featured"
            ? "grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2"
            : "grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
        }
      >
        {list.map((product, i) => (
          <div
            key={product.id}
            className={
              mode === "featured" && i === 0 ? "bento-wide sm:col-span-2" : ""
            }
          >
            <ProductCard
              product={product}
              featured={mode === "featured" && i === 0}
            />
          </div>
        ))}
      </div>
    </>
  );
}

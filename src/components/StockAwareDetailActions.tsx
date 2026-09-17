"use client";

import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { useCatalogOptional } from "@/context/CatalogContext";

type Props = {
  productId: string;
};

export function StockAwareDetailActions({ productId }: Props) {
  const catalog = useCatalogOptional();
  const live = catalog?.getById(productId);
  const outOfStock = live != null && live.inStock === false;

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {outOfStock ? (
        <p className="w-full rounded-xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm font-medium text-terracotta">
          This package is currently out of stock.
        </p>
      ) : null}
      <AddToCartButton
        productId={productId}
        label="Add to cart"
        className="min-h-11 w-full justify-center px-8 py-3 sm:w-auto"
      />
      <Link
        href="/cart"
        className="focus-ring inline-flex min-h-11 w-full items-center justify-center rounded-full border border-nile-ink/15 px-5 py-3 text-sm font-semibold text-nile-ink transition-all duration-200 hover:scale-[1.03] hover:border-nile hover:bg-nile/5 hover:text-nile hover:shadow-sm active:scale-[0.98] sm:w-auto"
      >
        View cart
      </Link>
    </div>
  );
}

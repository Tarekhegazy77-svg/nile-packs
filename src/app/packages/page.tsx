import type { Metadata } from "next";
import { CatalogGrid } from "@/components/CatalogGrid";
import { discountPercentLabel } from "@/lib/discount";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Catalog",
  description: "All digital packages with automatic 40% off in LE.",
};

export default function PackagesPage() {
  const off = discountPercentLabel();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
          Catalog
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-nile-ink sm:text-4xl">
          All packages
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-nile-muted sm:text-base">
          {products.length} digital downloads · every price shows list + sale (
          {off} off, applied automatically — no coupon).
        </p>
      </div>
      <div className="mt-8 sm:mt-10">
        <CatalogGrid mode="all" />
      </div>
    </div>
  );
}

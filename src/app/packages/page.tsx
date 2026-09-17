import type { Metadata } from "next";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { discountPercentLabel } from "@/lib/discount";

export const metadata: Metadata = {
  title: "Catalog",
  description: "All digital packages with automatic 40% off in LE.",
};

export default function PackagesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
          Catalog
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-nile-ink">
          All packages
        </h1>
        <p className="mt-3 text-nile-muted">
          {products.length} digital downloads · every price shows original + sale
          ({discountPercentLabel()} off, applied automatically).
        </p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

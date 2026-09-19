"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";
import { PriceDisplay } from "./PriceDisplay";
import { AddToCartButton } from "./AddToCartButton";
import { useCatalogOptional } from "@/context/CatalogContext";
import { assetPath } from "@/lib/asset-path";

const accents = [
  "from-cyan/80 to-cyan-dim/40",
  "from-gold/70 to-danger/40",
  "from-cyan-dim/70 to-panel",
  "from-gold/50 to-cyan/30",
  "from-panel-2 to-cyan/50",
  "from-danger/50 to-gold/40",
];

function accentFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = (hash + id.charCodeAt(i) * (i + 1)) % accents.length;
  return accents[hash];
}

type Props = {
  product: Product;
  featured?: boolean;
};

export function ProductCard({ product: initial, featured = false }: Props) {
  const catalog = useCatalogOptional();
  const live = catalog?.getById(initial.id);
  const product = live
    ? {
        ...initial,
        name: live.name,
        priceLE: live.priceLE,
        featured: live.featured,
        description: live.description,
        image: live.image ?? initial.image,
      }
    : initial;
  const outOfStock = live != null && live.inStock === false;
  const accent = accentFor(product.id);

  return (
    <article
      className={`card-lift group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-white/8 bg-panel shadow-lg shadow-black/40 ${
        featured ? "sm:flex-row" : ""
      }`}
    >
      <Link
        href={`/packages/${product.slug}`}
        className={`block min-w-0 focus-ring ${featured ? "sm:w-[44%] sm:shrink-0" : "rounded-t-2xl"}`}
      >
        <div
          className={`relative flex items-end overflow-hidden bg-gradient-to-br ${accent} p-4 ${
            featured ? "h-40 sm:h-full sm:min-h-[220px]" : "h-36 sm:h-40"
          }`}
        >
          {product.image ? (
            <Image
              src={assetPath(product.image)!}
              alt={`${product.name} product artwork`}
              fill
              sizes="(min-width: 640px) 33vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : null}
          <div
            className={`absolute inset-0 ${
              product.image
                ? "bg-gradient-to-t from-ink/80 via-ink/20 to-transparent"
                : "scale-100 opacity-40 mix-blend-overlay transition-transform duration-500 ease-out group-hover:scale-125 [background-image:radial-gradient(circle_at_20%_20%,white_0,transparent_40%),radial-gradient(circle_at_80%_60%,black_0,transparent_35%)]"
            }`}
          />
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [box-shadow:inset_0_0_0_1px_rgb(60_240_216/0.25),inset_0_-40px_60px_-20px_rgb(0_0_0/0.5)]" />
          <span className="relative rounded-md border border-white/15 bg-ink/50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-mist backdrop-blur-sm">
            {outOfStock ? "Out of stock" : "Digital package"}
          </span>
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          href={`/packages/${product.slug}`}
          className="block space-y-2 px-4 pt-4 focus-ring sm:px-5"
        >
          <h3 className="font-display text-lg font-bold tracking-tight text-mist transition-colors duration-200 group-hover:text-cyan sm:text-xl">
            {product.name}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-silver">
            {product.description}
          </p>
        </Link>
        <div className="mt-auto flex flex-col gap-3 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
          <PriceDisplay priceLE={product.priceLE} size="md" />
          <div className="flex min-w-0 items-stretch gap-2">
            <AddToCartButton
              productId={product.id}
              className="min-h-11 min-w-0 flex-1"
            />
            <Link
              href={`/packages/${product.slug}`}
              className="btn-ghost focus-ring inline-flex min-h-11 shrink-0 items-center justify-center rounded-full px-3.5 text-sm font-medium transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] sm:px-4"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

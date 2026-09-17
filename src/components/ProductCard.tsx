import Link from "next/link";
import type { Product } from "@/lib/products";
import { PriceDisplay } from "./PriceDisplay";
import { AddToCartButton } from "./AddToCartButton";

const accents = [
  "from-nile/90 to-teal",
  "from-terracotta to-saffron",
  "from-teal to-nile",
  "from-saffron to-terracotta",
  "from-nile-deep to-nile",
  "from-terracotta/90 to-nile",
];

function accentFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i) * (i + 1)) % accents.length;
  return accents[hash];
}

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const accent = accentFor(product.id);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-nile-ink/8 bg-white shadow-sm shadow-nile-ink/5 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-nile/10">
      <Link href={`/packages/${product.slug}`} className="block">
        <div
          className={`relative flex h-36 items-end bg-gradient-to-br ${accent} p-4`}
        >
          <div className="absolute inset-0 opacity-30 mix-blend-overlay [background-image:radial-gradient(circle_at_20%_20%,white_0,transparent_40%),radial-gradient(circle_at_80%_60%,black_0,transparent_35%)]" />
          <span className="relative rounded-md bg-white/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
            Digital package
          </span>
        </div>
        <div className="space-y-2 px-5 pt-4">
          <h3 className="font-display text-xl font-semibold text-nile-ink group-hover:text-nile">
            {product.name}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-nile-muted">
            {product.description}
          </p>
        </div>
      </Link>
      <div className="mt-auto flex flex-col gap-3 px-5 pb-5 pt-4">
        <PriceDisplay priceLE={product.priceLE} size="md" />
        <div className="flex items-center gap-2">
          <AddToCartButton productId={product.id} className="flex-1" />
          <Link
            href={`/packages/${product.slug}`}
            className="rounded-full border border-nile-ink/15 px-3 py-2.5 text-sm font-medium text-nile-ink transition hover:border-nile hover:text-nile"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

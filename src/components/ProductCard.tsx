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
  for (let i = 0; i < id.length; i++)
    hash = (hash + id.charCodeAt(i) * (i + 1)) % accents.length;
  return accents[hash];
}

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const accent = accentFor(product.id);

  return (
    <article className="card-lift group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-nile-ink/8 bg-white shadow-sm shadow-nile-ink/5">
      <Link href={`/packages/${product.slug}`} className="block min-w-0 focus-ring rounded-t-2xl">
        <div
          className={`relative flex h-32 items-end overflow-hidden bg-gradient-to-br sm:h-36 ${accent} p-4`}
        >
          <div className="absolute inset-0 scale-100 opacity-30 mix-blend-overlay transition-transform duration-500 ease-out group-hover:scale-125 [background-image:radial-gradient(circle_at_20%_20%,white_0,transparent_40%),radial-gradient(circle_at_80%_60%,black_0,transparent_35%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [box-shadow:inset_0_0_0_1px_rgb(255_255_255/0.2),inset_0_-40px_60px_-20px_rgb(0_0_0/0.25)]" />
          <span className="relative rounded-md bg-white/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-colors duration-200 group-hover:bg-white/25">
            Digital package
          </span>
        </div>
        <div className="space-y-2 px-4 pt-4 sm:px-5">
          <h3 className="font-display text-lg font-semibold text-nile-ink transition-colors duration-200 group-hover:text-nile sm:text-xl">
            {product.name}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-nile-muted">
            {product.description}
          </p>
        </div>
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
            className="focus-ring inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-nile-ink/15 px-3.5 text-sm font-medium text-nile-ink transition-all duration-200 hover:scale-[1.03] hover:border-nile hover:bg-nile/5 hover:text-nile hover:shadow-sm active:scale-[0.97] sm:px-4"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { getFeaturedProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { discountPercentLabel } from "@/lib/discount";

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <>
      <section className="relative overflow-hidden border-b border-nile-ink/8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-saffron/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-teal/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-terracotta/30 bg-terracotta/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-terracotta">
            <Sparkles className="h-3.5 w-3.5" />
            Site-wide {discountPercentLabel()} off · no coupon
          </div>
          <h1 className="mt-6 max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-nile-ink sm:text-5xl lg:text-6xl">
            Digital packages that ship the moment you pay.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-nile-muted">
            Templates, kits, and creator assets priced in Egyptian pounds.
            Original prices stay visible with a strikethrough — cart and checkout
            always use the sale total.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 rounded-full bg-nile px-6 py-3 text-sm font-semibold text-sand shadow-lg shadow-nile/20 transition hover:bg-nile-deep"
            >
              Browse catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/packages/all-access-bundle"
              className="inline-flex items-center gap-2 rounded-full border border-nile-ink/15 bg-white/70 px-6 py-3 text-sm font-semibold text-nile-ink backdrop-blur transition hover:border-nile hover:text-nile"
            >
              All-Access Bundle
            </Link>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "Instant delivery",
                body: "Stub download links appear right after demo checkout.",
              },
              {
                icon: Shield,
                title: "Clear LE pricing",
                body: "Every package shows list + sale price in Egyptian pounds.",
              },
              {
                icon: Sparkles,
                title: "Always 40% off",
                body: "Discount is baked into totals — nothing to enter at checkout.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-nile-ink/8 bg-white/80 p-5 shadow-sm backdrop-blur"
              >
                <Icon className="h-5 w-5 text-nile" />
                <h2 className="mt-3 font-display text-lg font-semibold text-nile-ink">
                  {title}
                </h2>
                <p className="mt-1 text-sm text-nile-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
              Featured
            </p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-nile-ink">
              Packages worth opening first
            </h2>
          </div>
          <Link
            href="/packages"
            className="inline-flex items-center gap-1 text-sm font-semibold text-nile hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}

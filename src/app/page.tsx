import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { getFeaturedProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { discountPercentLabel } from "@/lib/discount";

export default function HomePage() {
  const featured = getFeaturedProducts();
  const off = discountPercentLabel();

  return (
    <>
      <section className="relative overflow-hidden border-b border-nile-ink/8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-saffron/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-teal/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-24">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-terracotta/30 bg-terracotta/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-terracotta">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {off} off everything · no coupon needed
            </span>
          </div>
          <h1 className="mt-5 max-w-2xl font-display text-[2rem] font-semibold leading-[1.12] tracking-tight text-nile-ink sm:mt-6 sm:text-5xl lg:text-6xl">
            Digital packages that ship the moment you pay.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-nile-muted sm:mt-5 sm:text-lg">
            Templates, kits, and creator assets in Egyptian pounds. List prices
            stay visible with a strikethrough — your cart always charges the{" "}
            {off}-off sale total.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
            <Link
              href="/packages"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-nile px-6 py-3 text-sm font-semibold text-sand shadow-lg shadow-nile/20 transition hover:bg-nile-deep"
            >
              Browse catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/packages/all-access-bundle"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-nile-ink/15 bg-white/70 px-6 py-3 text-sm font-semibold text-nile-ink backdrop-blur transition hover:border-nile hover:text-nile"
            >
              All-Access Bundle
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:mt-14 sm:grid-cols-3 sm:gap-4">
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
                title: `Always ${off} off`,
                body: "Discount is baked into totals — nothing to enter at checkout.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-nile-ink/8 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-5"
              >
                <Icon className="h-5 w-5 text-nile" />
                <h2 className="mt-3 font-display text-lg font-semibold text-nile-ink">
                  {title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-nile-muted">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
              Featured
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-nile-ink sm:text-3xl">
              Start here
            </h2>
          </div>
          <Link
            href="/packages"
            className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-nile hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import { ArrowRight, Zap, Shield, Sparkles } from "lucide-react";
import { CatalogGrid } from "@/components/CatalogGrid";
import { discountPercentLabel } from "@/lib/discount";
import { getProductBySlug } from "@/lib/products";
import { PriceDisplay } from "@/components/PriceDisplay";

export default function HomePage() {
  const off = discountPercentLabel();
  const featured = getProductBySlug("all-access-bundle");

  return (
    <>
      {/* Asymmetric editorial hero */}
      <section className="relative overflow-hidden border-b border-white/6">
        <div className="animate-ambient pointer-events-none absolute -right-20 -top-32 h-[28rem] w-[28rem] rounded-full bg-cyan/15 blur-[100px]" />
        <div className="animate-ambient-alt pointer-events-none absolute -bottom-40 -left-24 h-[22rem] w-[22rem] rounded-full bg-gold/12 blur-[90px]" />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-12 lg:items-end lg:gap-12 lg:py-24">
          <div className="lg:col-span-7">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {off} off everything · no coupon
              </span>
            </div>

            <h1 className="mt-6 font-display text-[2.65rem] font-extrabold leading-[0.95] tracking-tight text-mist sm:text-6xl lg:text-[4.25rem]">
              Digital packs
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan via-mist to-gold">
                that feel expensive.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-silver sm:mt-6 sm:text-lg">
              Templates, kits, and creator assets — priced in Egyptian pounds.
              List stays visible; your cart always charges the {off}-off total.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/packages"
                className="btn-shine btn-primary focus-ring group inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-bold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              >
                Browse catalog
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/packages/all-access-bundle"
                className="btn-ghost focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                All-Access Bundle
              </Link>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-3 border-t border-white/8 pt-8 sm:max-w-md">
              {[
                { k: "Instant", v: "Delivery" },
                { k: "LE", v: "Pricing" },
                { k: off, v: "Always on" },
              ].map((stat) => (
                <div key={stat.k}>
                  <dt className="font-display text-lg font-bold text-cyan sm:text-xl">
                    {stat.k}
                  </dt>
                  <dd className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-silver">
                    {stat.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Featured pack stage */}
          <div className="relative lg:col-span-5">
            <div className="animate-glow pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-cyan/20 via-transparent to-gold/15 blur-2xl" />
            <div className="glass-panel relative overflow-hidden rounded-[1.75rem] p-6 sm:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
                Featured stage
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-mist sm:text-3xl">
                {featured?.name ?? "All-Access Bundle"}
              </h2>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-silver">
                {featured?.description ??
                  "Every package in the catalog — one download, lifetime updates."}
              </p>
              {featured ? (
                <div className="mt-5">
                  <PriceDisplay priceLE={featured.priceLE} size="md" />
                </div>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-2">
                {(featured?.includes.slice(0, 4) ?? []).map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-silver"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <Link
                href="/packages/all-access-bundle"
                className="btn-shine btn-primary focus-ring mt-7 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
              >
                Open the stage
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip — refined, not hero story */}
      <section className="border-b border-white/6">
        <div className="mx-auto grid max-w-6xl gap-px bg-white/6 sm:grid-cols-3">
          {[
            {
              icon: Zap,
              title: "Instant delivery",
              body: "Stub downloads appear right after demo checkout.",
            },
            {
              icon: Shield,
              title: "Clear LE pricing",
              body: "Every package shows list + sale in Egyptian pounds.",
            },
            {
              icon: Sparkles,
              title: `Always ${off} off`,
              body: "Discount baked into totals — nothing to enter.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="feature-tile flex gap-4 bg-ink px-5 py-6 sm:px-6 sm:py-7"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan/20 bg-cyan/10 text-cyan">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-base font-bold text-mist">
                  {title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-silver">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
              Editorial picks
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-mist sm:text-4xl">
              Start here
            </h2>
          </div>
          <Link
            href="/packages"
            className="link-soft focus-ring group inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm font-semibold text-cyan"
          >
            View all{" "}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="mt-8 sm:mt-10">
          <CatalogGrid mode="featured" />
        </div>
      </section>
    </>
  );
}

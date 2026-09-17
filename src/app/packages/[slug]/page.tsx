import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ArrowLeft } from "lucide-react";
import { getProductBySlug, products } from "@/lib/products";
import { PriceDisplay } from "@/components/PriceDisplay";
import { AddToCartButton } from "@/components/AddToCartButton";
import { savingsAmount, discountPercentLabel } from "@/lib/discount";
import { formatLE } from "@/lib/format";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Package not found" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function PackageDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const saved = savingsAmount(product.priceLE);
  const off = discountPercentLabel();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14">
      <Link
        href="/packages"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-nile-muted transition hover:text-nile"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to catalog
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-nile via-nile-deep to-teal p-8 text-sand shadow-xl shadow-nile/20 sm:min-h-[360px] sm:p-10">
          <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_30%_20%,white_0,transparent_45%),radial-gradient(circle_at_90%_80%,#e8b84a_0,transparent_40%)]" />
          <div className="relative flex h-full flex-col justify-between gap-12">
            <div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur">
                Digital download
              </span>
              <h1 className="mt-6 font-display text-4xl font-semibold leading-tight sm:text-5xl">
                {product.name}
              </h1>
            </div>
            <p className="text-sm text-sand/70">
              Instant access after demo checkout · LE pricing
            </p>
          </div>
        </div>

        <div>
          <PriceDisplay priceLE={product.priceLE} size="lg" />
          <p className="mt-2 text-sm font-medium text-teal">
            You save {formatLE(saved)} · {off} off applied automatically
          </p>
          <p className="mt-5 text-base leading-relaxed text-nile-muted">
            {product.description}
          </p>

          <div className="mt-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-nile-muted">
              What&apos;s included
            </h2>
            <ul className="mt-3 space-y-2">
              {product.includes.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-nile-ink"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal/15 text-teal">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <AddToCartButton
              productId={product.id}
              label="Add to cart"
              className="min-h-11 w-full justify-center px-8 py-3 sm:w-auto"
            />
            <Link
              href="/cart"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-nile-ink/15 px-5 py-3 text-sm font-semibold text-nile-ink hover:border-nile hover:text-nile sm:w-auto"
            >
              View cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

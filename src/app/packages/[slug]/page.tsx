import type { Metadata } from "next";
import Image from "next/image";
import { assetPath } from "@/lib/asset-path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ArrowLeft } from "lucide-react";
import { getProductBySlug, products } from "@/lib/products";
import { PriceDisplay } from "@/components/PriceDisplay";
import { StockAwareDetailActions } from "@/components/StockAwareDetailActions";
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
        className="link-soft focus-ring group inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-medium text-silver hover:text-cyan"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Back to catalog
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
        <div
          className={`group/media relative overflow-hidden rounded-[1.75rem] border border-white/10 p-8 text-mist shadow-2xl shadow-black/50 transition-shadow duration-300 hover:shadow-[0_0_60px_-20px_rgb(60_240_216/0.25)] sm:min-h-[380px] sm:p-10 ${
            product.image
              ? "bg-panel"
              : "bg-gradient-to-br from-panel-2 via-ink-2 to-cyan/20"
          }`}
        >
          {product.image ? (
            <Image
              src={assetPath(product.image)!}
              alt={`${product.name} product artwork`}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover/media:scale-105"
            />
          ) : null}
          <div
            className={`absolute inset-0 ${
              product.image
                ? "bg-gradient-to-t from-ink/85 via-ink/30 to-ink/10"
                : "scale-100 opacity-50 transition-transform duration-700 ease-out group-hover/media:scale-110 [background-image:radial-gradient(circle_at_30%_20%,rgb(60_240_216/0.35)_0,transparent_45%),radial-gradient(circle_at_90%_80%,rgb(232_200_114/0.3)_0,transparent_40%)]"
            }`}
          />
          <div className="relative flex h-full flex-col justify-between gap-12">
            <div>
              <span className="rounded-full border border-white/15 bg-ink/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur">
                Digital download
              </span>
              <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
                {product.name}
              </h1>
            </div>
            <p className="text-sm text-silver">
              Instant access after checkout · LE pricing
            </p>
          </div>
        </div>

        <div>
          <PriceDisplay priceLE={product.priceLE} size="lg" />
          <p className="mt-2 text-sm font-medium text-cyan">
            You save {formatLE(saved)} · {off} off applied automatically
          </p>
          <p className="mt-5 text-base leading-relaxed text-silver">
            {product.description}
          </p>

          <div className="mt-8 rounded-2xl border border-white/8 bg-panel/60 p-5">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
              What&apos;s included
            </h2>
            <ul className="mt-4 space-y-2.5">
              {product.includes.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-mist"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan/15 text-cyan">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <StockAwareDetailActions productId={product.id} />
        </div>
      </div>
    </div>
  );
}

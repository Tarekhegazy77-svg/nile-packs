"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatLE } from "@/lib/format";
import { roundMoney, discountPercentLabel } from "@/lib/discount";
import { PriceDisplay } from "./PriceDisplay";
import { useHasMounted } from "@/lib/use-has-mounted";

export function CartView() {
  const mounted = useHasMounted();
  const lineItems = useCartStore((s) => s.lineItems);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotalOriginal = useCartStore((s) => s.subtotalOriginal);
  const subtotalDiscounted = useCartStore((s) => s.subtotalDiscounted);

  const lines = lineItems();
  const original = roundMoney(subtotalOriginal());
  const discounted = roundMoney(subtotalDiscounted());
  const saved = roundMoney(original - discounted);
  const off = discountPercentLabel();

  if (!mounted) {
    return (
      <div className="rounded-2xl border border-nile-ink/8 bg-white px-6 py-16 text-center text-sm text-nile-muted">
        Loading cart…
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-nile-ink/20 bg-white px-5 py-14 text-center sm:px-8 sm:py-16">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-nile/8 text-nile">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-semibold text-nile-ink">
          Your cart is empty
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-nile-muted sm:text-base">
          Pick a package from the catalog — the {off} sale applies automatically
          at checkout. No coupon to remember.
        </p>
        <Link
          href="/packages"
          className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-nile px-6 py-3 text-sm font-semibold text-sand transition hover:bg-nile-deep"
        >
          Browse packages
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:gap-8">
      <ul className="space-y-3 sm:space-y-4">
        {lines.map(({ product, quantity, lineDiscounted }) => (
          <li
            key={product.id}
            className="flex flex-col gap-4 rounded-2xl border border-nile-ink/8 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5"
          >
            <div className="min-w-0 flex-1">
              <Link
                href={`/packages/${product.slug}`}
                className="font-display text-lg font-semibold text-nile-ink hover:text-nile"
              >
                {product.name}
              </Link>
              <div className="mt-1">
                <PriceDisplay priceLE={product.priceLE} size="sm" />
              </div>
              <p className="mt-1 text-xs text-nile-muted">
                Line total {formatLE(roundMoney(lineDiscounted))}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <div className="inline-flex items-center rounded-full border border-nile-ink/15 bg-sand">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  className="inline-flex h-11 w-11 items-center justify-center text-nile-ink transition hover:text-nile"
                  onClick={() => setQuantity(product.id, quantity - 1)}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  className="inline-flex h-11 w-11 items-center justify-center text-nile-ink transition hover:text-nile"
                  onClick={() => setQuantity(product.id, quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                aria-label={`Remove ${product.name}`}
                onClick={() => removeItem(product.id)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-nile-muted transition hover:bg-terracotta/10 hover:text-terracotta"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-2xl border border-nile-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-display text-xl font-semibold text-nile-ink">
          Order summary
        </h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-3 text-nile-muted">
            <dt>Original</dt>
            <dd className="line-through tabular-nums">{formatLE(original)}</dd>
          </div>
          <div className="flex justify-between gap-3 text-teal">
            <dt>You save ({off})</dt>
            <dd className="tabular-nums">−{formatLE(saved)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-nile-ink/10 pt-3 text-base font-bold text-nile-ink">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatLE(discounted)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs leading-relaxed text-nile-muted">
          Site-wide {off} discount applied automatically — no coupon needed.
        </p>
        <Link
          href="/checkout"
          className="mt-6 flex min-h-11 w-full items-center justify-center rounded-full bg-nile py-3 text-sm font-semibold text-sand transition hover:bg-nile-deep"
        >
          Proceed to checkout
        </Link>
      </aside>
    </div>
  );
}

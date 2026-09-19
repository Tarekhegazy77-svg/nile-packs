"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatLE } from "@/lib/format";
import { roundMoney, discountPercentLabel } from "@/lib/discount";
import { PriceDisplay } from "./PriceDisplay";

export function CartView() {
  const {
    ready,
    lines,
    setQuantity,
    removeItem,
    subtotalOriginal,
    subtotalDiscounted,
  } = useCart();

  const original = roundMoney(subtotalOriginal);
  const discounted = roundMoney(subtotalDiscounted);
  const saved = roundMoney(original - discounted);
  const off = discountPercentLabel();

  if (!ready) {
    return (
      <div className="rounded-2xl border border-white/8 bg-panel px-6 py-16 text-center text-sm text-silver">
        Loading cart…
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-panel/60 px-5 py-14 text-center sm:px-8 sm:py-16">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan/20 bg-cyan/10 text-cyan">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-bold text-mist">
          Your cart is empty
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-silver sm:text-base">
          Pick a package from the catalog — the {off} sale applies automatically
          at checkout. No coupon to remember.
        </p>
        <Link
          href="/packages"
          className="btn-shine btn-primary focus-ring mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
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
            className="row-hover flex flex-col gap-4 rounded-2xl border border-white/8 bg-panel p-4 sm:flex-row sm:items-center sm:p-5"
          >
            <div className="min-w-0 flex-1">
              <Link
                href={`/packages/${product.slug}`}
                className="link-soft font-display text-lg font-bold text-mist hover:text-cyan"
              >
                {product.name}
              </Link>
              <div className="mt-1">
                <PriceDisplay priceLE={product.priceLE} size="sm" />
              </div>
              <p className="mt-1 text-xs text-silver">
                Line total {formatLE(roundMoney(lineDiscounted))}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <div className="inline-flex items-center rounded-full border border-white/12 bg-ink-2">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full text-mist transition-all duration-150 hover:scale-110 hover:text-cyan active:scale-95"
                  onClick={() => setQuantity(product.id, quantity - 1)}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-8 text-center text-sm font-semibold tabular-nums text-mist">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full text-mist transition-all duration-150 hover:scale-110 hover:text-cyan active:scale-95"
                  onClick={() => setQuantity(product.id, quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                aria-label={`Remove ${product.name}`}
                onClick={() => removeItem(product.id)}
                className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full text-silver transition-all duration-150 hover:scale-110 hover:bg-danger/10 hover:text-danger active:scale-95"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <aside className="glass-panel h-fit rounded-2xl p-5 sm:p-6">
        <h2 className="font-display text-xl font-bold text-mist">
          Order summary
        </h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-3 text-silver">
            <dt>Original</dt>
            <dd className="line-through tabular-nums">{formatLE(original)}</dd>
          </div>
          <div className="flex justify-between gap-3 text-cyan">
            <dt>You save ({off})</dt>
            <dd className="tabular-nums">−{formatLE(saved)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-white/10 pt-3 text-base font-bold text-mist">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatLE(discounted)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs leading-relaxed text-silver">
          Site-wide {off} discount applied automatically — no coupon needed.
        </p>
        <Link
          href="/checkout"
          className="btn-shine btn-primary focus-ring mt-6 flex min-h-11 w-full items-center justify-center rounded-full py-3 text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          Proceed to checkout
        </Link>
      </aside>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatLE } from "@/lib/format";
import { roundMoney } from "@/lib/discount";
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

  if (!mounted) {
    return (
      <div className="rounded-2xl border border-nile-ink/8 bg-white px-6 py-16 text-center text-sm text-nile-muted">
        Loading cart…
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-nile-ink/20 bg-white px-6 py-16 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-nile-muted" />
        <h2 className="mt-4 font-display text-2xl font-semibold text-nile-ink">
          Your cart is empty
        </h2>
        <p className="mt-2 text-nile-muted">
          Browse the catalog and add a package — the 40% sale applies
          automatically.
        </p>
        <Link
          href="/packages"
          className="mt-6 inline-flex rounded-full bg-nile px-5 py-2.5 text-sm font-semibold text-sand hover:bg-nile-deep"
        >
          Browse packages
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <ul className="space-y-4">
        {lines.map(({ product, quantity, lineDiscounted }) => (
          <li
            key={product.id}
            className="flex flex-col gap-4 rounded-2xl border border-nile-ink/8 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="flex-1">
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

            <div className="flex items-center gap-3">
              <div className="inline-flex items-center rounded-full border border-nile-ink/15 bg-sand">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  className="p-2 text-nile-ink hover:text-nile"
                  onClick={() => setQuantity(product.id, quantity - 1)}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-8 text-center text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  className="p-2 text-nile-ink hover:text-nile"
                  onClick={() => setQuantity(product.id, quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                aria-label={`Remove ${product.name}`}
                onClick={() => removeItem(product.id)}
                className="rounded-full p-2 text-nile-muted transition hover:bg-terracotta/10 hover:text-terracotta"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-2xl border border-nile-ink/8 bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-semibold text-nile-ink">
          Order summary
        </h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-nile-muted">
            <dt>Original</dt>
            <dd className="line-through">{formatLE(original)}</dd>
          </div>
          <div className="flex justify-between text-teal">
            <dt>You save (40%)</dt>
            <dd>−{formatLE(saved)}</dd>
          </div>
          <div className="flex justify-between border-t border-nile-ink/10 pt-3 text-base font-bold text-nile-ink">
            <dt>Total</dt>
            <dd>{formatLE(discounted)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-nile-muted">
          Site-wide 40% discount applied automatically — no coupon needed.
        </p>
        <Link
          href="/checkout"
          className="mt-6 flex w-full items-center justify-center rounded-full bg-nile py-3 text-sm font-semibold text-sand transition hover:bg-nile-deep"
        >
          Proceed to checkout
        </Link>
      </aside>
    </div>
  );
}

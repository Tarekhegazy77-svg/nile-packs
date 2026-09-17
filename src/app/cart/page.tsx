import type { Metadata } from "next";
import { CartView } from "@/components/CartView";
import { discountPercentLabel } from "@/lib/discount";

export const metadata: Metadata = {
  title: "Cart",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-nile-ink sm:text-4xl">
        Your cart
      </h1>
      <p className="mt-2 text-sm text-nile-muted sm:text-base">
        Quantities and totals use the automatic {discountPercentLabel()} sale
        price — no coupon required.
      </p>
      <div className="mt-6 sm:mt-8">
        <CartView />
      </div>
    </div>
  );
}

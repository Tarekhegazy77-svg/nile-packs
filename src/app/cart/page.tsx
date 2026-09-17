import type { Metadata } from "next";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = {
  title: "Cart",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-4xl font-semibold text-nile-ink">
        Your cart
      </h1>
      <p className="mt-2 text-nile-muted">
        Quantities and totals use the automatic 40% sale price.
      </p>
      <div className="mt-8">
        <CartView />
      </div>
    </div>
  );
}

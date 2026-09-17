import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-nile-ink sm:text-4xl">
        Checkout
      </h1>
      <p className="mt-2 text-sm text-nile-muted sm:text-base">
        Demo payment only — sale totals in LE are simulated, not charged.
      </p>
      <div className="mt-6 sm:mt-8">
        <CheckoutForm />
      </div>
    </div>
  );
}

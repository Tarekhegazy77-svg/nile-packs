import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-4xl font-semibold text-nile-ink">
        Checkout
      </h1>
      <p className="mt-2 text-nile-muted">
        Demo payment only — discounted LE totals are charged in simulation.
      </p>
      <div className="mt-8">
        <CheckoutForm />
      </div>
    </div>
  );
}

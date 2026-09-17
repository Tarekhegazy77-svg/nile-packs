import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  const live = Boolean(
    (process.env.NEXT_PUBLIC_PAYMOB_API_BASE || "").trim()
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-nile-ink sm:text-4xl">
        Checkout
      </h1>
      <p className="mt-2 text-sm text-nile-muted sm:text-base">
        Paymob checkout is on this page (EGP, 40% off applied). Live card charges stay off until you enable the Worker with keys.
      </p>
      <div className="mt-6 sm:mt-8">
        <CheckoutForm />
      </div>
    </div>
  );
}

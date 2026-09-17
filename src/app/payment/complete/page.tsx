import type { Metadata } from "next";
import { PaymentCompleteView } from "@/components/PaymentCompleteView";

export const metadata: Metadata = {
  title: "Payment complete",
};

export default function PaymentCompletePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <PaymentCompleteView />
    </div>
  );
}

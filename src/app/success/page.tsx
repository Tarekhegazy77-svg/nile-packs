import type { Metadata } from "next";
import { SuccessView } from "@/components/SuccessView";

export const metadata: Metadata = {
  title: "Order complete",
};

export default function SuccessPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <SuccessView />
    </div>
  );
}

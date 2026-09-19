import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import { discountPercentLabel } from "@/lib/discount";

export default function NotFound() {
  const off = discountPercentLabel();

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center sm:py-28">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan/25 bg-cyan/10 text-cyan shadow-[0_0_30px_rgb(60_240_216/0.2)]">
        <Compass className="h-7 w-7" />
      </div>
      <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
        404
      </p>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-mist sm:text-4xl">
        That page drifted away
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-silver sm:text-base">
        The link may be outdated, or the package never existed. Head back to the
        catalog — every download is still {off} off with no coupon.
      </p>
      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link
          href="/packages"
          className="btn-shine btn-primary focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
        >
          Browse packages
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/"
          className="btn-ghost focus-ring inline-flex min-h-11 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

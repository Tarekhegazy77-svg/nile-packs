import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import { discountPercentLabel } from "@/lib/discount";

export default function NotFound() {
  const off = discountPercentLabel();

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center sm:py-24">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-nile/8 text-nile">
        <Compass className="h-7 w-7" />
      </div>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
        404
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-nile-ink sm:text-4xl">
        That page drifted away
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-nile-muted sm:text-base">
        The link may be outdated, or the package never existed. Head back to the
        catalog — every download is still {off} off with no coupon.
      </p>
      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link
          href="/packages"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-nile px-6 py-3 text-sm font-semibold text-sand transition hover:bg-nile-deep"
        >
          Browse packages
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-nile-ink/15 px-6 py-3 text-sm font-semibold text-nile-ink transition hover:border-nile hover:text-nile"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

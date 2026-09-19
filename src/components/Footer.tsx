"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { discountPercentLabel } from "@/lib/discount";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="mt-auto border-t border-white/8 bg-ink-2/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-12 sm:px-6">
        <div className="sm:col-span-5">
          <p className="font-display text-2xl font-bold tracking-tight text-mist">
            Nile Packs
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-silver">
            Editorial digital commerce for creators and studios. Prices in
            Egyptian pounds — automatic {discountPercentLabel()} off, always
            on. No coupon theater.
          </p>
        </div>
        <div className="sm:col-span-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            Explore
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/" className="link-soft text-silver hover:text-mist">
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/packages"
                className="link-soft text-silver hover:text-mist"
              >
                All packages
              </Link>
            </li>
            <li>
              <Link
                href="/cart"
                className="link-soft text-silver hover:text-mist"
              >
                Cart
              </Link>
            </li>
          </ul>
        </div>
        <div className="sm:col-span-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            Note
          </p>
          <p className="mt-4 text-sm leading-relaxed text-silver">
            Demo storefront — payments are simulated unless Paymob is live.
            Downloads on the success page are stubs for local testing.
          </p>
        </div>
      </div>
      <div className="border-t border-white/6 py-4 text-center text-xs text-silver/60">
        © {new Date().getFullYear()} Nile Packs · Obsidian Nile
      </div>
    </footer>
  );
}

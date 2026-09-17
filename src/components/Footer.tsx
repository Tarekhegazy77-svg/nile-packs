"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { discountPercentLabel } from "@/lib/discount";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="mt-auto border-t border-nile-ink/8 bg-nile-ink text-sand/80">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-display text-xl font-semibold text-sand">Nile Packs</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-sand/60">
            Instant digital packages for creators and studios. Prices in Egyptian
            pounds — automatic {discountPercentLabel()} off, always on.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">
            Explore
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/" className="link-soft text-sand/70 hover:text-sand">
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/packages"
                className="link-soft text-sand/70 hover:text-sand"
              >
                All packages
              </Link>
            </li>
            <li>
              <Link
                href="/cart"
                className="link-soft text-sand/70 hover:text-sand"
              >
                Cart
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">
            Note
          </p>
          <p className="mt-3 text-sm leading-relaxed text-sand/60">
            Demo storefront — payments are simulated. Downloads on the success
            page are stubs for local testing.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-sand/40">
        © {new Date().getFullYear()} Nile Packs · Built for demo use
      </div>
    </footer>
  );
}

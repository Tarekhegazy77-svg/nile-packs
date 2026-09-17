"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function Header() {
  const pathname = usePathname();
  const { ready, totalItems } = useCart();
  const count = ready ? totalItems : 0;

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-nile-ink/8 bg-sand/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="group focus-ring flex min-w-0 items-center gap-2.5 rounded-xl transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
          aria-label="Nile Packs home"
        >
          <span className="logo-mark flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-nile text-sand shadow-sm group-hover:bg-nile-deep">
            <Package className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <div className="min-w-0 leading-tight">
            <span className="block truncate font-display text-base font-semibold tracking-tight text-nile-ink transition-colors duration-200 group-hover:text-nile sm:text-lg">
              Nile Packs
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.16em] text-nile-muted sm:block">
              Digital downloads · LE
            </span>
          </div>
        </Link>

        <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/packages"
            className="nav-underline focus-ring inline-flex min-h-11 items-center rounded-full px-3 py-2 text-sm font-medium text-nile-ink/80 transition-colors duration-200 hover:bg-nile/8 hover:text-nile sm:px-4"
          >
            Catalog
          </Link>
          <Link
            href="/cart"
            className="btn-shine focus-ring relative inline-flex min-h-11 items-center gap-2 rounded-full bg-nile-ink px-3.5 py-2 text-sm font-semibold text-sand shadow-sm transition-all duration-200 hover:scale-[1.03] hover:bg-nile hover:shadow-lg hover:shadow-nile/35 active:scale-[0.98] sm:px-4"
            aria-label={`Cart with ${count} items`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-saffron px-1 text-[11px] font-bold text-nile-ink shadow transition-transform duration-200 group-hover:scale-105">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

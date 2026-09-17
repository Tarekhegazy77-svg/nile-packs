"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, Package } from "lucide-react";
import { useCartStore } from "@/store/cart";

export function Header() {
  const totalItems = useCartStore((s) => s.totalItems);
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCount(totalItems());
    return useCartStore.subscribe(() => {
      setCount(useCartStore.getState().totalItems());
    });
  }, [totalItems]);

  return (
    <header className="sticky top-0 z-50 border-b border-nile-ink/8 bg-sand/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 group"
          aria-label="Nile Packs home"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-nile text-sand shadow-sm transition group-hover:bg-nile-deep">
            <Package className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <div className="min-w-0 leading-tight">
            <span className="block truncate font-display text-base font-semibold tracking-tight text-nile-ink sm:text-lg">
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
            className="inline-flex min-h-11 items-center rounded-full px-3 py-2 text-sm font-medium text-nile-ink/80 transition hover:bg-nile/5 hover:text-nile sm:px-4"
          >
            Catalog
          </Link>
          <Link
            href="/cart"
            className="relative inline-flex min-h-11 items-center gap-2 rounded-full bg-nile-ink px-3.5 py-2 text-sm font-semibold text-sand transition hover:bg-nile sm:px-4"
            aria-label={`Cart with ${mounted ? count : 0} items`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {mounted && count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-saffron px-1 text-[11px] font-bold text-nile-ink shadow">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

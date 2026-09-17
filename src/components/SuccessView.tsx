"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, CheckCircle2, Package, ArrowRight } from "lucide-react";
import { formatLE } from "@/lib/format";

type OrderItem = {
  id: string;
  slug: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

type Order = {
  name: string;
  email: string;
  total: number;
  items: OrderItem[];
  createdAt: string;
};

export function SuccessView() {
  const [order, setOrder] = useState<Order | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("packages-store-last-order");
      if (raw) setOrder(JSON.parse(raw) as Order);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="rounded-2xl border border-nile-ink/8 bg-white px-6 py-16 text-center text-nile-muted">
        Loading your order…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-2xl border border-dashed border-nile-ink/20 bg-white px-5 py-14 text-center sm:px-8 sm:py-16">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-nile/8 text-nile">
          <Package className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-semibold text-nile-ink">
          No recent order found
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-nile-muted sm:text-base">
          Complete checkout to see your order here. Live Paymob payments
          confirm on /payment/complete instead.
        </p>
        <Link
          href="/packages"
          className="btn-shine focus-ring mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-nile px-6 py-3 text-sm font-semibold text-sand shadow-md shadow-nile/20 transition-all duration-200 hover:scale-[1.03] hover:bg-nile-deep hover:shadow-lg hover:shadow-nile/35 active:scale-[0.98]"
        >
          Browse packages
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="rounded-2xl border border-teal/20 bg-gradient-to-br from-teal/10 to-white p-6 text-center shadow-sm sm:p-8">
        <CheckCircle2 className="mx-auto h-12 w-12 text-teal" />
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-teal">
          Order complete
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-nile-ink sm:text-4xl">
          You are all set
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-nile-muted sm:text-base">
          Thanks, {order.name}. In a live store a receipt would go to{" "}
          <span className="font-medium text-nile-ink">{order.email}</span>.
        </p>
        <p className="mt-3 inline-flex rounded-full bg-white/80 px-3 py-1.5 text-sm font-semibold text-nile ring-1 ring-nile/10">
          Total: {formatLE(order.total)}
        </p>
        <p className="mt-3 text-xs text-nile-muted">
          Demo checkout — no real payment was processed. Live payments use
          Paymob and land on /payment/complete.
        </p>
      </div>

      <section className="rounded-2xl border border-nile-ink/8 bg-white p-5 shadow-sm sm:p-8">
        <h2 className="font-display text-xl font-semibold text-nile-ink">
          Your downloads
        </h2>
        <p className="mt-1 text-sm text-nile-muted">
          Stub links for local demo — they do not download real files.
        </p>
        <ul className="mt-6 space-y-3">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="row-hover flex flex-col gap-3 rounded-xl border border-nile-ink/8 bg-sand/60 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-nile-ink">{item.name}</p>
                <p className="text-xs text-nile-muted">
                  Qty {item.quantity} · {formatLE(item.unitPrice)} each (sale)
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  alert(
                    `Demo stub: "${item.name}" would download here.\nFile: ${item.slug}.zip`
                  );
                }}
                className="btn-shine focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-nile px-4 py-2.5 text-sm font-semibold text-sand shadow-sm shadow-nile/20 transition-all duration-200 hover:scale-[1.03] hover:bg-nile-deep hover:shadow-md hover:shadow-nile/35 active:scale-[0.98] sm:w-auto"
              >
                <Download className="h-4 w-4" />
                Download .zip
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
        <Link
          href="/packages"
          className="btn-shine focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-nile px-6 py-3 text-sm font-semibold text-sand shadow-md shadow-nile/20 transition-all duration-200 hover:scale-[1.03] hover:bg-nile-deep hover:shadow-lg hover:shadow-nile/35 active:scale-[0.98]"
        >
          Continue shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/"
          className="link-soft text-sm font-medium text-nile"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

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
      <div className="rounded-2xl border border-white/8 bg-panel px-6 py-16 text-center text-silver">
        Loading your order…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-panel/60 px-5 py-14 text-center sm:px-8 sm:py-16">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan/20 bg-cyan/10 text-cyan">
          <Package className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold text-mist">
          No recent order found
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-silver sm:text-base">
          Complete checkout to see your order here. Live Paymob payments
          confirm on /payment/complete instead.
        </p>
        <Link
          href="/packages"
          className="btn-shine btn-primary focus-ring mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
        >
          Browse packages
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="glass-panel rounded-2xl border border-cyan/20 p-6 text-center sm:p-8">
        <CheckCircle2 className="mx-auto h-12 w-12 text-cyan drop-shadow-[0_0_16px_rgb(60_240_216/0.5)]" />
        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan">
          Order complete
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-mist sm:text-4xl">
          You are all set
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-silver sm:text-base">
          Thanks, {order.name}. In a live store a receipt would go to{" "}
          <span className="font-medium text-mist">{order.email}</span>.
        </p>
        <p className="mt-3 inline-flex rounded-full border border-cyan/25 bg-cyan/10 px-3 py-1.5 text-sm font-semibold text-cyan">
          Total: {formatLE(order.total)}
        </p>
        <p className="mt-3 text-xs text-silver">
          Demo checkout — no real payment was processed. Live payments use
          Paymob and land on /payment/complete.
        </p>
      </div>

      <section className="glass-panel rounded-2xl p-5 sm:p-8">
        <h2 className="font-display text-xl font-bold text-mist">
          Your downloads
        </h2>
        <p className="mt-1 text-sm text-silver">
          Stub links for local demo — they do not download real files.
        </p>
        <ul className="mt-6 space-y-3">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="row-hover flex flex-col gap-3 rounded-xl border border-white/8 bg-ink-2/80 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-mist">{item.name}</p>
                <p className="text-xs text-silver">
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
                className="btn-shine btn-primary focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] sm:w-auto"
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
          className="btn-shine btn-primary focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
        >
          Continue shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/" className="link-soft text-sm font-medium text-cyan">
          Back to home
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, CheckCircle2, Package } from "lucide-react";
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
      <div className="rounded-2xl border border-dashed border-nile-ink/20 bg-white px-6 py-16 text-center">
        <Package className="mx-auto h-10 w-10 text-nile-muted" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-nile-ink">
          No recent order found
        </h1>
        <p className="mt-2 text-sm text-nile-muted">
          Complete a demo checkout to see stub download links here.
        </p>
        <Link
          href="/packages"
          className="mt-6 inline-flex rounded-full bg-nile px-5 py-2.5 text-sm font-semibold text-sand"
        >
          Browse packages
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-teal/20 bg-gradient-to-br from-teal/10 to-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-12 w-12 text-teal" />
        <h1 className="mt-4 font-display text-3xl font-semibold text-nile-ink sm:text-4xl">
          Payment successful
        </h1>
        <p className="mt-2 text-nile-muted">
          Thanks, {order.name}. A confirmation would go to{" "}
          <span className="font-medium text-nile-ink">{order.email}</span>.
        </p>
        <p className="mt-1 text-sm font-semibold text-nile">
          Total charged (demo): {formatLE(order.total)}
        </p>
      </div>

      <section className="rounded-2xl border border-nile-ink/8 bg-white p-6 shadow-sm sm:p-8">
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
              className="flex flex-col gap-3 rounded-xl border border-nile-ink/8 bg-sand/60 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-nile-ink">{item.name}</p>
                <p className="text-xs text-nile-muted">
                  Qty {item.quantity} · {formatLE(item.unitPrice)} each (sale)
                </p>
              </div>
              <a
                href={`#download-${item.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  alert(
                    `Demo stub: "${item.name}" would download here.\nFile: ${item.slug}.zip`
                  );
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-nile px-4 py-2 text-sm font-semibold text-sand hover:bg-nile-deep"
              >
                <Download className="h-4 w-4" />
                Download .zip
              </a>
            </li>
          ))}
        </ul>
      </section>

      <div className="text-center">
        <Link
          href="/packages"
          className="text-sm font-medium text-nile hover:underline"
        >
          Continue shopping →
        </Link>
      </div>
    </div>
  );
}

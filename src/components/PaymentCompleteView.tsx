"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Loader2,
  Package,
  ArrowRight,
  AlertCircle,
  Download,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatLE } from "@/lib/format";
import {
  fetchOrderStatus,
  isPaymobLive,
  type OrderStatusResponse,
} from "@/lib/paymob";

const LAST_ORDER_KEY = "packages-store-last-order";
const PENDING_ORDER_KEY = "packages-store-pending-order";

type PendingSnapshot = {
  name?: string;
  email?: string;
  phone?: string;
  total?: number;
  merchantOrderId?: string;
  items?: Array<{
    id?: string;
    slug?: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
};

function readQueryId(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const keys = [
    "merchantOrderId",
    "merchant_order_id",
    "special_reference",
    "order",
    "id",
  ];
  for (const k of keys) {
    const v = params.get(k);
    if (v && v.trim()) return v.trim();
  }
  return null;
}

function readPending(): PendingSnapshot | null {
  try {
    const raw = sessionStorage.getItem(PENDING_ORDER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingSnapshot;
  } catch {
    return null;
  }
}

export function PaymentCompleteView() {
  const live = isPaymobLive();
  const { clearCart } = useCart();
  const clearedRef = useRef(false);
  const pendingRef = useRef<PendingSnapshot | null>(null);

  const [ready, setReady] = useState(false);
  const [merchantOrderId, setMerchantOrderId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingSnapshot | null>(null);
  const [order, setOrder] = useState<OrderStatusResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fromQuery = readQueryId();
    const snap = readPending();
    pendingRef.current = snap;
    setPending(snap);
    const id = fromQuery || snap?.merchantOrderId || null;
    setMerchantOrderId(id);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !live || !merchantOrderId) return;

    let cancelled = false;
    let timer: number | undefined;
    let attempts = 0;
    const maxAttempts = 40;

    async function poll() {
      attempts += 1;
      try {
        const data = await fetchOrderStatus(merchantOrderId!);
        if (cancelled) return;
        setOrder(data);
        setError("");

        if (data.status === "paid") {
          if (!clearedRef.current) {
            clearedRef.current = true;
            clearCart();
            const snap = pendingRef.current;
            try {
              const snapshot = {
                name: data.name || snap?.name || "",
                email: data.email || snap?.email || "",
                total:
                  data.amountCents != null
                    ? data.amountCents / 100
                    : snap?.total ?? 0,
                items: data.items?.length ? data.items : snap?.items || [],
                createdAt: new Date().toISOString(),
                merchantOrderId: data.merchantOrderId,
                live: true,
              };
              sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(snapshot));
              sessionStorage.removeItem(PENDING_ORDER_KEY);
            } catch {
              /* ignore */
            }
          }
          return;
        }

        if (data.status === "failed") return;

        if (attempts < maxAttempts) {
          timer = window.setTimeout(poll, 3000);
        }
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Could not verify payment"
        );
        if (attempts < maxAttempts) {
          timer = window.setTimeout(poll, 4000);
        }
      }
    }

    poll();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [ready, live, merchantOrderId, clearCart]);

  const displayName = order?.name || pending?.name || "";
  const displayEmail = order?.email || pending?.email || "";
  const displayItems = useMemo(() => {
    if (order?.items?.length) return order.items;
    return pending?.items || [];
  }, [order, pending]);
  const displayTotal =
    order?.amountCents != null
      ? order.amountCents / 100
      : pending?.total ?? null;

  if (!ready) {
    return (
      <div className="rounded-2xl border border-white/8 bg-panel px-6 py-16 text-center text-silver">
        Loading payment status…
      </div>
    );
  }

  if (!live) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-panel/60 px-5 py-14 text-center sm:px-8 sm:py-16">
        <AlertCircle className="mx-auto h-10 w-10 text-danger" />
        <h1 className="mt-5 font-display text-2xl font-bold text-mist">
          Paymob is not configured
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-silver">
          Set <code className="text-xs">NEXT_PUBLIC_PAYMOB_API_BASE</code> and
          rebuild to enable live payment confirmation.
        </p>
        <Link
          href="/checkout"
          className="btn-shine btn-primary focus-ring mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold"
        >
          Back to checkout
        </Link>
      </div>
    );
  }

  if (!merchantOrderId) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-panel/60 px-5 py-14 text-center sm:px-8 sm:py-16">
        <Package className="mx-auto h-10 w-10 text-cyan" />
        <h1 className="mt-5 font-display text-2xl font-bold text-mist">
          Missing order reference
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-silver">
          We could not find a merchant order id in the URL. If you just paid,
          return from Paymob or contact support with your receipt.
        </p>
        <Link
          href="/packages"
          className="btn-shine btn-primary focus-ring mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold"
        >
          Browse packages
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const status = order?.status || "pending";

  if (status === "paid") {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="rounded-2xl glass-panel border border-cyan/20 p-6 text-center sm:p-8">
          <CheckCircle2 className="mx-auto h-12 w-12 text-cyan" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-cyan">
            Payment confirmed
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-mist sm:text-4xl">
            You are all set
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-silver sm:text-base">
            {displayName ? `Thanks, ${displayName}. ` : "Thanks. "}
            {displayEmail ? (
              <>
                A receipt will go to{" "}
                <span className="font-medium text-mist">{displayEmail}</span>
                .
              </>
            ) : null}
          </p>
          {displayTotal != null && (
            <p className="mt-3 inline-flex rounded-full border border-cyan/25 bg-cyan/10 px-3 py-1.5 text-sm font-semibold text-cyan">
              Paid: {formatLE(displayTotal)}
            </p>
          )}
          <p className="mt-3 text-xs text-silver">
            Order {merchantOrderId}
          </p>
        </div>

        {displayItems.length > 0 && (
          <section className="rounded-2xl border border-white/8 bg-panel p-5 sm:p-8">
            <h2 className="font-display text-xl font-bold text-mist">
              Your packages
            </h2>
            <p className="mt-1 text-sm text-silver">
              Download delivery is still stubbed — wire real files when ready.
            </p>
            <ul className="mt-6 space-y-3">
              {displayItems.map((item, idx) => (
                <li
                  key={item.id || item.slug || `${item.name}-${idx}`}
                  className="row-hover flex flex-col gap-3 rounded-xl border border-white/8 bg-ink-2/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-mist">{item.name}</p>
                    <p className="text-xs text-silver">
                      Qty {item.quantity}
                      {item.unitPrice != null
                        ? ` · ${formatLE(item.unitPrice)} each`
                        : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      alert(
                        `Download stub: "${item.name}"\nFile: ${(item.slug || "package").toString()}.zip`
                      );
                    }}
                    className="btn-shine btn-primary focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold sm:w-auto"
                  >
                    <Download className="h-4 w-4" />
                    Download .zip
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
          <Link
            href="/packages"
            className="btn-shine btn-primary focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold"
          >
            Continue shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="rounded-2xl border border-danger/30 bg-panel px-5 py-14 text-center sm:px-8 sm:py-16">
        <AlertCircle className="mx-auto h-10 w-10 text-danger" />
        <h1 className="mt-5 font-display text-2xl font-bold text-mist">
          Payment not completed
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-silver">
          Paymob reported this payment as unsuccessful. You can try again from
          checkout — nothing was charged for a failed attempt.
        </p>
        <p className="mt-3 text-xs text-silver">Order {merchantOrderId}</p>
        <Link
          href="/checkout"
          className="btn-shine btn-primary focus-ring mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold"
        >
          Return to checkout
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-panel px-5 py-14 text-center sm:px-8 sm:py-16">
      <Loader2 className="mx-auto h-10 w-10 animate-spin text-cyan" />
      <h1 className="mt-5 font-display text-2xl font-bold text-mist">
        Confirming your payment…
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-sm text-silver">
        Waiting for Paymob’s secure webhook. This usually takes a few seconds.
        Keep this tab open.
      </p>
      <p className="mt-3 text-xs text-silver">Order {merchantOrderId}</p>
      {error && (
        <p className="mt-4 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

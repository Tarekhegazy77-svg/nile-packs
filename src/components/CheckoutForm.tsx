"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { formatLE } from "@/lib/format";
import { roundMoney } from "@/lib/discount";
import { CreditCard, Loader2 } from "lucide-react";

export function CheckoutForm() {
  const router = useRouter();
  const lineItems = useCartStore((s) => s.lineItems);
  const subtotalDiscounted = useCartStore((s) => s.subtotalDiscounted);
  const subtotalOriginal = useCartStore((s) => s.subtotalOriginal);
  const clearCart = useCartStore((s) => s.clearCart);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const lines = lineItems();
  const total = roundMoney(subtotalDiscounted());
  const original = roundMoney(subtotalOriginal());
  const saved = roundMoney(original - total);

  if (lines.length === 0 && !paying) {
    return (
      <div className="rounded-2xl border border-dashed border-nile-ink/20 bg-white px-6 py-12 text-center">
        <p className="font-display text-xl font-semibold text-nile-ink">
          Nothing to check out
        </p>
        <p className="mt-2 text-sm text-nile-muted">
          Add packages to your cart first.
        </p>
        <a
          href="/packages"
          className="mt-5 inline-flex rounded-full bg-nile px-5 py-2.5 text-sm font-semibold text-sand"
        >
          Browse packages
        </a>
      </div>
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setPaying(true);
    const order = {
      name: name.trim(),
      email: email.trim(),
      total,
      items: lines.map((l) => ({
        id: l.product.id,
        slug: l.product.slug,
        name: l.product.name,
        quantity: l.quantity,
        unitPrice: roundMoney(l.lineDiscounted / l.quantity),
      })),
      createdAt: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem("packages-store-last-order", JSON.stringify(order));
    } catch {
      /* ignore storage errors in demo */
    }

    window.setTimeout(() => {
      clearCart();
      router.push("/success");
    }, 900);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-nile-ink/8 bg-white p-6 shadow-sm sm:p-8"
      >
        <h2 className="font-display text-2xl font-semibold text-nile-ink">
          Your details
        </h2>
        <p className="mt-1 text-sm text-nile-muted">
          Demo checkout — no real payment is processed.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-nile-muted">
              Full name
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="mt-1.5 w-full rounded-xl border border-nile-ink/15 bg-sand px-4 py-3 text-nile-ink outline-none transition focus:border-nile focus:ring-2 focus:ring-nile/20"
              placeholder="Tarek Hegazy"
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-nile-muted">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-1.5 w-full rounded-xl border border-nile-ink/15 bg-sand px-4 py-3 text-nile-ink outline-none transition focus:border-nile focus:ring-2 focus:ring-nile/20"
              placeholder="you@example.com"
              required
            />
          </label>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={paying}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-nile py-3.5 text-sm font-semibold text-sand transition hover:bg-nile-deep disabled:opacity-70"
        >
          {paying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Pay {formatLE(total)} (demo)
            </>
          )}
        </button>
      </form>

      <aside className="h-fit rounded-2xl border border-nile-ink/8 bg-white p-6 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-nile-ink">
          Order
        </h3>
        <ul className="mt-4 space-y-3 text-sm">
          {lines.map((l) => (
            <li key={l.product.id} className="flex justify-between gap-3">
              <span className="text-nile-ink">
                {l.product.name}{" "}
                <span className="text-nile-muted">×{l.quantity}</span>
              </span>
              <span className="shrink-0 font-medium">
                {formatLE(roundMoney(l.lineDiscounted))}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-nile-ink/10 pt-4 text-sm">
          <div className="flex justify-between text-nile-muted">
            <dt>Original</dt>
            <dd className="line-through">{formatLE(original)}</dd>
          </div>
          <div className="flex justify-between text-teal">
            <dt>Saved</dt>
            <dd>−{formatLE(saved)}</dd>
          </div>
          <div className="flex justify-between text-base font-bold text-nile-ink">
            <dt>Total due</dt>
            <dd>{formatLE(total)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}

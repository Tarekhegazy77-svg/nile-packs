"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCartStore,
  getCartLineItems,
  getCartSubtotalOriginal,
  getCartSubtotalDiscounted,
} from "@/store/cart";
import { formatLE } from "@/lib/format";
import { roundMoney, discountPercentLabel } from "@/lib/discount";
import { CreditCard, Loader2, ShoppingBag, ArrowRight, Info } from "lucide-react";

type FieldErrors = {
  name?: string;
  email?: string;
};

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const clearCart = useCartStore((s) => s.clearCart);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [paying, setPaying] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");

  const lines = getCartLineItems(items);
  const total = roundMoney(getCartSubtotalDiscounted(items));
  const original = roundMoney(getCartSubtotalOriginal(items));
  const saved = roundMoney(original - total);
  const off = discountPercentLabel();

  if (!hasHydrated) {
    return (
      <div className="rounded-2xl border border-nile-ink/8 bg-white px-6 py-12 text-center text-sm text-nile-muted">
        Loading checkout…
      </div>
    );
  }

  if (lines.length === 0 && !paying) {
    return (
      <div className="rounded-2xl border border-dashed border-nile-ink/20 bg-white px-5 py-14 text-center sm:px-8 sm:py-16">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-nile/8 text-nile">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-semibold text-nile-ink">
          Nothing to check out
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-nile-muted sm:text-base">
          Your cart is empty. Add a package first — then you can run the demo
          payment with the {off} sale already applied.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/packages"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-nile px-6 py-3 text-sm font-semibold text-sand shadow-md shadow-nile/20 transition-all duration-200 hover:scale-[1.03] hover:bg-nile-deep hover:shadow-lg hover:shadow-nile/30 active:scale-[0.98]"
          >
            Browse packages
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/cart"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-nile-ink/15 px-6 py-3 text-sm font-semibold text-nile-ink transition-all duration-200 hover:scale-[1.02] hover:border-nile hover:bg-nile/5 hover:text-nile active:scale-[0.98]"
          >
            View cart
          </Link>
        </div>
      </div>
    );
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!name.trim()) {
      next.name = "Enter your full name.";
    }
    if (!email.trim()) {
      next.email = "Enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "That email does not look valid — check for typos.";
    }
    return next;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const next = validate();
    setFieldErrors(next);
    if (Object.keys(next).length > 0) {
      setFormError("Please fix the highlighted fields before continuing.");
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
    <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:gap-8">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl border border-nile-ink/8 bg-white p-5 shadow-sm sm:p-8"
      >
        <div className="flex items-start gap-3 rounded-xl border border-saffron/40 bg-saffron/10 px-3.5 py-3 text-sm text-nile-ink sm:px-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
          <div>
            <p className="font-semibold">Demo payment — no real charge</p>
            <p className="mt-0.5 text-nile-muted">
              This checkout simulates a card payment. Nothing is billed and no
              payment provider is connected.
            </p>
          </div>
        </div>

        <h2 className="mt-6 font-display text-2xl font-semibold text-nile-ink">
          Your details
        </h2>
        <p className="mt-1 text-sm text-nile-muted">
          We only use these for the demo confirmation screen.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-nile-muted">
              Full name
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) {
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              autoComplete="name"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
              className={`mt-1.5 w-full rounded-xl border bg-sand px-4 py-3 text-base text-nile-ink outline-none transition duration-150 focus:ring-2 sm:text-sm ${
                fieldErrors.name
                  ? "border-terracotta focus:border-terracotta focus:ring-terracotta/20"
                  : "border-nile-ink/15 focus:border-nile focus:ring-nile/20"
              }`}
              placeholder="Your name"
            />
            {fieldErrors.name && (
              <p id="name-error" className="mt-1.5 text-sm text-terracotta">
                {fieldErrors.name}
              </p>
            )}
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-nile-muted">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              autoComplete="email"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              className={`mt-1.5 w-full rounded-xl border bg-sand px-4 py-3 text-base text-nile-ink outline-none transition duration-150 focus:ring-2 sm:text-sm ${
                fieldErrors.email
                  ? "border-terracotta focus:border-terracotta focus:ring-terracotta/20"
                  : "border-nile-ink/15 focus:border-nile focus:ring-nile/20"
              }`}
              placeholder="you@example.com"
            />
            {fieldErrors.email && (
              <p id="email-error" className="mt-1.5 text-sm text-terracotta">
                {fieldErrors.email}
              </p>
            )}
          </label>
        </div>

        {formError && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-terracotta/10 px-3 py-2.5 text-sm text-terracotta"
          >
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={paying}
          className="mt-8 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-nile py-3.5 text-sm font-semibold text-sand shadow-md shadow-nile/20 transition-all duration-200 hover:scale-[1.02] hover:bg-nile-deep hover:shadow-lg hover:shadow-nile/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
        >
          {paying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Simulating payment…
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Pay {formatLE(total)} · demo only
            </>
          )}
        </button>
        <p className="mt-3 text-center text-xs leading-relaxed text-nile-muted">
          By continuing you acknowledge this is a local demo — no card details
          are collected.
        </p>
      </form>

      <aside className="h-fit rounded-2xl border border-nile-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="font-display text-lg font-semibold text-nile-ink">
          Order
        </h3>
        <ul className="mt-4 space-y-3 text-sm">
          {lines.map((l) => (
            <li
              key={l.product.id}
              className="flex justify-between gap-3 min-w-0"
            >
              <span className="min-w-0 text-nile-ink">
                <span className="break-words">{l.product.name}</span>{" "}
                <span className="text-nile-muted">×{l.quantity}</span>
              </span>
              <span className="shrink-0 font-medium tabular-nums">
                {formatLE(roundMoney(l.lineDiscounted))}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-nile-ink/10 pt-4 text-sm">
          <div className="flex justify-between gap-3 text-nile-muted">
            <dt>Original</dt>
            <dd className="line-through tabular-nums">{formatLE(original)}</dd>
          </div>
          <div className="flex justify-between gap-3 text-teal">
            <dt>Saved ({off})</dt>
            <dd className="tabular-nums">−{formatLE(saved)}</dd>
          </div>
          <div className="flex justify-between gap-3 text-base font-bold text-nile-ink">
            <dt>Total due</dt>
            <dd className="tabular-nums">{formatLE(total)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-nile-muted">
          Sale price already includes the automatic {off} discount.
        </p>
      </aside>
    </div>
  );
}

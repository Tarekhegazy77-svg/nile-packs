"use client";

import { useState, type MouseEvent } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useCartStore } from "@/store/cart";

type Props = {
  productId: string;
  className?: string;
  label?: string;
};

export function AddToCartButton({
  productId,
  className = "",
  label = "Add to cart",
}: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [justAdded, setJustAdded] = useState(false);

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    addItem(productId);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile ${
        justAdded
          ? "scale-[1.02] bg-teal text-white shadow-md shadow-teal/30"
          : "bg-nile text-sand hover:scale-[1.03] hover:bg-nile-deep hover:shadow-lg hover:shadow-nile/30 active:scale-[0.97]"
      } ${className}`}
    >
      {justAdded ? (
        <>
          <Check className="h-4 w-4" strokeWidth={2.5} />
          Added
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span className="truncate">{label}</span>
        </>
      )}
    </button>
  );
}

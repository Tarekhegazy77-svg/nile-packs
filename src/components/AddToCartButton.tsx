"use client";

import { useState, type MouseEvent } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCatalogOptional } from "@/context/CatalogContext";

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
  const { addItem } = useCart();
  const catalog = useCatalogOptional();
  const [justAdded, setJustAdded] = useState(false);

  const product = catalog?.getById(productId);
  const outOfStock =
    product != null && (product.removed || product.inStock === false);

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem(productId);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  }

  if (outOfStock) {
    return (
      <button
        type="button"
        disabled
        data-testid={`out-of-stock-${productId}`}
        className={`inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-nile-ink/10 px-5 py-2.5 text-sm font-semibold text-nile-muted ${className}`}
      >
        Out of stock
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      data-testid={`add-to-cart-${productId}`}
      className={`btn-shine focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 ${
        justAdded
          ? "scale-[1.02] bg-teal text-white shadow-md shadow-teal/35 ring-1 ring-teal/20"
          : "bg-nile text-sand hover:scale-[1.03] hover:bg-nile-deep hover:shadow-lg hover:shadow-nile/40 active:scale-[0.97]"
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

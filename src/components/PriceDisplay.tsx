import { discountedPrice, discountPercentLabel } from "@/lib/discount";
import { formatLE } from "@/lib/format";

type Props = {
  priceLE: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: { sale: "text-sm font-semibold", original: "text-xs" },
  md: { sale: "text-lg font-bold", original: "text-sm" },
  lg: { sale: "text-3xl font-bold tracking-tight", original: "text-base" },
};

export function PriceDisplay({ priceLE, size = "md", className = "" }: Props) {
  const sale = discountedPrice(priceLE);
  const sizes = sizeClasses[size];

  return (
    <div
      className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${className}`}
    >
      <span className={`text-nile-ink ${sizes.sale}`}>{formatLE(sale)}</span>
      <span
        className={`text-nile-muted line-through decoration-nile-muted/60 ${sizes.original}`}
      >
        {formatLE(priceLE)}
      </span>
      <span className="rounded-full bg-saffron/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-terracotta">
        −{discountPercentLabel()}
      </span>
    </div>
  );
}

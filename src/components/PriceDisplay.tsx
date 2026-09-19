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
      <span className={`text-mist ${sizes.sale}`}>{formatLE(sale)}</span>
      <span
        className={`text-silver/70 line-through decoration-silver/50 ${sizes.original}`}
      >
        {formatLE(priceLE)}
      </span>
      <span className="rounded-full border border-gold/30 bg-gold/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold">
        −{discountPercentLabel()}
      </span>
    </div>
  );
}

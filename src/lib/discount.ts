/** Site-wide automatic 40% discount (no coupon). */
export const DISCOUNT_RATE = 0.4;
export const SALE_MULTIPLIER = 1 - DISCOUNT_RATE; // 0.6

/** Round to 2 decimal places (LE cents). */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** discountedPrice(price) = round(price * 0.6, 2) */
export function discountedPrice(price: number): number {
  return roundMoney(price * SALE_MULTIPLIER);
}

export function savingsAmount(price: number): number {
  return roundMoney(price - discountedPrice(price));
}

export function discountPercentLabel(): string {
  return `${Math.round(DISCOUNT_RATE * 100)}%`;
}

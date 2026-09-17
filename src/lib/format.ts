/** Format amounts in Egyptian pounds (LE). */
export function formatLE(amount: number): string {
  return `LE ${amount.toFixed(2)}`;
}

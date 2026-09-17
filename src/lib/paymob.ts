/** Public Paymob Worker base URL. Empty → demo checkout mode. */
export function getPaymobApiBase(): string {
  const raw = (process.env.NEXT_PUBLIC_PAYMOB_API_BASE || "").trim();
  return raw.replace(/\/$/, "");
}

export function isPaymobLive(): boolean {
  return getPaymobApiBase().length > 0;
}

export type CheckoutRequest = {
  name: string;
  email: string;
  phone: string;
  subtotalDiscounted: number;
  lines: Array<{
    id: string;
    slug: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
};

export type CheckoutResponse = {
  checkoutUrl: string;
  merchantOrderId: string;
  amountCents?: number;
  currency?: string;
  error?: string;
  detail?: unknown;
};

export type OrderStatusResponse = {
  merchantOrderId: string;
  status: "pending" | "paid" | "failed" | "unknown";
  amountCents?: number;
  currency?: string;
  name?: string;
  email?: string;
  items?: Array<{
    id?: string;
    slug?: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  error?: string;
};

export async function createPaymobCheckout(
  payload: CheckoutRequest
): Promise<CheckoutResponse> {
  const base = getPaymobApiBase();
  if (!base) throw new Error("Paymob API base is not configured");

  const res = await fetch(`${base}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: CheckoutResponse;
  try {
    data = (await res.json()) as CheckoutResponse;
  } catch {
    throw new Error(`Checkout failed (${res.status})`);
  }

  if (!res.ok || !data.checkoutUrl) {
    const msg =
      typeof data.error === "string"
        ? data.error
        : `Checkout failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export async function fetchOrderStatus(
  merchantOrderId: string
): Promise<OrderStatusResponse> {
  const base = getPaymobApiBase();
  if (!base) throw new Error("Paymob API base is not configured");

  const res = await fetch(
    `${base}/order/${encodeURIComponent(merchantOrderId)}`,
    { method: "GET", cache: "no-store" }
  );

  let data: OrderStatusResponse;
  try {
    data = (await res.json()) as OrderStatusResponse;
  } catch {
    throw new Error(`Order lookup failed (${res.status})`);
  }

  if (res.status === 404) {
    return { merchantOrderId, status: "unknown", error: data.error };
  }
  if (!res.ok) {
    throw new Error(data.error || `Order lookup failed (${res.status})`);
  }
  return data;
}

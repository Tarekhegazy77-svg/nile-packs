/** Client helpers for the Nile Packs Admin API (Cloudflare Worker). */

export type AdminRole = "owner" | "staff";

export type AdminUser = {
  id: string;
  email: string;
  role: AdminRole;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  includes: string[];
  priceLE: number;
  featured: boolean;
  image?: string;
  inStock: boolean;
  stockQty: number | null;
  removed: boolean;
};

export type AdminOrder = {
  merchantOrderId: string;
  status: "pending" | "paid" | "failed" | "fulfilled" | "cancelled";
  amountCents: number;
  currency: "EGP";
  name: string;
  email: string;
  phone?: string;
  items: Array<{
    id?: string;
    slug?: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type AdminStats = {
  orderCount: number;
  paidCount: number;
  revenueEGP: number;
  revenueCents: number;
  byStatus: Record<string, number>;
  recentOrders: AdminOrder[];
};

const TOKEN_KEY = "nile-packs-admin-token";
const USER_KEY = "nile-packs-admin-user";

export function getAdminApiBase(): string {
  return (process.env.NEXT_PUBLIC_ADMIN_API_BASE || "").replace(/\/$/, "");
}

export function isAdminApiConfigured(): boolean {
  return Boolean(getAdminApiBase());
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): { email: string; role: AdminRole; id?: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { email: string; role: AdminRole; id?: string };
  } catch {
    return null;
  }
}

export function storeSession(
  token: string,
  user: { email: string; role: AdminRole; id?: string }
) {
  window.sessionStorage.setItem(TOKEN_KEY, token);
  window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(USER_KEY);
}

export class AdminApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function adminFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const base = getAdminApiBase();
  if (!base) throw new AdminApiError("Admin API not configured", 0);

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (options.auth !== false) {
    const token = getStoredToken();
    if (!token) throw new AdminApiError("Not authenticated", 401);
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${base}${path}`, { ...options, headers });
  let data: unknown = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text.slice(0, 200) };
  }

  if (!res.ok) {
    const msg =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : `Request failed (${res.status})`;
    if (res.status === 401) clearSession();
    throw new AdminApiError(msg, res.status);
  }
  return data as T;
}

export async function adminLogin(email: string, password: string) {
  const data = await adminFetch<{
    token: string;
    user: { email: string; role: AdminRole; id?: string };
  }>("/admin/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password }),
  });
  storeSession(data.token, data.user);
  return data;
}

export async function adminLogout() {
  try {
    await adminFetch("/admin/logout", { method: "POST" });
  } catch {
    /* ignore */
  }
  clearSession();
}

export async function adminMe() {
  return adminFetch<{ user: AdminUser }>("/admin/me");
}

export async function fetchAdminProducts() {
  return adminFetch<{ products: AdminProduct[] }>("/admin/products");
}

export async function patchAdminProduct(
  id: string,
  patch: Partial<
    Pick<
      AdminProduct,
      "inStock" | "stockQty" | "removed" | "priceLE" | "name" | "featured"
    >
  >
) {
  return adminFetch<{ product: AdminProduct }>(
    `/admin/products/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(patch) }
  );
}

export async function fetchAdminOrders() {
  return adminFetch<{ orders: AdminOrder[] }>("/admin/orders");
}

export async function fetchAdminStats() {
  return adminFetch<AdminStats>("/admin/stats");
}

export async function patchAdminOrder(
  id: string,
  status: AdminOrder["status"]
) {
  return adminFetch<{ order: AdminOrder }>(
    `/admin/orders/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify({ status }) }
  );
}

export async function fetchAdminUsers() {
  return adminFetch<{ users: AdminUser[] }>("/admin/users");
}

export async function createAdminUser(input: {
  email: string;
  password: string;
  role: AdminRole;
}) {
  return adminFetch<{ user: AdminUser }>("/admin/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function patchAdminUser(
  id: string,
  patch: { role?: AdminRole; active?: boolean }
) {
  return adminFetch<{ user: AdminUser }>(
    `/admin/users/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(patch) }
  );
}

export async function fetchPublicCatalog(): Promise<AdminProduct[]> {
  const base = getAdminApiBase();
  if (!base) return [];
  const res = await fetch(`${base}/api/catalog`);
  if (!res.ok) throw new Error("Failed to load catalog");
  const data = (await res.json()) as { products: AdminProduct[] };
  return data.products || [];
}

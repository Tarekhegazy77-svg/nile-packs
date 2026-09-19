/** Local (browser) admin store — no Cloudflare required. Data lives in localStorage on this device. */

import { products as seedProducts } from "@/lib/products";
import { OWNER_EMAIL, OWNER_PASSWORD_SHA256 } from "@/lib/admin-owner";

export type AdminRole = "owner" | "staff";

export type AdminUser = {
  id: string;
  email: string;
  role: AdminRole;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  /** stored only in local DB, never returned to UI */
  passwordHash?: string;
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

type Store = {
  users: AdminUser[];
  products: AdminProduct[];
  orders: AdminOrder[];
};

const STORE_KEY = "nile-packs-admin-v1";
const TOKEN_KEY = "nile-packs-admin-token";
const USER_KEY = "nile-packs-admin-user";

export class AdminApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

export function getAdminApiBase(): string {
  return "local";
}

export function isAdminApiConfigured(): boolean {
  return true;
}

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function publicUser(u: AdminUser): AdminUser {
  const { passwordHash: _, ...rest } = u;
  return rest;
}

function seedStore(): Store {
  const now = new Date().toISOString();
  return {
    users: [
      {
        id: "owner",
        email: OWNER_EMAIL,
        role: "owner",
        active: true,
        passwordHash: OWNER_PASSWORD_SHA256,
        createdAt: now,
        updatedAt: now,
      },
    ],
    products: seedProducts.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      includes: p.includes,
      priceLE: p.priceLE,
      featured: p.featured,
      image: p.image,
      inStock: true,
      stockQty: null,
      removed: false,
    })),
    orders: [],
  };
}

function readStore(): Store {
  if (typeof window === "undefined") return seedStore();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      const s = seedStore();
      localStorage.setItem(STORE_KEY, JSON.stringify(s));
      return s;
    }
    const parsed = JSON.parse(raw) as Store;
    if (!parsed.users?.length) {
      const s = seedStore();
      localStorage.setItem(STORE_KEY, JSON.stringify(s));
      return s;
    }
    // Keep primary owner (id "owner") email/hash in sync with build-time credentials
    let owner = parsed.users.find((u) => u.id === "owner");
    if (!owner) {
      owner = parsed.users.find((u) => u.role === "owner");
    }
    if (owner) {
      owner.id = "owner";
      owner.email = OWNER_EMAIL;
      owner.role = "owner";
      owner.passwordHash = OWNER_PASSWORD_SHA256;
      owner.active = true;
    } else {
      const now = new Date().toISOString();
      parsed.users.unshift({
        id: "owner",
        email: OWNER_EMAIL,
        role: "owner",
        active: true,
        passwordHash: OWNER_PASSWORD_SHA256,
        createdAt: now,
        updatedAt: now,
      });
    }
    if (!parsed.products?.length) {
      parsed.products = seedStore().products;
    } else {
      // Keep stock/removed flags; refresh catalog fields (e.g. new product art).
      const seeded = new Map(seedStore().products.map((x) => [x.id, x]));
      parsed.products = parsed.products.map((prod) => {
        const s = seeded.get(prod.id);
        if (!s) return prod;
        return {
          ...prod,
          slug: s.slug,
          name: s.name,
          description: s.description,
          includes: s.includes,
          priceLE: s.priceLE,
          featured: s.featured,
          image: s.image ?? prod.image,
        };
      });
      for (const s of seeded.values()) {
        if (!parsed.products.some((p) => p.id === s.id)) {
          parsed.products.push(s);
        }
      }
    }
    if (!parsed.orders) parsed.orders = [];
    return parsed;
  } catch {
    const s = seedStore();
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
    return s;
  }
}

function writeStore(s: Store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(s));
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): {
  email: string;
  role: AdminRole;
  id?: string;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function storeSession(
  token: string,
  user: { email: string; role: AdminRole; id?: string }
) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

function requireSession(): AdminUser {
  const token = getStoredToken();
  const sess = getStoredUser();
  if (!token || !sess) throw new AdminApiError("Not signed in", 401);
  const store = readStore();
  const user = store.users.find(
    (u) =>
      u.id === sess.id ||
      u.email.toLowerCase() === sess.email.toLowerCase()
  );
  if (!user || !user.active) {
    clearSession();
    throw new AdminApiError("Not signed in", 401);
  }
  return user;
}

export async function adminLogin(email: string, password: string) {
  const store = readStore();
  const hash = await sha256Hex(password);
  const user = store.users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (!user || !user.active || user.passwordHash !== hash) {
    throw new AdminApiError("Invalid email or password", 401);
  }
  const token = uid("tok");
  storeSession(token, {
    email: user.email,
    role: user.role,
    id: user.id,
  });
  writeStore(store);
  return { token, user: publicUser(user) };
}

export async function adminLogout() {
  clearSession();
}

export async function adminMe() {
  const user = requireSession();
  return { user: publicUser(user) };
}

export async function fetchAdminProducts() {
  requireSession();
  return { products: readStore().products };
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
  requireSession();
  const store = readStore();
  const i = store.products.findIndex((p) => p.id === id);
  if (i < 0) throw new AdminApiError("Product not found", 404);
  store.products[i] = { ...store.products[i], ...patch };
  writeStore(store);
  return { product: store.products[i] };
}

export async function fetchAdminOrders() {
  requireSession();
  const orders = [...readStore().orders].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  return { orders };
}

export async function fetchAdminStats(): Promise<AdminStats> {
  requireSession();
  const orders = readStore().orders;
  const byStatus: Record<string, number> = {};
  let revenueCents = 0;
  let paidCount = 0;
  for (const o of orders) {
    byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    if (o.status === "paid" || o.status === "fulfilled") {
      paidCount += 1;
      revenueCents += o.amountCents;
    }
  }
  const recent = [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);
  return {
    orderCount: orders.length,
    paidCount,
    revenueCents,
    revenueEGP: revenueCents / 100,
    byStatus,
    recentOrders: recent,
  };
}

export async function patchAdminOrder(
  id: string,
  status: AdminOrder["status"]
) {
  requireSession();
  const store = readStore();
  const i = store.orders.findIndex((o) => o.merchantOrderId === id);
  if (i < 0) throw new AdminApiError("Order not found", 404);
  store.orders[i] = {
    ...store.orders[i],
    status,
    updatedAt: new Date().toISOString(),
  };
  writeStore(store);
  return { order: store.orders[i] };
}

export async function fetchAdminUsers() {
  const me = requireSession();
  if (me.role !== "owner") throw new AdminApiError("Owner only", 403);
  return { users: readStore().users.map(publicUser) };
}

export async function createAdminUser(input: {
  email: string;
  password: string;
  role: AdminRole;
}) {
  const me = requireSession();
  if (me.role !== "owner") throw new AdminApiError("Owner only", 403);
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password || input.password.length < 6) {
    throw new AdminApiError("Email and password (6+ chars) required");
  }
  const store = readStore();
  if (store.users.some((u) => u.email.toLowerCase() === email)) {
    throw new AdminApiError("User already exists");
  }
  const now = new Date().toISOString();
  const user: AdminUser = {
    id: uid("user"),
    email,
    role: input.role === "owner" ? "owner" : "staff",
    active: true,
    passwordHash: await sha256Hex(input.password),
    createdAt: now,
    updatedAt: now,
  };
  store.users.push(user);
  writeStore(store);
  return { user: publicUser(user) };
}

export async function patchAdminUser(
  id: string,
  patch: Partial<Pick<AdminUser, "role" | "active">>
) {
  const me = requireSession();
  if (me.role !== "owner") throw new AdminApiError("Owner only", 403);
  const store = readStore();
  const i = store.users.findIndex((u) => u.id === id);
  if (i < 0) throw new AdminApiError("User not found", 404);
  if (store.users[i].id === "owner" && patch.active === false) {
    throw new AdminApiError("Cannot deactivate the primary owner");
  }
  store.users[i] = {
    ...store.users[i],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  writeStore(store);
  return { user: publicUser(store.users[i]) };
}

export async function deleteAdminUser(id: string) {
  const me = requireSession();
  if (me.role !== "owner") throw new AdminApiError("Owner only", 403);
  if (id === me.id) {
    throw new AdminApiError("Cannot remove yourself");
  }
  const store = readStore();
  const i = store.users.findIndex((u) => u.id === id);
  if (i < 0) throw new AdminApiError("User not found", 404);
  const target = store.users[i];
  if (target.id === "owner") {
    throw new AdminApiError("Cannot remove the primary owner");
  }
  store.users.splice(i, 1);
  writeStore(store);
  return { ok: true as const };
}

/** Public catalog for storefront (same browser). */
export async function fetchPublicCatalog(): Promise<AdminProduct[]> {
  const store = readStore();
  return store.products.filter((p) => !p.removed);
}

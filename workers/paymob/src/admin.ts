/**
 * Admin + public catalog routes for Nile Packs API worker.
 */
import {
  type AdminUser,
  type Role,
  type SessionRecord,
  emailKey,
  hashPassword,
  newToken,
  newUserId,
  productKey,
  productsIndexKey,
  sessionKey,
  SESSION_TTL_SECONDS,
  userKey,
  usersIndexKey,
  verifyPassword,
} from "./auth";
import { SEED_PRODUCTS, type AdminProduct } from "./seed-products";

export interface AdminEnv {
  ORDERS: KVNamespace;
  ADMIN: KVNamespace;
  ADMIN_OWNER_EMAIL?: string;
  ADMIN_OWNER_PASSWORD?: string;
  SESSION_SECRET?: string;
  APP_URL: string;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "fulfilled"
  | "cancelled";

export type OrderRecord = {
  merchantOrderId: string;
  status: OrderStatus;
  amountCents: number;
  currency: "EGP";
  name: string;
  email: string;
  phone: string;
  items: Array<{
    id?: string;
    slug?: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  paymobTransactionId?: number | string;
  intentionId?: string;
  createdAt: string;
  updatedAt: string;
};

type JsonFn = (data: unknown, status?: number) => Response;

function publicUser(u: AdminUser) {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    active: u.active,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

async function listUserIds(env: AdminEnv): Promise<string[]> {
  const raw = await env.ADMIN.get(usersIndexKey());
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function saveUserIds(env: AdminEnv, ids: string[]) {
  await env.ADMIN.put(usersIndexKey(), JSON.stringify(ids));
}

async function getUser(env: AdminEnv, id: string): Promise<AdminUser | null> {
  const raw = await env.ADMIN.get(userKey(id));
  if (!raw) return null;
  return JSON.parse(raw) as AdminUser;
}

async function getUserByEmail(
  env: AdminEnv,
  email: string
): Promise<AdminUser | null> {
  const id = await env.ADMIN.get(emailKey(email));
  if (!id) return null;
  return getUser(env, id);
}

async function countUsers(env: AdminEnv): Promise<number> {
  return (await listUserIds(env)).length;
}

async function bootstrapOwnerIfEmpty(env: AdminEnv): Promise<void> {
  if ((await countUsers(env)) > 0) return;
  const email = (env.ADMIN_OWNER_EMAIL || "").trim().toLowerCase();
  const password = env.ADMIN_OWNER_PASSWORD || "";
  if (!email || !password || password.includes("REPLACE")) {
    throw new Error(
      "No admin users and ADMIN_OWNER_EMAIL / ADMIN_OWNER_PASSWORD secrets not set"
    );
  }
  const now = new Date().toISOString();
  const user: AdminUser = {
    id: newUserId(),
    email,
    role: "owner",
    active: true,
    passwordHash: await hashPassword(password),
    createdAt: now,
    updatedAt: now,
  };
  await env.ADMIN.put(userKey(user.id), JSON.stringify(user));
  await env.ADMIN.put(emailKey(email), user.id);
  await saveUserIds(env, [user.id]);
}

async function createSession(
  env: AdminEnv,
  user: AdminUser
): Promise<string> {
  const token = newToken();
  const record: SessionRecord = {
    token,
    userId: user.id,
    email: user.email,
    role: user.role,
    createdAt: new Date().toISOString(),
  };
  await env.ADMIN.put(sessionKey(token), JSON.stringify(record), {
    expirationTtl: SESSION_TTL_SECONDS,
  });
  return token;
}

async function requireAuth(
  request: Request,
  env: AdminEnv,
  json: JsonFn
): Promise<{ user: AdminUser; token: string } | Response> {
  const header = request.headers.get("Authorization") || "";
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) return json({ error: "Missing Authorization Bearer token" }, 401);
  const token = m[1].trim();
  const raw = await env.ADMIN.get(sessionKey(token));
  if (!raw) return json({ error: "Invalid or expired session" }, 401);
  const session = JSON.parse(raw) as SessionRecord;
  const user = await getUser(env, session.userId);
  if (!user || !user.active) {
    await env.ADMIN.delete(sessionKey(token));
    return json({ error: "User inactive or missing" }, 401);
  }
  return { user, token };
}

async function ensureProductsSeeded(env: AdminEnv): Promise<AdminProduct[]> {
  const indexRaw = await env.ADMIN.get(productsIndexKey());
  if (indexRaw) {
    const ids = JSON.parse(indexRaw) as string[];
    const products: AdminProduct[] = [];
    for (const id of ids) {
      const raw = await env.ADMIN.get(productKey(id));
      if (raw) products.push(JSON.parse(raw) as AdminProduct);
    }
    if (products.length > 0) return products;
  }
  // Seed
  const ids: string[] = [];
  for (const p of SEED_PRODUCTS) {
    await env.ADMIN.put(productKey(p.id), JSON.stringify(p));
    ids.push(p.id);
  }
  await env.ADMIN.put(productsIndexKey(), JSON.stringify(ids));
  return SEED_PRODUCTS.map((p) => ({ ...p }));
}

async function listAllOrders(env: AdminEnv): Promise<OrderRecord[]> {
  const orders: OrderRecord[] = [];
  let cursor: string | undefined;
  do {
    const page = await env.ORDERS.list({ cursor, limit: 1000 });
    for (const key of page.keys) {
      const raw = await env.ORDERS.get(key.name);
      if (!raw) continue;
      try {
        orders.push(JSON.parse(raw) as OrderRecord);
      } catch {
        /* skip */
      }
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  orders.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return orders;
}

export async function handleAdminRoute(
  request: Request,
  env: AdminEnv,
  pathname: string,
  json: JsonFn
): Promise<Response | null> {
  // Public catalog
  if (request.method === "GET" && pathname === "/api/catalog") {
    const products = await ensureProductsSeeded(env);
    const visible = products.filter((p) => !p.removed);
    return json({ products: visible });
  }

  if (!pathname.startsWith("/admin")) return null;

  // POST /admin/login
  if (request.method === "POST" && pathname === "/admin/login") {
    let body: { email?: string; password?: string };
    try {
      body = (await request.json()) as { email?: string; password?: string };
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    if (!email || !password) {
      return json({ error: "email and password required" }, 400);
    }

    try {
      await bootstrapOwnerIfEmpty(env);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Bootstrap failed";
      return json({ error: msg }, 500);
    }

    const user = await getUserByEmail(env, email);
    if (!user || !user.active) {
      return json({ error: "Invalid credentials" }, 401);
    }
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return json({ error: "Invalid credentials" }, 401);

    const token = await createSession(env, user);
    return json({
      token,
      user: { email: user.email, role: user.role, id: user.id },
    });
  }

  // Auth required below
  const auth = await requireAuth(request, env, json);
  if (auth instanceof Response) return auth;
  const { user, token } = auth;

  if (request.method === "POST" && pathname === "/admin/logout") {
    await env.ADMIN.delete(sessionKey(token));
    return json({ ok: true });
  }

  if (request.method === "GET" && pathname === "/admin/me") {
    return json({ user: publicUser(user) });
  }

  // ── Team (owner only) ──
  if (pathname === "/admin/users" && request.method === "GET") {
    if (user.role !== "owner") return json({ error: "Forbidden" }, 403);
    const ids = await listUserIds(env);
    const users = [];
    for (const id of ids) {
      const u = await getUser(env, id);
      if (u) users.push(publicUser(u));
    }
    return json({ users });
  }

  if (pathname === "/admin/users" && request.method === "POST") {
    if (user.role !== "owner") return json({ error: "Forbidden" }, 403);
    let body: { email?: string; password?: string; role?: Role };
    try {
      body = (await request.json()) as {
        email?: string;
        password?: string;
        role?: Role;
      };
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const role: Role = body.role === "owner" ? "owner" : "staff";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "valid email required" }, 400);
    }
    if (!password || password.length < 8) {
      return json({ error: "password must be at least 8 characters" }, 400);
    }
    if (await getUserByEmail(env, email)) {
      return json({ error: "User already exists" }, 409);
    }
    const now = new Date().toISOString();
    const nu: AdminUser = {
      id: newUserId(),
      email,
      role,
      active: true,
      passwordHash: await hashPassword(password),
      createdAt: now,
      updatedAt: now,
    };
    await env.ADMIN.put(userKey(nu.id), JSON.stringify(nu));
    await env.ADMIN.put(emailKey(email), nu.id);
    const ids = await listUserIds(env);
    ids.push(nu.id);
    await saveUserIds(env, ids);
    return json({ user: publicUser(nu) }, 201);
  }

  const userPatch = pathname.match(/^\/admin\/users\/([^/]+)\/?$/);
  if (userPatch && request.method === "PATCH") {
    if (user.role !== "owner") return json({ error: "Forbidden" }, 403);
    const id = decodeURIComponent(userPatch[1]);
    const target = await getUser(env, id);
    if (!target) return json({ error: "User not found" }, 404);
    let body: { role?: Role; active?: boolean };
    try {
      body = (await request.json()) as { role?: Role; active?: boolean };
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }
    if (body.role === "owner" || body.role === "staff") target.role = body.role;
    if (typeof body.active === "boolean") target.active = body.active;
    target.updatedAt = new Date().toISOString();
    await env.ADMIN.put(userKey(target.id), JSON.stringify(target));
    return json({ user: publicUser(target) });
  }

  // ── Products ──
  if (pathname === "/admin/products" && request.method === "GET") {
    const products = await ensureProductsSeeded(env);
    return json({ products });
  }

  const prodPatch = pathname.match(/^\/admin\/products\/([^/]+)\/?$/);
  if (prodPatch && request.method === "PATCH") {
    const id = decodeURIComponent(prodPatch[1]);
    await ensureProductsSeeded(env);
    const raw = await env.ADMIN.get(productKey(id));
    if (!raw) return json({ error: "Product not found" }, 404);
    const product = JSON.parse(raw) as AdminProduct;
    let body: Partial<{
      inStock: boolean;
      stockQty: number | null;
      removed: boolean;
      priceLE: number;
      name: string;
      featured: boolean;
    }>;
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }
    if (typeof body.inStock === "boolean") product.inStock = body.inStock;
    if (body.stockQty === null || typeof body.stockQty === "number") {
      product.stockQty = body.stockQty;
    }
    if (typeof body.removed === "boolean") product.removed = body.removed;
    if (typeof body.priceLE === "number" && Number.isFinite(body.priceLE)) {
      product.priceLE = body.priceLE;
    }
    if (typeof body.name === "string" && body.name.trim()) {
      product.name = body.name.trim();
    }
    if (typeof body.featured === "boolean") product.featured = body.featured;
    await env.ADMIN.put(productKey(id), JSON.stringify(product));
    return json({ product });
  }

  // ── Orders / stats ──
  if (pathname === "/admin/orders" && request.method === "GET") {
    const orders = await listAllOrders(env);
    return json({ orders });
  }

  if (pathname === "/admin/stats" && request.method === "GET") {
    const orders = await listAllOrders(env);
    const paidLike = orders.filter(
      (o) => o.status === "paid" || o.status === "fulfilled"
    );
    const revenueCents = paidLike.reduce(
      (s, o) => s + (Number(o.amountCents) || 0),
      0
    );
    const byStatus: Record<string, number> = {};
    for (const o of orders) {
      byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    }
    return json({
      orderCount: orders.length,
      paidCount: paidLike.length,
      revenueEGP: revenueCents / 100,
      revenueCents,
      byStatus,
      recentOrders: orders.slice(0, 10),
    });
  }

  const orderPatch = pathname.match(/^\/admin\/orders\/([^/]+)\/?$/);
  if (orderPatch && request.method === "PATCH") {
    const id = decodeURIComponent(orderPatch[1]);
    const raw = await env.ORDERS.get(id);
    if (!raw) return json({ error: "Order not found" }, 404);
    const order = JSON.parse(raw) as OrderRecord;
    let body: { status?: OrderStatus };
    try {
      body = (await request.json()) as { status?: OrderStatus };
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }
    const allowed: OrderStatus[] = [
      "pending",
      "paid",
      "fulfilled",
      "cancelled",
    ];
    if (!body.status || !allowed.includes(body.status)) {
      return json(
        { error: "status must be pending|paid|fulfilled|cancelled" },
        400
      );
    }
    order.status = body.status;
    order.updatedAt = new Date().toISOString();
    await env.ORDERS.put(id, JSON.stringify(order), {
      expirationTtl: 60 * 60 * 24 * 90,
    });
    return json({ order });
  }

  return json({ error: "Not found" }, 404);
}

/**
 * Nile Packs API — Paymob + Admin Cloudflare Worker (nile-packs-api)
 *
 * Paymob:
 *   POST /checkout          — create Intention, return { checkoutUrl, merchantOrderId }
 *   POST /webhook           — verify HMAC, record payment in KV (ORDERS)
 *   GET  /order/:id         — payment status for success page
 * Admin:
 *   POST /admin/login|logout, GET /admin/me
 *   GET|POST /admin/users, PATCH /admin/users/:id
 *   GET /admin/products, PATCH /admin/products/:id
 *   GET /admin/orders|stats, PATCH /admin/orders/:id
 * Public:
 *   GET /api/catalog
 *   OPTIONS *               — CORS preflight
 */

import { handleAdminRoute } from "./admin";

export interface Env {
  ORDERS: KVNamespace;
  ADMIN: KVNamespace;
  PAYMOB_SECRET_KEY: string;
  PAYMOB_PUBLIC_KEY: string;
  PAYMOB_HMAC_SECRET: string;
  /** Card integration id as string (wrangler vars are strings). */
  PAYMOB_INTEGRATION_ID_CARD: string;
  /** Storefront origin, e.g. https://tarekhegazy77-svg.github.io/nile-packs */
  APP_URL: string;
  /** Owner bootstrap secrets (wrangler secret put) */
  ADMIN_OWNER_EMAIL?: string;
  ADMIN_OWNER_PASSWORD?: string;
  SESSION_SECRET?: string;
}

type CartLineIn = {
  id?: string;
  slug?: string;
  name: string;
  quantity: number;
  unitPrice: number; // LE (discounted unit)
};

type CheckoutBody = {
  name: string;
  email: string;
  phone: string;
  lines: CartLineIn[];
  /** Discounted cart total in LE (not cents). */
  subtotalDiscounted: number;
};

type OrderRecord = {
  merchantOrderId: string;
  status: "pending" | "paid" | "failed" | "fulfilled" | "cancelled";
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

const PAYMOB_BASE = "https://accept.paymob.com";

/** Documented Transaction Processed HMAC field order (concat, no separators). */
const HMAC_FIELDS = [
  "amount_cents",
  "created_at",
  "currency",
  "error_occured",
  "has_parent_transaction",
  "id",
  "integration_id",
  "is_3d_secure",
  "is_auth",
  "is_capture",
  "is_refunded",
  "is_standalone_payment",
  "is_voided",
  "order.id",
  "owner",
  "pending",
  "source_data.pan",
  "source_data.sub_type",
  "source_data.type",
  "success",
] as const;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    try {
      if (request.method === "POST" && url.pathname === "/checkout") {
        return withCors(await handleCheckout(request, env), cors);
      }
      if (request.method === "POST" && url.pathname === "/webhook") {
        // Webhooks come from Paymob — no browser CORS needed, but keep headers harmless.
        return withCors(await handleWebhook(request, env, url), cors);
      }
      const orderMatch = url.pathname.match(/^\/order\/([^/]+)\/?$/);
      if (request.method === "GET" && orderMatch) {
        return withCors(
          await handleGetOrder(decodeURIComponent(orderMatch[1]), env),
          cors
        );
      }
      if (request.method === "GET" && url.pathname === "/health") {
        return withCors(json({ ok: true, service: "nile-packs-api" }), cors);
      }

      const adminRes = await handleAdminRoute(
        request,
        env,
        url.pathname,
        json
      );
      if (adminRes) {
        return withCors(adminRes, cors);
      }

      return withCors(json({ error: "Not found" }, 404), cors);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal error";
      console.error("worker error", message);
      return withCors(json({ error: message }, 500), cors);
    }
  },
} satisfies ExportedHandler<Env>;

function appOrigins(env: Env): string[] {
  const origins = new Set<string>();
  try {
    const u = new URL(env.APP_URL);
    origins.add(u.origin);
  } catch {
    /* ignore bad APP_URL */
  }
  origins.add("https://tarekhegazy77-svg.github.io");
  origins.add("http://localhost:3000");
  origins.add("http://127.0.0.1:3000");
  return [...origins];
}

function corsHeaders(request: Request, env: Env): HeadersInit {
  const origin = request.headers.get("Origin") || "";
  const allowed = appOrigins(env);
  const allow =
    origin && allowed.includes(origin)
      ? origin
      : allowed[0] || "https://tarekhegazy77-svg.github.io";

  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function withCors(res: Response, cors: HeadersInit): Response {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(cors)) {
    headers.set(k, v);
  }
  return new Response(res.body, { status: res.status, headers });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function requireEnv(env: Env, key: keyof Env): string {
  const v = env[key];
  if (typeof v !== "string" || !v.trim() || v.includes("REPLACE")) {
    throw new Error(`Missing or placeholder env: ${String(key)}`);
  }
  return v.trim();
}

function toCents(le: number): number {
  return Math.round(Number(le) * 100);
}

function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "Customer", last: "Nile" };
  if (parts.length === 1) return { first: parts[0], last: "Customer" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s()-]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("00")) return `+${cleaned.slice(2)}`;
  if (cleaned.startsWith("0") && cleaned.length >= 10) {
    // Egyptian local → E.164
    return `+20${cleaned.slice(1)}`;
  }
  if (/^1\d{9}$/.test(cleaned)) return `+20${cleaned}`;
  return cleaned;
}

function merchantOrderId(): string {
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  return `np_${Date.now()}_${rand}`;
}

async function handleCheckout(request: Request, env: Env): Promise<Response> {
  const secret = requireEnv(env, "PAYMOB_SECRET_KEY");
  const publicKey = requireEnv(env, "PAYMOB_PUBLIC_KEY");
  const appUrl = requireEnv(env, "APP_URL").replace(/\/$/, "");
  const integrationRaw = requireEnv(env, "PAYMOB_INTEGRATION_ID_CARD");
  const integrationId = Number(integrationRaw);
  if (!Number.isFinite(integrationId) || integrationId <= 0) {
    return json({ error: "Invalid PAYMOB_INTEGRATION_ID_CARD" }, 500);
  }

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const phone = normalizePhone((body.phone || "").trim());
  const lines = Array.isArray(body.lines) ? body.lines : [];

  if (!name) return json({ error: "name is required" }, 400);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "valid email is required" }, 400);
  }
  if (!phone || phone.length < 8) {
    return json({ error: "phone is required" }, 400);
  }
  if (lines.length === 0) return json({ error: "cart is empty" }, 400);

  const amountCents = toCents(body.subtotalDiscounted);
  if (!Number.isFinite(amountCents) || amountCents < 1) {
    return json({ error: "invalid subtotalDiscounted" }, 400);
  }

  // Line amounts in cents; use line totals so sum(items.amount) === amount.
  const items = lines.map((l) => {
    const qty = Math.max(1, Math.floor(Number(l.quantity) || 1));
    const unit = Number(l.unitPrice) || 0;
    const lineCents = toCents(unit * qty);
    return {
      name: String(l.name || "Package").slice(0, 120),
      amount: lineCents,
      description: l.slug ? String(l.slug).slice(0, 80) : undefined,
      quantity: qty,
      id: l.id,
      slug: l.slug,
      unitPrice: unit,
    };
  });

  const sumItems = items.reduce((s, i) => s + i.amount, 0);
  // Prefer client total; adjust last line if 1-cent rounding drift.
  let payAmount = amountCents;
  if (Math.abs(sumItems - amountCents) <= 2 && items.length > 0) {
    items[items.length - 1].amount += amountCents - sumItems;
    payAmount = amountCents;
  } else if (sumItems > 0) {
    payAmount = sumItems;
  }

  const orderId = merchantOrderId();
  const { first, last } = splitName(name);
  const now = new Date().toISOString();

  const record: OrderRecord = {
    merchantOrderId: orderId,
    status: "pending",
    amountCents: payAmount,
    currency: "EGP",
    name,
    email,
    phone,
    items: items.map((i) => ({
      id: i.id,
      slug: i.slug,
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    createdAt: now,
    updatedAt: now,
  };
  await env.ORDERS.put(orderId, JSON.stringify(record), {
    expirationTtl: 60 * 60 * 24 * 30, // 30 days
  });

  const intentionPayload = {
    amount: payAmount,
    currency: "EGP",
    payment_methods: [integrationId],
    items: items.map((i) => ({
      name: i.name,
      amount: i.amount,
      description: i.description,
      quantity: i.quantity,
    })),
    billing_data: {
      first_name: first,
      last_name: last,
      email,
      phone_number: phone,
      country: "EGY",
      city: "Cairo",
      street: "N/A",
      building: "N/A",
      floor: "N/A",
      apartment: "N/A",
      state: "Cairo",
    },
    customer: {
      first_name: first,
      last_name: last,
      email,
    },
    extras: { merchant_order_id: orderId },
    special_reference: orderId,
    notification_url: new URL("/webhook", request.url).toString(),
    redirection_url: `${appUrl}/payment/complete/?merchantOrderId=${encodeURIComponent(orderId)}`,
  };

  const paymobRes = await fetch(`${PAYMOB_BASE}/v1/intention/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(intentionPayload),
  });

  const paymobText = await paymobRes.text();
  let paymobJson: Record<string, unknown> = {};
  try {
    paymobJson = JSON.parse(paymobText) as Record<string, unknown>;
  } catch {
    /* non-JSON error */
  }

  if (!paymobRes.ok) {
    console.error("Paymob intention failed", paymobRes.status, paymobText);
    record.status = "failed";
    record.updatedAt = new Date().toISOString();
    await env.ORDERS.put(orderId, JSON.stringify(record), {
      expirationTtl: 60 * 60 * 24 * 7,
    });
    return json(
      {
        error: "Paymob intention failed",
        detail: paymobJson.detail || paymobJson || paymobText.slice(0, 500),
      },
      502
    );
  }

  const clientSecret = String(paymobJson.client_secret || "");
  if (!clientSecret) {
    return json({ error: "Paymob response missing client_secret" }, 502);
  }

  record.intentionId = paymobJson.id ? String(paymobJson.id) : undefined;
  record.updatedAt = new Date().toISOString();
  await env.ORDERS.put(orderId, JSON.stringify(record), {
    expirationTtl: 60 * 60 * 24 * 30,
  });

  const checkoutUrl =
    `${PAYMOB_BASE}/unifiedcheckout/` +
    `?publicKey=${encodeURIComponent(publicKey)}` +
    `&clientSecret=${encodeURIComponent(clientSecret)}`;

  return json({
    checkoutUrl,
    merchantOrderId: orderId,
    amountCents: payAmount,
    currency: "EGP",
  });
}

async function handleWebhook(
  request: Request,
  env: Env,
  url: URL
): Promise<Response> {
  const hmacSecret = requireEnv(env, "PAYMOB_HMAC_SECRET");

  const raw = await request.text();
  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  // Prefer classic Transaction Processed shape: { obj: {...} }
  // Intention-era payloads may nest under `transaction`.
  const obj = (body.obj ||
    body.transaction ||
    (body.type === "TRANSACTION" ? body.obj : null) ||
    body) as Record<string, unknown>;

  const hmacFromQuery = url.searchParams.get("hmac") || "";
  const hmacFromBody =
    typeof body.hmac === "string" ? (body.hmac as string) : "";
  const provided = (hmacFromQuery || hmacFromBody).toLowerCase();

  if (!provided) {
    console.warn("webhook missing hmac");
    return json({ error: "missing hmac" }, 401);
  }

  const expected = await computeHmacHex(obj, hmacSecret);
  if (!timingSafeEqual(expected, provided)) {
    console.warn("webhook hmac mismatch");
    return json({ error: "invalid hmac" }, 401);
  }

  const success = toBool(obj.success);
  const pending = toBool(obj.pending);
  const merchantOrderId = extractMerchantOrderId(obj, body);

  if (!merchantOrderId) {
    console.warn("webhook missing merchant_order_id", obj);
    // Still 200 so Paymob does not retry forever for uncorrelated events.
    return json({ ok: true, ignored: true, reason: "no merchant_order_id" });
  }

  const existingRaw = await env.ORDERS.get(merchantOrderId);
  let record: OrderRecord;
  if (existingRaw) {
    record = JSON.parse(existingRaw) as OrderRecord;
  } else {
    record = {
      merchantOrderId,
      status: "pending",
      amountCents: Number(obj.amount_cents) || 0,
      currency: "EGP",
      name: "",
      email: "",
      phone: "",
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  if (record.status === "paid") {
    return json({ ok: true, status: "paid", idempotent: true });
  }

  if (success && !pending) {
    record.status = "paid";
  } else if (!pending && toBool(obj.error_occured)) {
    record.status = "failed";
  } else if (!success && !pending) {
    record.status = "failed";
  }

  record.paymobTransactionId =
    (obj.id as number | string | undefined) ?? record.paymobTransactionId;
  record.updatedAt = new Date().toISOString();
  if (obj.amount_cents != null) {
    record.amountCents = Number(obj.amount_cents) || record.amountCents;
  }

  await env.ORDERS.put(merchantOrderId, JSON.stringify(record), {
    expirationTtl: 60 * 60 * 24 * 90,
  });

  return json({ ok: true, status: record.status, merchantOrderId });
}

async function handleGetOrder(
  merchantOrderId: string,
  env: Env
): Promise<Response> {
  if (!merchantOrderId) return json({ error: "missing id" }, 400);
  const raw = await env.ORDERS.get(merchantOrderId);
  if (!raw) return json({ error: "order not found", status: "unknown" }, 404);
  const record = JSON.parse(raw) as OrderRecord;
  return json({
    merchantOrderId: record.merchantOrderId,
    status: record.status,
    amountCents: record.amountCents,
    currency: record.currency,
    name: record.name,
    email: record.email,
    items: record.items,
    paymobTransactionId: record.paymobTransactionId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

function extractMerchantOrderId(
  obj: Record<string, unknown>,
  body: Record<string, unknown>
): string | null {
  const order = (obj.order || {}) as Record<string, unknown>;
  const intention = (body.intention || {}) as Record<string, unknown>;
  const claims = (obj.payment_key_claims || {}) as Record<string, unknown>;
  const claimsExtra = (claims.extra || {}) as Record<string, unknown>;
  const extras = (obj.extra || claimsExtra || {}) as Record<string, unknown>;

  const candidates: unknown[] = [
    obj.merchant_order_id,
    order.merchant_order_id,
    order.merchant_orderId,
    intention.special_reference,
    body.special_reference,
    extras.merchant_order_id,
    claimsExtra.merchant_order_id,
  ];

  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
    if (typeof c === "number") return String(c);
  }
  return null;
}

function getNested(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function fieldToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

async function computeHmacHex(
  obj: Record<string, unknown>,
  secret: string
): Promise<string> {
  const concat = HMAC_FIELDS.map((f) =>
    fieldToString(getNested(obj, f))
  ).join("");

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(concat));
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

function toBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.toLowerCase() === "true" || v === "1";
  if (typeof v === "number") return v === 1;
  return false;
}

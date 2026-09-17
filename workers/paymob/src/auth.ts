/** PBKDF2 password hashing + opaque session helpers (Web Crypto). */

const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type Role = "owner" | "staff";

export type AdminUser = {
  id: string;
  email: string;
  role: Role;
  active: boolean;
  passwordHash: string; // salt:hex + hash:hex
  createdAt: string;
  updatedAt: string;
};

export type SessionRecord = {
  token: string;
  userId: string;
  email: string;
  role: Role;
  createdAt: string;
};

function enc() {
  return new TextEncoder();
}

function toHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_BITS
  );
  return `${toHex(salt)}:${toHex(bits)}`;
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = fromHex(saltHex);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_BITS
  );
  const computed = toHex(bits);
  return timingSafeEqual(computed, hashHex);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export function newToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return toHex(bytes);
}

export function newUserId(): string {
  return `u_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

export { SESSION_TTL_SECONDS };

export function userKey(id: string) {
  return `user:${id}`;
}
export function emailKey(email: string) {
  return `user:email:${email.trim().toLowerCase()}`;
}
export function usersIndexKey() {
  return "users:index";
}
export function sessionKey(token: string) {
  return `session:${token}`;
}
export function productKey(id: string) {
  return `product:${id}`;
}
export function productsIndexKey() {
  return "products:index";
}

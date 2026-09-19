"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { adminLogin, getStoredToken } from "@/lib/admin-api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getStoredToken()) {
      router.replace("/admin/");
    }
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminLogin(email.trim(), password);
      router.replace("/admin/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="glass-panel w-full max-w-md rounded-3xl p-8">
        <div className="flex items-center gap-3">
          <span className="logo-mark flex h-11 w-11 items-center justify-center rounded-xl bg-cyan text-ink">
            <Package className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">
              Nile Packs
            </p>
            <h1 className="font-display text-2xl font-semibold text-mist">
              Admin sign in
            </h1>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-silver">
              Email
            </span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus-ring mt-1.5 w-full rounded-xl border border-line bg-ink-2 px-3 py-2.5 text-sm text-mist outline-none transition focus:border-cyan focus:ring-2 focus:ring-cyan/20"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-silver">
              Password
            </span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring mt-1.5 w-full rounded-xl border border-line bg-ink-2 px-3 py-2.5 text-sm text-mist outline-none transition focus:border-cyan focus:ring-2 focus:ring-cyan/20"
            />
          </label>
          {error ? (
            <p className="text-sm font-medium text-danger">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="btn-shine btn-primary focus-ring w-full rounded-full py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

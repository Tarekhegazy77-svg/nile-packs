"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  LayoutDashboard,
  Boxes,
  ShoppingBag,
  Users,
  LogOut,
} from "lucide-react";
import {
  adminLogout,
  adminMe,
  clearSession,
  createAdminUser,
  deleteAdminUser,
  fetchAdminOrders,
  fetchAdminProducts,
  fetchAdminStats,
  fetchAdminUsers,
  getStoredToken,
  getStoredUser,
  patchAdminOrder,
  patchAdminProduct,
  patchAdminUser,
  type AdminOrder,
  type AdminProduct,
  type AdminRole,
  type AdminStats,
  type AdminUser,
} from "@/lib/admin-api";
import { formatLE } from "@/lib/format";

type Tab = "overview" | "products" | "orders" | "team";

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard; ownerOnly?: boolean }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Boxes },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "team", label: "Team", icon: Users, ownerOnly: true },
];

export function AdminDashboard() {
  const router = useRouter();
  const configured = true;
  const [tab, setTab] = useState<Tab>("overview");
  const [user, setUser] = useState(getStoredUser());
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [busy, setBusy] = useState(false);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminRole>("staff");

  const requireAuth = useCallback(() => {
    if (!configured) return false;
    if (!getStoredToken()) {
      router.replace("/admin/login/");
      return false;
    }
    return true;
  }, [configured, router]);

  const loadTabData = useCallback(
    async (t: Tab) => {
      if (!requireAuth()) return;
      setError("");
      setBusy(true);
      try {
        if (t === "overview") {
          const s = await fetchAdminStats();
          setStats(s);
        } else if (t === "products") {
          const r = await fetchAdminProducts();
          setProducts(r.products);
        } else if (t === "orders") {
          const r = await fetchAdminOrders();
          setOrders(r.orders);
        } else if (t === "team") {
          const r = await fetchAdminUsers();
          setUsers(r.users);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load";
        setError(msg);
        if (msg.toLowerCase().includes("auth") || msg.includes("401")) {
          clearSession();
          router.replace("/admin/login/");
        }
      } finally {
        setBusy(false);
      }
    },
    [requireAuth, router]
  );

  useEffect(() => {
    if (!configured) {
      setBooting(false);
      return;
    }
    if (!getStoredToken()) {
      router.replace("/admin/login/");
      return;
    }
    void (async () => {
      try {
        const me = await adminMe();
        setUser({
          email: me.user.email,
          role: me.user.role,
          id: me.user.id,
        });
      } catch {
        clearSession();
        router.replace("/admin/login/");
        return;
      } finally {
        setBooting(false);
      }
      await loadTabData("overview");
    })();
  }, [configured, router, loadTabData]);

  useEffect(() => {
    if (booting || !configured) return;
    void loadTabData(tab);
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onLogout() {
    await adminLogout();
    router.replace("/admin/login/");
  }

  async function updateProduct(
    id: string,
    patch: Parameters<typeof patchAdminProduct>[1]
  ) {
    setBusy(true);
    setError("");
    try {
      const { product } = await patchAdminProduct(id, patch);
      setProducts((prev) => prev.map((p) => (p.id === id ? product : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function updateOrderStatus(
    id: string,
    status: AdminOrder["status"]
  ) {
    setBusy(true);
    setError("");
    try {
      const { order } = await patchAdminOrder(id, status);
      setOrders((prev) =>
        prev.map((o) => (o.merchantOrderId === id ? order : o))
      );
      if (stats) {
        const s = await fetchAdminStats();
        setStats(s);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function onInvite(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await createAdminUser({
        email: inviteEmail.trim(),
        password: invitePassword,
        role: inviteRole,
      });
      setInviteEmail("");
      setInvitePassword("");
      setInviteRole("staff");
      const r = await fetchAdminUsers();
      setUsers(r.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20">
        <div className="rounded-2xl border border-terracotta/30 bg-terracotta/10 p-6 text-terracotta">
          <h1 className="font-display text-xl font-semibold">
            Admin API not configured
          </h1>
          <p className="mt-2 text-sm">
            Set <code className="font-mono text-xs">NEXT_PUBLIC_ADMIN_API_BASE</code>{" "}
            to your Worker URL, then rebuild the static site. See{" "}
            <code className="font-mono text-xs">ADMIN.md</code>.
          </p>
        </div>
      </div>
    );
  }

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-nile-muted">
        Loading admin…
      </div>
    );
  }

  const visibleTabs = TABS.filter(
    (t) => !t.ownerOnly || user?.role === "owner"
  );

  return (
    <div className="min-h-screen bg-sand">
      <header className="border-b border-nile-ink/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-nile text-sand">
              <Package className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold text-nile-ink">
                Nile Packs Admin
              </p>
              <p className="text-xs text-nile-muted">
                {user?.email} · {user?.role}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void onLogout()}
            className="inline-flex items-center gap-2 rounded-full border border-nile-ink/15 px-3 py-2 text-sm font-medium text-nile-ink hover:bg-nile/5"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6">
          {visibleTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === id
                  ? "bg-nile text-sand shadow-sm"
                  : "text-nile-muted hover:bg-nile/8 hover:text-nile"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {error ? (
          <div className="mb-4 rounded-xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm text-terracotta">
            {error}
          </div>
        ) : null}
        {busy ? (
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-nile-muted">
            Working…
          </p>
        ) : null}

        {tab === "overview" && (
          <section className="space-y-6">
            <h2 className="font-display text-2xl font-semibold text-nile-ink">
              Overview
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Orders",
                  value: String(stats?.orderCount ?? 0),
                },
                {
                  label: "Paid / fulfilled",
                  value: String(stats?.paidCount ?? 0),
                },
                {
                  label: "Revenue (EGP)",
                  value: formatLE(stats?.revenueEGP ?? 0),
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className="rounded-2xl border border-nile-ink/8 bg-white p-5 shadow-sm"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-nile-muted">
                    {c.label}
                  </p>
                  <p className="mt-2 font-display text-2xl font-semibold text-nile">
                    {c.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-nile-ink/8 bg-white p-5 shadow-sm">
              <h3 className="font-display text-lg font-semibold text-nile-ink">
                Recent orders
              </h3>
              {(stats?.recentOrders?.length ?? 0) === 0 ? (
                <p className="mt-3 text-sm text-nile-muted">
                  No orders yet. Empty state is OK until Paymob is live.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-nile-ink/8">
                  {stats!.recentOrders.map((o) => (
                    <li
                      key={o.merchantOrderId}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-nile-ink">{o.name || "—"}</p>
                        <p className="text-xs text-nile-muted">
                          {o.merchantOrderId} · {o.status}
                        </p>
                      </div>
                      <p className="font-semibold text-nile">
                        {formatLE((o.amountCents || 0) / 100)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {tab === "products" && (
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-nile-ink">
              Products
            </h2>
            <div className="space-y-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-3 rounded-2xl border border-nile-ink/8 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-display text-lg font-semibold text-nile-ink">
                      {p.name}
                    </p>
                    <p className="text-xs text-nile-muted">
                      {p.slug} · {formatLE(p.priceLE)}
                      {p.removed ? " · removed" : ""}
                      {!p.inStock ? " · out of stock" : " · in stock"}
                      {p.stockQty != null ? ` · qty ${p.stockQty}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void updateProduct(p.id, { inStock: !p.inStock })
                      }
                      className="rounded-full border border-nile-ink/15 px-3 py-1.5 text-xs font-semibold hover:bg-nile/5"
                    >
                      {p.inStock ? "Mark out of stock" : "Restock"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void updateProduct(p.id, { removed: !p.removed })
                      }
                      className="rounded-full border border-nile-ink/15 px-3 py-1.5 text-xs font-semibold hover:bg-nile/5"
                    >
                      {p.removed ? "Restore" : "Soft-remove"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void updateProduct(p.id, { featured: !p.featured })
                      }
                      className="rounded-full border border-nile-ink/15 px-3 py-1.5 text-xs font-semibold hover:bg-nile/5"
                    >
                      {p.featured ? "Unfeature" : "Feature"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "orders" && (
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-nile-ink">
              Orders
            </h2>
            {orders.length === 0 ? (
              <p className="text-sm text-nile-muted">No orders in KV yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-nile-ink/8 bg-white shadow-sm">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-nile-ink/8 bg-sand/60 text-xs uppercase tracking-wider text-nile-muted">
                    <tr>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr
                        key={o.merchantOrderId}
                        className="border-b border-nile-ink/5"
                      >
                        <td className="px-4 py-3 font-mono text-xs">
                          {o.merchantOrderId}
                        </td>
                        <td className="px-4 py-3">
                          <div>{o.name}</div>
                          <div className="text-xs text-nile-muted">{o.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          {formatLE((o.amountCents || 0) / 100)}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={
                              ["pending", "paid", "fulfilled", "cancelled"].includes(
                                o.status
                              )
                                ? o.status
                                : "pending"
                            }
                            disabled={busy}
                            onChange={(e) =>
                              void updateOrderStatus(
                                o.merchantOrderId,
                                e.target.value as AdminOrder["status"]
                              )
                            }
                            className="rounded-lg border border-nile-ink/15 bg-sand/40 px-2 py-1.5 text-xs"
                          >
                            <option value="pending">pending</option>
                            <option value="paid">paid</option>
                            <option value="fulfilled">fulfilled</option>
                            <option value="cancelled">cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {tab === "team" && user?.role === "owner" && (
          <section className="space-y-6">
            <h2 className="font-display text-2xl font-semibold text-nile-ink">
              Team
            </h2>
            <form
              onSubmit={(e) => void onInvite(e)}
              className="grid gap-3 rounded-2xl border border-nile-ink/8 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4"
            >
              <label className="block sm:col-span-1">
                <span className="text-xs font-bold uppercase tracking-wider text-nile-muted">
                  Email
                </span>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-nile-ink/15 px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-nile-muted">
                  Temp password
                </span>
                <input
                  type="text"
                  required
                  minLength={8}
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-nile-ink/15 px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-nile-muted">
                  Role
                </span>
                <select
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as AdminRole)
                  }
                  className="mt-1 w-full rounded-xl border border-nile-ink/15 px-3 py-2 text-sm"
                >
                  <option value="staff">staff</option>
                  <option value="owner">owner</option>
                </select>
              </label>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-full bg-nile py-2.5 text-sm font-semibold text-sand hover:bg-nile-deep disabled:opacity-50"
                >
                  Add user
                </button>
              </div>
            </form>

            <ul className="space-y-2">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-nile-ink/8 bg-white px-4 py-3 shadow-sm"
                >
                  <div>
                    <p className="font-medium text-nile-ink">{u.email}</p>
                    <p className="text-xs text-nile-muted">
                      {u.role} · {u.active ? "active" : "inactive"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={u.role}
                      disabled={busy || u.id === user?.id}
                      onChange={(e) =>
                        void patchAdminUser(u.id, {
                          role: e.target.value as AdminRole,
                        }).then(() => fetchAdminUsers().then((r) => setUsers(r.users)))
                      }
                      className="rounded-lg border border-nile-ink/15 px-2 py-1.5 text-xs"
                    >
                      <option value="staff">staff</option>
                      <option value="owner">owner</option>
                    </select>
                    <button
                      type="button"
                      disabled={busy || u.id === user?.id}
                      onClick={() =>
                        void patchAdminUser(u.id, { active: !u.active }).then(
                          () =>
                            fetchAdminUsers().then((r) => setUsers(r.users))
                        )
                      }
                      className="rounded-full border border-nile-ink/15 px-3 py-1.5 text-xs font-semibold hover:bg-nile/5 disabled:opacity-40"
                    >
                      {u.active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      disabled={
                        busy || u.id === user?.id || u.id === "owner"
                      }
                      onClick={() => {
                        if (
                          !window.confirm(
                            `Remove ${u.email} from the team? This cannot be undone.`
                          )
                        ) {
                          return;
                        }
                        setBusy(true);
                        setError("");
                        void deleteAdminUser(u.id)
                          .then(() => fetchAdminUsers())
                          .then((r) => setUsers(r.users))
                          .catch((err) =>
                            setError(
                              err instanceof Error
                                ? err.message
                                : "Remove failed"
                            )
                          )
                          .finally(() => setBusy(false));
                      }}
                      className="rounded-full border border-terracotta/40 px-3 py-1.5 text-xs font-semibold text-terracotta hover:bg-terracotta/10 disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

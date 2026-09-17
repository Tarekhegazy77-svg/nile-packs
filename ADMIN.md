# Nile Packs Admin Panel

Owner-only admin UI at `/nile-packs/admin/` (static export) backed by the unified Cloudflare Worker **`nile-packs-api`** (`workers/paymob`).

The storefront keeps `output: 'export'` + `basePath: '/nile-packs'`. Auth is client-only (token in `sessionStorage`).

## What you get

| Area | Routes |
|------|--------|
| Auth | `POST /admin/login`, `POST /admin/logout`, `GET /admin/me` |
| Team (owner) | `GET|POST /admin/users`, `PATCH /admin/users/:id` |
| Products | `GET /admin/products`, `PATCH /admin/products/:id` |
| Sales | `GET /admin/orders`, `GET /admin/stats`, `PATCH /admin/orders/:id` |
| Public catalog | `GET /api/catalog` (non-removed products + stock fields) |
| Paymob (unchanged) | `POST /checkout`, `POST /webhook`, `GET /order/:id` |

First successful login with **no users in KV** seeds the owner from Worker secrets (password stored as PBKDF2-SHA-256 hash, never plaintext).

## Prerequisites

- Cloudflare account + `npx wrangler login`
- Node 20+
- This repo checked out

## 1. Create KV namespaces

From `workers/paymob`:

```bash
cd workers/paymob
npm install
npx wrangler kv namespace create ORDERS
npx wrangler kv namespace create ORDERS --preview
npx wrangler kv namespace create ADMIN
npx wrangler kv namespace create ADMIN --preview
```

Paste the returned IDs into `workers/paymob/wrangler.toml` for bindings `ORDERS` and `ADMIN` (replace `REPLACE_WITH_*` placeholders).

## 2. Set Worker secrets (never commit real values)

```bash
cd workers/paymob

# Owner bootstrap (used only when ADMIN KV has zero users)
npx wrangler secret put ADMIN_OWNER_EMAIL
# paste: Tarekhegazy77@icloud.com

npx wrangler secret put ADMIN_OWNER_PASSWORD
# paste the password from your local .secrets/admin.env (do not put it in git)

npx wrangler secret put SESSION_SECRET
# paste a long random string (session hardening / future use)

# Existing Paymob secrets (if using checkout)
npx wrangler secret put PAYMOB_SECRET_KEY
npx wrangler secret put PAYMOB_HMAC_SECRET
```

Local reference for the owner password (gitignored):

- File: `.secrets/admin.env` with `ADMIN_OWNER_PASSWORD=…`
- `.gitignore` already includes `.secrets/`

**Do not** put the real password in `README`, `.env.example`, or any committed file.

## 3. Deploy the Worker

```bash
cd workers/paymob
# Optional: set non-secret vars in wrangler.toml [vars] (PAYMOB_PUBLIC_KEY, APP_URL, …)
npx wrangler deploy
```

Note the Worker URL, e.g. `https://nile-packs-api.<account>.workers.dev`.

Worker name is **`nile-packs-api`** (replaces the older `nile-packs-paymob` name). Redeploy creates/updates that Worker; update any old bookmarks or `NEXT_PUBLIC_PAYMOB_API_BASE` if you previously used the Paymob-only name.

## 4. Point the static site at the API

Build-time env (GitHub Pages workflow or local):

```bash
# Same Worker hosts admin + Paymob + public catalog
export NEXT_PUBLIC_ADMIN_API_BASE=https://nile-packs-api.<account>.workers.dev
export NEXT_PUBLIC_PAYMOB_API_BASE=https://nile-packs-api.<account>.workers.dev

npm run build
```

If `NEXT_PUBLIC_ADMIN_API_BASE` is empty, the admin UI shows a clear banner: **Admin API not configured**.

## 5. Publish the storefront (`/admin` on live site)

Static export lands in `out/`. Publish **only** `out/` to the `gh-pages` branch (no `node_modules`, no `.next`):

```bash
npm run build
# then push out/ to gh-pages (see your existing Pages workflow or manual orphan-branch publish)
```

Live admin: https://tarekhegazy77-svg.github.io/nile-packs/admin/

## How the owner logs in

1. Open `/nile-packs/admin/login/`
2. Email: `Tarekhegazy77@icloud.com`
3. Password: the value set via `wrangler secret put ADMIN_OWNER_PASSWORD` (same as local `.secrets/admin.env`)
4. On first login with empty `ADMIN` KV, the Worker seeds that owner account automatically

Staff accounts are created by the owner under **Team** (email + temp password + role). Staff can manage products/orders but get **403** on user management.

## CORS

Allowed origins include:

- `https://tarekhegazy77-svg.github.io`
- `http://localhost:3000` / `http://127.0.0.1:3000`
- Origin derived from `APP_URL`

## Local Worker dev

```bash
cd workers/paymob
# Fill preview KV ids in wrangler.toml
# For local secrets, use a gitignored .dev.vars (never commit):
#   ADMIN_OWNER_EMAIL=...
#   ADMIN_OWNER_PASSWORD=...
#   SESSION_SECRET=...
npm run dev
```

Then set `NEXT_PUBLIC_ADMIN_API_BASE=http://127.0.0.1:8787` for `next dev` / a local rebuild.

## Roles

| Role | Products / orders / stats | Manage users |
|------|---------------------------|--------------|
| `owner` | Yes | Yes |
| `staff` | Yes | No (403) |

## Safety

- Never commit `.secrets/` or real passwords
- Do not enable live Paymob charges until explicitly approved
- Do not deploy Wrangler without Cloudflare credentials / login

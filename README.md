# Nile Packs — Digital Packages Storefront

A custom Next.js (App Router) e-commerce storefront for **digital downloads**, priced in **Egyptian pounds (LE)**, with an automatic **site-wide 40% discount** (no coupon). Built with TypeScript, Tailwind CSS v4, and a persisted cart.

Live payments use **Paymob Intention API** via a **Cloudflare Worker** (static export stays compatible with GitHub Pages).

## Quick start

```bash
cd /workspace/packages-store
npm install
npm run dev
```

Open [http://localhost:3000/nile-packs](http://localhost:3000/nile-packs) (basePath `/nile-packs`).

Production build (static export):

```bash
npm run build   # writes ./out
```

## Paymob (live checkout)

See **[PAYMOB.md](./PAYMOB.md)** for full setup.

```bash
npm run worker:install
npm run worker:dev      # Worker on :8787
# .env.local → NEXT_PUBLIC_PAYMOB_API_BASE=http://127.0.0.1:8787
```

If `NEXT_PUBLIC_PAYMOB_API_BASE` is empty, checkout stays in **demo mode** (clear banner, no charge).

## Routes

| Path | Description |
|------|-------------|
| `/` | Home — hero, featured packages |
| `/packages` | Full catalog grid |
| `/packages/[slug]` | Package detail |
| `/cart` | Cart — add/remove/qty |
| `/checkout` | Name + email + phone → Paymob or demo |
| `/payment/complete` | Polls Worker order status after Paymob |
| `/success` | Demo success (session order stub) |

## Editing products

Products live in **`src/lib/products.ts`**.

Each product has: `id`, `slug`, `name`, `description`, `includes[]`, `priceLE`, `featured`.

## Discount

Automatic 40% off is defined in **`src/lib/discount.ts`**. Cart/checkout charge **`subtotalDiscounted`** (EGP cents on Paymob).

## Stack

- Next.js App Router + TypeScript (`output: 'export'`)
- Tailwind CSS v4
- Cloudflare Worker + KV (`ORDERS`) for Paymob
- lucide-react icons

## Env

Copy **`.env.example`** → `.env.local` for the storefront. Worker secrets go through Wrangler — never commit real keys.

## Deploy

- Storefront: GitHub Pages (see `.github/workflows/pages.yml`)
- Worker: `npm run worker:deploy` after `wrangler login` + KV + secrets (PAYMOB.md)

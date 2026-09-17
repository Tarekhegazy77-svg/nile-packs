# Nile Packs — Digital Packages Storefront

A custom Next.js (App Router) e-commerce demo for **digital downloads**, priced in **Egyptian pounds (LE)**, with an automatic **site-wide 40% discount** (no coupon). Built with TypeScript, Tailwind CSS v4, and Zustand (persisted cart).

## Quick start

```bash
cd /workspace/packages-store
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build
npm start
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Home — hero, featured packages |
| `/packages` | Full catalog grid |
| `/packages/[slug]` | Package detail |
| `/cart` | Cart — add/remove/qty |
| `/checkout` | Name + email + demo pay |
| `/success` | Stub download links for last order |

## Editing products

Products live in typed data:

**`src/lib/products.ts`**

Each product has: `id`, `slug`, `name`, `description`, `includes[]`, `priceLE`, `featured`.

Add or edit entries in the `products` array. Featured items appear on the home page (`featured: true`).

## Discount

Automatic 40% off is defined in **`src/lib/discount.ts`**:

```ts
discountedPrice(price) = round(price * 0.6, 2)
```

Change `DISCOUNT_RATE` (currently `0.4`) to adjust the sale everywhere — product cards, detail pages, cart, and checkout all call `discountedPrice`.

UI always shows **strikethrough original** + **sale price**. Cart/checkout totals use discounted amounts only.

## Cart

Client state via Zustand + `localStorage` (`packages-store-cart`). Last demo order is stored in `sessionStorage` for the success page.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS v4 (custom Nile / sand / saffron theme)
- Zustand (persist)
- lucide-react icons

## Notes / caveats

- Payments are **demo-only** — the checkout button simulates success and does not charge a real gateway.
- Download links on `/success` are **stubs** (alert / hash), not real files.
- Not connected to Shopify or any external commerce platform.

## Deploy

See [DEPLOY.md](./DEPLOY.md) for Vercel / Origin steps.

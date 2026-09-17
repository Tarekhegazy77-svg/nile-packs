# Paymob + Cloudflare Worker setup (Nile Packs)

Static GitHub Pages storefront + Cloudflare Worker for Paymob Intention API.
Do **not** put secret keys in the Next.js app or GitHub Pages build.

## Architecture

```
Browser (GitHub Pages)
  → POST {WORKER}/checkout     create Intention (EGP cents)
  → redirect Paymob Unified Checkout
  → Paymob POST {WORKER}/webhook  (HMAC verified → KV ORDERS)
  → Browser /payment/complete/ polls GET {WORKER}/order/:id
```

Worker routes:

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/checkout` | Create Paymob Intention → `{ checkoutUrl, merchantOrderId }` |
| `POST` | `/webhook` | Verify HMAC, mark order `paid` / `failed` in KV |
| `GET` | `/order/:merchantOrderId` | Status for success page |
| `GET` | `/health` | Liveness |

## 1. Paymob dashboard (Tarek)

1. Log in at [Paymob Accept](https://accept.paymob.com/).
2. **Settings → API Keys** — copy:
   - **Secret Key** → `PAYMOB_SECRET_KEY`
   - **Public Key** → `PAYMOB_PUBLIC_KEY`
   - **HMAC Secret** → `PAYMOB_HMAC_SECRET`
3. **Settings → Payment Integrations** — create/open an **online Card** integration.
   Copy its numeric **Integration ID** → `PAYMOB_INTEGRATION_ID_CARD`.
4. Use **test** keys + test integration first; switch to live keys when ready.
5. Amounts are **EGP cents** (piastres). Example: LE 150.00 → `15000`.

Optional: set the integration Transaction Processed callback to your Worker
`https://<worker>/webhook` (the Intention `notification_url` also points there).

## 2. Cloudflare Worker

```bash
cd /workspace/packages-store
npm install
cd workers/paymob && npm install && cd ../..

# Login (browser)
npx wrangler login

# Create KV namespaces (binding name MUST be ORDERS)
npx wrangler kv namespace create ORDERS -c workers/paymob/wrangler.toml
npx wrangler kv namespace create ORDERS --preview -c workers/paymob/wrangler.toml
```

Paste the returned namespace ids into `workers/paymob/wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "ORDERS"
id = "…"
preview_id = "…"
```

Edit `[vars]` in the same file:

- `PAYMOB_PUBLIC_KEY`
- `PAYMOB_INTEGRATION_ID_CARD`
- `APP_URL` = `https://tarekhegazy77-svg.github.io/nile-packs` (no trailing slash)

Set secrets (never commit these):

```bash
npx wrangler secret put PAYMOB_SECRET_KEY -c workers/paymob/wrangler.toml
npx wrangler secret put PAYMOB_HMAC_SECRET -c workers/paymob/wrangler.toml
```

Local / deploy:

```bash
npm run worker:dev      # http://127.0.0.1:8787
npm run worker:deploy   # prints https://nile-packs-paymob.<account>.workers.dev
```

## 3. Storefront env

Create `.env.local` (gitignored) for local builds:

```bash
NEXT_PUBLIC_PAYMOB_API_BASE=https://nile-packs-paymob.<account>.workers.dev
```

Empty / unset → **demo mode** (banner + simulated pay).

For GitHub Pages, add a repository Actions secret / variable
`NEXT_PUBLIC_PAYMOB_API_BASE` and pass it into the build step in
`.github/workflows/pages.yml`:

```yaml
- name: Build
  env:
    NEXT_PUBLIC_PAYMOB_API_BASE: ${{ secrets.NEXT_PUBLIC_PAYMOB_API_BASE }}
  run: npm run build
```

Then rebuild/redeploy Pages so the Worker URL is baked into the static JS.

## 4. Smoke test

1. `npm run worker:dev` + `npm run dev` with `.env.local` set.
2. Add a package → Checkout → name, email, **phone** → Pay.
3. Complete Paymob test card payment.
4. Land on `/payment/complete/` → status becomes `paid`, cart clears.
5. Confirm KV has the order (`wrangler kv key get <id> --binding ORDERS …`).

## HMAC

Webhook verifies **HMAC-SHA512** over the documented Transaction Processed field
order (see Paymob docs). HMAC comes from `?hmac=` (or body `hmac`). Orders are
**not** marked paid unless verification succeeds.

## Notes

- Storefront keeps `output: 'export'` for GitHub Pages — no Next.js API routes.
- Phone is required by Paymob billing.
- Charge amount = cart `subtotalDiscounted` (already 40% off) in EGP cents.
- Do not invent or commit real Paymob keys.


## GitHub Pages build env (manual)

The Actions workflow that sets `NEXT_PUBLIC_PAYMOB_API_BASE` could not be
pushed from this environment (GitHub OAuth lacks the `workflow` scope).

After the Worker is deployed, Tarek should either:

1. Add repo secret `NEXT_PUBLIC_PAYMOB_API_BASE` = Worker URL, and ensure
   `.github/workflows/pages.yml` build step includes:

```yaml
- name: Build
  env:
    NEXT_PUBLIC_PAYMOB_API_BASE: ${{ secrets.NEXT_PUBLIC_PAYMOB_API_BASE }}
  run: npm run build
```

2. Or commit the local `.github/workflows/pages.yml` from a machine/token that
   has the `workflow` scope.

Until that secret is set, the live Pages site stays in **demo checkout** mode.

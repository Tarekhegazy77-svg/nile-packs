# Deploy Nile Packs

Production-ready Next.js app at `/workspace/packages-store`.
`npm run build` succeeds. Preview: `npm run dev` → http://localhost:3000

## Blockers right now
1. No source control connected to Cursor (GitHub / GitLab / Bitbucket / Azure DevOps).
2. Cursor Origin `new_repo` needs an Origin namespace: https://cursor.com/codebase/get-started
3. Full Vercel ↔ Origin deploy needs Origin + Vercel linked to Origin (not a GitHub mirror).

## Recommended path when Tarek is back (Origin + Vercel)
1. Create Origin namespace (link above).
2. Push this project into a new Origin repo (or re-launch cloud agent with `new_repo`).
3. Connect Vercel to Origin (not GitHub mirror).
4. Import the Origin repo in Vercel → Deploy. Framework: Next.js. No env vars required for the demo checkout.

## Alternate path (GitHub + Vercel)
1. Connect GitHub to Cursor (in-chat connect card).
2. Create empty GitHub repo, add remote, push `main`.
3. Vercel → Add New Project → Import that repo → Deploy.

## Local pre-flight (already done)
```bash
cd /workspace/packages-store
npm install
npm run build   # must exit 0
```

## After deploy
- Share the `*.vercel.app` URL
- Optional: custom domain in Vercel → Domains
- Later (Tarek decision): Stripe keys as Vercel env vars; brand rename in UI copy

## What not to do
- Do not mirror Origin → GitHub only to make Vercel work
- Do not wire live payments until Tarek approves

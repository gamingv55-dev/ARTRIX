# Deployment

---

## Vercel

The path of least resistance. Zero config: the image optimiser, route handlers
and static generation all work as-is.

1. Push the repository to GitHub.
2. Import it at vercel.com. Framework detection picks up Next.js.
3. Set the environment variables below.
4. Deploy.

Build command `npm run build`, output handled automatically. Node 20+.

### Environment variables

| Variable                        | Value                        | Required |
| ------------------------------- | ---------------------------- | ---------- |
| `NEXT_PUBLIC_SITE_URL`          | `https://atrix.bg`           | Yes       |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | `true` once a provider is in | No        |

**Set `NEXT_PUBLIC_SITE_URL` before the first production deploy.** Canonical
URLs, the sitemap, Open Graph images and Product structured data are all built
from it. Leaving the default means every one of them points at the wrong origin.

No trailing slash.

---

## Self-hosting

Standard Next.js server:

```bash
npm ci
npm run media        # only if _source-assets changed; public/media is committed
npm run build
npm start            # listens on 3000
```

Behind nginx or Caddy, proxy to `127.0.0.1:3000`. Two things to get right:

- Forward `X-Forwarded-Proto` and `X-Forwarded-Host`, or redirects and absolute
  URLs will be wrong.
- Do not let the proxy strip or override the `Cache-Control` on `/media/*` —
  those headers are set in `next.config.ts` and are correct.

`next/image` optimisation needs `sharp`, which is already a dependency.

### Docker

No Dockerfile is included, because the deployment target isn't decided. If you
add one, use `output: "standalone"` in `next.config.ts` and a multi-stage build:
`sharp` needs its platform binary installed in the runtime stage, not copied from
a different architecture's `node_modules`.

---

## Static export

Not possible as-is. `/api/newsletter` is a route handler and needs a server. If
you genuinely need `output: "export"`, move the newsletter POST to a third-party
endpoint and drop the route — everything else is already static.

---

## Pre-launch checklist

**Correctness**

- [ ] `npm run build` clean
- [ ] `npm test` passing
- [ ] `npm run typecheck` clean
- [ ] `NEXT_PUBLIC_SITE_URL` set to the real origin
- [ ] `/sitemap.xml` and `/robots.txt` resolve and show the right domain

**Content**

- [ ] Real EIK in `src/config/site.ts` — `registration` is a placeholder
- [ ] Real Instagram and TikTok URLs in `site.social`
- [ ] `hello@atrix.bg` actually receives mail
- [ ] Placeholder products deleted or promoted (`Piece 03`, `Piece 04`)
- [ ] Stock counts reflect reality

**Legal** — `/terms` and `/privacy` are drafted as working starting points and
carry a placeholder notice saying so.

- [ ] Both reviewed against current Bulgarian and EU consumer law
- [ ] Placeholder notices removed once reviewed
- [ ] Cookie consent added *if* analytics is switched on — there is none today,
      which is correct while nothing is being tracked

**Commerce** — see `docs/architecture.md`.

- [ ] Checkout connected, or the drawer's honest disabled state left in place
- [ ] Newsletter provider connected, or the honest response left in place
- [ ] Real inventory behind the catalog before taking orders at volume

---

## After launch

**Analytics.** Set `NEXT_PUBLIC_ANALYTICS_ENABLED=true` and add the provider
script to `src/app/layout.tsx`. Every event already fires through `track()` in
`src/lib/analytics.ts` — add the provider to the dispatch list at the bottom of
that file and nothing else changes. Add cookie consent at the same time.

**Search Console.** Submit `https://<domain>/sitemap.xml`. Product structured
data is already emitted on every product page; validate it with the Rich Results
test.

**Monitoring.** `src/app/error.tsx` currently `console.error`s. Point it at a
real reporter (Sentry) when you have one.

---

## Rolling back

Every deploy is immutable on Vercel — promote a previous deployment. Self-hosted,
keep the previous build directory and swap the symlink; `.next` is
self-contained once built.

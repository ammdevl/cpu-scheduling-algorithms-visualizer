# Deployment

The site is a **static export** — `next build` emits plain HTML/CSS/JS to
`out/` with no server component, so it hosts anywhere static files are served.

## Configuration

`next.config.ts`:

```ts
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
};
```

- `output: "export"` — produces the `out/` directory. Server features
  (API routes, server actions, `next start`) must not be used.
- `trailingSlash: true` — emits directory-style URLs
  (`out/algorithms/index.html`), which every static host serves correctly at
  `/algorithms/` (with a redirect from `/algorithms`).
- A `postbuild` step (`scripts/fix-viewport.mjs`) rewrites the emitted
  viewport meta from `width=1280, initial-scale=1` (Next injects the default
  scale) to `width=1280` — without it, phones render the desktop layout at
  100% zoom and only the top-left corner is visible. With no `initial-scale`,
  browsers auto-fit the page to the screen.

Local preview of the production build:

```bash
npm run build
npm run start    # serves out/ via `serve`
```

## Render (current host)

Static Site settings:

| Setting | Value |
| --- | --- |
| Build command | `npm install && npm run build` |
| Publish directory | `out` |
| Branch | `main` (auto-deploy on push) |

A `.nvmrc` pins the Node version for the build image.

## Security headers

`public/_headers` (Netlify-compatible format, honored by Render) is copied
into `out/` at build time and applies:

- `Content-Security-Policy` — everything restricted to `'self'`; inline
  script/style are allowed because Next injects bootstrap data and the
  pre-paint theme script inline. All site resources are self-hosted (fonts via
  `next/font`, no third-party requests).
- `X-Frame-Options: DENY`, `frame-ancestors 'none'` (clickjacking)
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security` (HSTS)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` disabling camera/microphone/geolocation/payment

## SEO artifacts

Emitted at build time and served statically:

- `robots.txt` — allow all, sitemap pointer (`app/robots.ts`)
- `sitemap.xml` — `/`, `/algorithms/`, `/comparison/` (`app/sitemap.ts`)
- Canonical URLs on every page (`metadataBase` + per-page `alternates`)
- Open Graph and Twitter card metadata (layout)
- JSON-LD `WebApplication` structured data on the home page

## Custom domain

Point the domain at the Render site and add a redirect from www if needed;
update `metadataBase`, `robots.ts`, `sitemap.ts`, the JSON-LD `url` and the
README demo link to the new domain.

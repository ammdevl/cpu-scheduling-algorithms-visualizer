# Contributing

## Setup

Requires Node.js 20.9+ (a `.nvmrc` pins the version for CI/Render).

```bash
npm install
npm run dev        # http://localhost:3000
```

| Command | Purpose |
| --- | --- |
| `npm run lint` | ESLint — must pass with 0 errors |
| `npm run test` | Vitest once — all tests must pass |
| `npm run build` | Production build (static export to `out/`) |
| `npm run test:watch` | Vitest watch mode |

Always run lint + tests + build before opening a PR.

## Code conventions

- TypeScript strict; no code comments unless explicitly requested.
- Components use **named exports** (no default exports) and live in
  `src/components/<Name>/<Name>.tsx` + `<Name>.module.scss`.
- Add `'use client'` whenever a file uses hooks, events or browser APIs.
  Route segment config (`metadata`, `viewport`) only works in server
  components — split client pages into a server `page.tsx` wrapper plus a
  client component (see `app/comparison/`).
- Dynamic route `params` are Promises in Next 16 — `await` them.
- SCSS Modules only; import shared tokens with
  `@use '@/styles/tokens'` (`tokens.card`, `tokens.md-up`,
  `tokens.$radius-*`). Colors/fonts come from CSS custom properties defined in
  `app/globals.scss` (theme-aware via `[data-theme='dark']`) — never hardcode
  colors. Never place bare element selectors at a module's top level (CSS
  Modules purity) — scope them under a local class.
- Engine code (`src/lib/scheduler/`) must stay pure TypeScript: no React, no
  DOM, no imports from `app/` or `components/`.

## Accessibility standards

These are enforced in review — new UI must follow them:

- One `h1` per page; headings never skip levels.
- Every interactive element has an accessible name; icon-only controls get
  `aria-label`.
- Form errors are announced (`role="alert"`); status updates that matter use
  `aria-live`.
- Data tables have `<caption>` (visually hidden via `.srOnly`) and explicit
  `scope` attributes.
- Decorative SVGs are `aria-hidden="true"`.
- Color pairs must meet WCAG AA (4.5:1 normal text, 3:1 large) in **both**
  themes — the shared tokens are pre-checked; prefer them over new colors.
- Respect `prefers-reduced-motion` for any animation (see `Reveal`,
  `ScrollHint`, `Skeleton`).
- Keep touch targets at least ~32px; test widths ~360px (forced-desktop
  viewport) and ~1280px.

## Testing rules

- `src/lib/scheduler/__tests__/` contains golden fixtures pinning all engine
  variants to the classic five-process example (see
  [algorithms.md](./algorithms.md) for the exact numbers). **Never edit
  fixtures to make a failing engine pass** — a failure means behavior drifted
  from the documented conventions.
- Frame tests pin per-tick queue order and remaining times.
- New engine features need new tests; bug fixes need a regression test.
- Validation is enforced twice: engines throw on invalid input, the UI
  validates continuously and shows errors instead of crashing.

## Adding a feature — checklist

1. Engine change? Update `docs/algorithms.md` conventions if semantics moved,
   and keep every golden test green (or update them deliberately + document).
2. UI change? Follow the conventions above; check light + dark themes and the
   360px forced-desktop viewport.
3. Run `npm run lint && npm run test && npm run build`.
4. Open a PR with a summary and test plan; squash-merge to `main`.

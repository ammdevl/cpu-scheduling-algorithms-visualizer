# AGENTS.md

Instructions for coding agents working in this repository.

## Project

CPU Scheduling Visualizer — a Next.js (App Router) + TypeScript + SCSS web app
that simulates CPU scheduling algorithms (FCFS, RR, SPN, SRT, HRRN, Feedback)
step by step for OS learners. Fully client-side; no backend.

## Commands

```bash
npm run lint        # ESLint — must pass with 0 errors
npm run test        # Vitest once — all tests must pass
npm run build       # Production build — must succeed
npm run dev         # Dev server
```

Always verify a finished task with `npm run lint`, `npm run test`, and
`npm run build` before reporting done.

## Architecture

Two strictly separated layers:

1. **Engine layer** — `src/lib/scheduler/` (pure TypeScript, no React, no DOM,
   no imports from `app/` or `components/`):
   - One file per algorithm (`fcfs.ts`, `rr.ts`, `spn.ts`, `srt.ts`, `hrrn.ts`,
     `feedback.ts`) exporting `simulateX(processes, options?): SimResult`.
   - `frames.ts` converts a `SimResult` into per-tick playback frames. The UI
     must never re-implement scheduling logic; it replays frames.
   - `registry.ts` holds algorithm metadata (name, decision mode, selection
     function, `how` steps, `note`, `hasQuantum`) and `runAlgorithm()`.
   - `core.ts` owns validation and metric finalization.
2. **UI layer** — `src/app/` (pages) and `src/components/` (one folder per
   component: `X.tsx` + `X.module.scss`).

State lives in `src/lib/store.ts` (Zustand, `skipHydration: true`, persisted
under key `csv-sim`). Components gate store-dependent rendering on
`useStoreHydration()` and render skeletons (`VisualizerSkeleton` / `Skeleton`)
until ready.

## Critical rules

- **Golden tests are the source of truth.**
  `src/lib/scheduler/__tests__/` pins all algorithm variants to the classic
  five-process example (A–E: arrivals 0,2,4,6,8; service 3,6,4,5,2) — exact
  per-process finish times, means, and full Gantt execution order. Never modify
  fixtures to make a failing engine pass. The pinned scheduling conventions:
  - A process arriving exactly when another's quantum expires enqueues BEFORE
    the expired process rejoins.
  - SRT preempts only on strictly smaller remaining time; ties continue the
    running process.
  - Feedback: arrivals enter the top queue; a quantum expiring while others
    wait demotes one level; uncontended quanta keep the level; no mid-quantum
    preemption; FIFO within a level; per-level quanta clamped to >= 1.
  If a convention must change, update fixtures AND document it in README.md.
- **No code comments** unless the user explicitly asks.
- **SCSS**: use CSS Modules (`*.module.scss`); import tokens with
  `@use '@/styles/tokens'` (mixins: `tokens.card`, `tokens.md-up`,
  `tokens.$radius-*`); colors/fonts come from CSS custom properties defined in
  `src/app/globals.scss` (theme-aware via `[data-theme='dark']`). CSS Modules
  purity: never place bare element selectors (`h2 { }`) at a module's top
  level — scope them under a local class.
- **Components**: named exports only (no default exports). Add `'use client'`
  whenever a file uses hooks, events, or browser APIs. Dynamic route `params`
  are Promises in Next 16 — `await` them.
- **Theme**: light is the default. Theme is set pre-paint by the inline script
  in `layout.tsx` (`data-theme` on `<html>`, localStorage key `csv-theme`);
  do not read system preference there.
- **Validation**: engines throw on invalid input (empty list, duplicate ids,
  non-integer or out-of-range times). UI must catch and display errors, never
  crash. RR/Feedback quanta are clamped to a minimum of 1 by design.
- **Adding an algorithm**: engine file + registry entry (with `how`/`note`) +
  golden tests from a trusted reference + entry in README's algorithm list.
  Follow the existing non-preemptive/preemptive engine patterns.
- **Loading states**: any route with client-side data needs a `loading.tsx`
  skeleton; store-hydration states render `VisualizerSkeleton`, not spinners.

## Style

- TypeScript strict; prefer existing patterns over new abstractions.
- User-facing text: full algorithm names (no unexplained abbreviations).
- Keep everything responsive; test widths ~360px and ~1280px mentally.

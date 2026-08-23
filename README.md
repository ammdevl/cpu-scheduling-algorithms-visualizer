# CPU Scheduling Visualizer Algorithms

An interactive web app for learning CPU scheduling algorithms. Enter a process
workload, pick a policy, and watch the simulation unfold tick by tick — with
lecture-style Gantt tables, a live ready queue, and turnaround metrics for every
algorithm.

Live demo: [CPU Scheduling Algorithms Visualizer](https://cpu-scheduling-algorithms-visualizer.onrender)

Repository: [ammdevl@github:cpu-scheduling-algorithms-visualizer](https://github.com/ammdevl/cpu-scheduling-algorithms-visualizer)

## Features

- Six classic scheduling policies, simulated step by step:
  - First-Come, First-Served (FCFS) — non-preemptive
  - Round Robin (RR) — preemptive, configurable quantum (1–20)
  - Shortest Process Next (SPN) — non-preemptive
  - Shortest Remaining Time (SRT) — preemptive SPN
  - Highest Response Ratio Next (HRRN) — non-preemptive, R = (w + s)/s
  - Feedback (FB) — multilevel feedback queues, per-level quantum presets (2^i or uniform)
- Playback controls: run/pause, step forward/back, reset, jump to final, 0.5×–2× speed
- Live status: CPU clock, active process, remaining time, ordered ready queue
  (with feedback queue levels)
- Gantt table: one row per process, one column per time unit; cells fill in as
  the clock advances
- Metrics per process: finish time, turnaround (Tr), normalized Tr/Ts, waiting —
  plus means, mirroring the classic textbook tables
- Comparison page: all six algorithms side by side on the same workload, best
  values highlighted
- Editable workload (add/remove/edit processes) persisted in localStorage
- Dark/light theme (light default), responsive layout, skeleton loading states,
  scroll-reveal animations

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- SCSS modules with shared design tokens
- [Zustand](https://zustand.docs.pmnd.rs) for simulation state (persisted)
- Hand-built table/SVG-free visualization components
- [Vitest](https://vitest.dev) for engine tests

Everything runs client-side — no backend, no database. The app prerenders as
static content.

## Getting started

Requires Node.js 20+.

```bash
git clone https://github.com/ammdevl/cpu-scheduling-algorithms-visualizer
cd cpu-scheduling-algorithms-visualizer
npm install
npm run dev
```

Open http://localhost:3000.

### Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the development server         |
| `npm run build`   | Production build                     |
| `npm run start`   | Serve the production build           |
| `npm run lint`    | Run ESLint                           |
| `npm run test`    | Run the engine test suite once       |
| `npm run test:watch` | Run tests in watch mode           |

## Project structure

```
src/
  app/                      # App Router pages
    page.tsx                #   landing page
    algorithms/             #   interactive visualizer (+ loading.tsx skeleton)
    comparison/             #   all-algorithms comparison (+ loading.tsx skeleton)
    globals.scss            #   theme tokens (light/dark via data-theme)
    icon.svg                #   favicon
  components/               # UI components (folder = component + .module.scss)
    AlgorithmPicker/        #   algorithm dropdown + parameter controls
    ProcessEditor/          #   workload table (add/edit/remove/reset)
    GanttTable/             #   lecture-style Gantt (process rows × time columns)
    MetricsTable/           #   finish / Tr / Tr-Ts / waiting table
    Visualizer/             #   playback controls, status, queue, results
    VisualizerSkeleton/     #   loading wireframe shared by page + hydration states
    Skeleton/               #   shimmer building block
    NavBar/ ThemeToggle/ Reveal/
  lib/
    scheduler/              # pure simulation core (no React, no DOM)
      types.ts              #   ProcessInput, Segment, SimEvent, SimResult, ...
      core.ts               #   validation + metrics finalization
      fcfs.ts rr.ts spn.ts srt.ts hrrn.ts feedback.ts
      frames.ts             #   converts a SimResult into per-tick playback frames
      registry.ts           #   algorithm metadata, defaults, runAlgorithm()
      __tests__/            #   golden fixtures + frame tests
  lib/store.ts              # zustand store (processes, algorithm, params; persisted)
  styles/_tokens.scss       # SCSS variables/mixins shared by modules
```

## How the simulation works

Each engine is a pure function:

```
(processes, options) => SimResult
```

`SimResult` contains the execution `segments` (with feedback queue levels), a
narrated `events` log, per-process `metrics` with summary means, the `makespan`,
and (for RR/FB) a `queueTimeline` of ready-queue snapshots. The UI never
implements scheduling logic — `frames.ts` replays a `SimResult` into per-tick
frames for the step-by-step playback.

Scheduling conventions (chosen to reproduce the classic worked example exactly):

- A process arriving at the instant another's quantum expires enters the ready
  queue before the preempted process rejoins.
- SRT preempts only on strictly smaller remaining time; ties continue the
  running process.
- Feedback: new arrivals enter the top queue; a quantum that expires while
  others are waiting demotes the process one level; uncontended quanta keep the
  level; no mid-quantum preemption; FIFO within each level.

## Testing

The engines are pinned to the classic five-process example
(A–E, arrivals 0/2/4/6/8, service 3/6/4/5/2). The golden tests assert, for all
eight algorithm variants, the exact per-process finish times, mean turnaround,
mean Tr/Ts, and the full execution order of the Gantt chart — plus frame and
edge-case tests.

```bash
npm run test
```

If you change an engine, every test must stay green. If you intentionally
change a scheduling convention, update the fixtures deliberately and document
the new rule here.

## Deployment

The app uses Next.js static export (`output: "export"` in `next.config.ts`):
`npm run build` emits a fully static `out/` directory (with directory-style
URLs via `trailingSlash: true`), so it hosts anywhere that serves static
files.

**Render (Static Site) settings:**

| Setting | Value |
| --- | --- |
| Build command | `npm install && npm run build` |
| Publish directory | `out` |

Other hosts (Vercel/Netlify/Render Web Service) work with the default Next.js
settings too. To preview the production build locally:

```bash
npm run build
npm run start   # serves the out/ directory
```

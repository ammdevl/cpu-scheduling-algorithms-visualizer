# Data model

Reference for the core types (`src/lib/scheduler/types.ts`), the derived
playback frames (`frames.ts`) and the persisted UI state (`src/lib/store.ts`).

## Input

```ts
interface ProcessInput {
  id: string;        // unique, non-empty (UI: max 6 chars)
  arrival: number;   // integer 0-999
  service: number;   // integer 1-500
}
```

## Simulation output

```ts
interface Segment {
  pid: string;
  start: number;               // inclusive
  end: number;                 // exclusive
  level?: number;              // feedback queue level (FB only)
  endedBy?: 'completed' | 'quantum-expired' | 'preempted';
}

interface SimEvent {
  t: number;
  kind: 'arrive' | 'dispatch' | 'complete' | 'quantum-expired' | 'preempt' | 'idle';
  pid?: string;
  detail: string;              // human-readable narration
}

interface ProcessMetrics {
  finish: number;      // last segment end
  turnaround: number;  // finish - arrival
  normTr: number;      // turnaround / service
  waiting: number;     // turnaround - service
}

interface QueueSnapshot {
  t: number;
  queue: { pid: string; level?: number }[];  // priority order (RR: FIFO, FB: level then FIFO)
}

interface SimResult {
  segments: Segment[];
  events: SimEvent[];
  metrics: Record<string, ProcessMetrics>;
  summary: { meanTurnaround; meanNormTr; meanWaiting };
  makespan: number;
  queueTimeline?: QueueSnapshot[];   // RR + Feedback
}
```

Invariants: segments never overlap, tile `[0, makespan]` contiguously (idle
gaps appear as `idle` events but no segment), and every process has at least
one segment.

## Playback frames

`buildFrames(result, processes, sortBy)` produces `makespan + 1` frames:

```ts
interface SimFrame {
  t: number;                     // clock at the start of unit [t, t+1)
  running: string | null;        // pid owning the CPU (null = idle)
  runningLevel: number | null;   // feedback level of the running process
  queue: QueueEntry[];           // ordered waiting processes + remaining time
  remaining: Record<string, number>;
  completed: string[];
  events: SimEvent[];            // events stamped exactly at t
  justCompleted: string[];       // processes whose finish == t
}
```

Frame `t` is a snapshot *before* unit `[t, t+1)` runs; the last frame
(`t = makespan`) is the terminal state (all completed, queue empty).

For algorithms with a `queueTimeline` the queue order comes from the engine
snapshots; otherwise it is derived (sorted by remaining time for SRT, by
arrival for the rest) so the display always matches the policy.

## UI store

```ts
{
  processes: ProcessInput[];   // defaults to the classic five-process example
  algorithm: AlgoId;           // 'fcfs' | 'rr' | 'spn' | 'srt' | 'hrrn' | 'feedback'
  quantum: number;             // RR quantum, clamped 1-50 (UI offers 1-20)
  fbPreset: 'exp2' | 'flat1';  // Feedback quanta: 2^i or uniform 1
}
```

- Persisted via Zustand `persist` to localStorage key **`csv-sim`**
  (only the four data fields, not the actions) with `skipHydration: true`;
  pages rehydrate through `useStoreHydration()` and render skeletons until
  ready.
- The theme is stored separately under **`csv-theme`** (`light` | `dark`) and
  applied pre-paint by an inline script that sets `data-theme` on `<html>`.

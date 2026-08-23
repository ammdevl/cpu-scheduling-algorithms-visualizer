import { finalize, validateProcesses } from './core';
import type { ProcessInput, SimEvent, SimResult, Segment } from './types';

export function simulateSrt(processes: ProcessInput[]): SimResult {
  const procs = validateProcesses(processes);
  const n = procs.length;
  const remaining = procs.map((p) => p.service);
  const segments: Segment[] = [];
  const events: SimEvent[] = [];
  let t = 0;
  let nextIdx = 0;
  let current = -1;
  let unfinished = n;

  const admitArrivals = (): boolean => {
    let admitted = false;
    while (nextIdx < n && procs[nextIdx].arrival <= t) {
      const p = procs[nextIdx++];
      events.push({ t: p.arrival, kind: 'arrive', pid: p.id, detail: `${p.id} arrives (service ${p.service})` });
      admitted = true;
    }
    return admitted;
  };

  const pickBest = (exclude?: number): number => {
    let best = -1;
    for (let i = 0; i < nextIdx; i++) {
      if (remaining[i] <= 0 || i === exclude) continue;
      if (best === -1 || remaining[i] < remaining[best]) best = i;
    }
    return best;
  };

  while (unfinished > 0) {
    admitArrivals();
    if (current === -1) {
      const best = pickBest();
      if (best === -1) {
        const na = procs[nextIdx].arrival;
        events.push({ t, kind: 'idle', detail: `CPU idle until t=${na}` });
        t = na;
        continue;
      }
      current = best;
      events.push({
        t,
        kind: 'dispatch',
        pid: procs[current].id,
        detail: `${procs[current].id} dispatched (shortest remaining=${remaining[current]})`,
      });
    } else {
      const challenger = pickBest();
      if (challenger !== -1 && remaining[challenger] < remaining[current]) {
        events.push({
          t,
          kind: 'preempt',
          pid: procs[current].id,
          detail: `${procs[challenger].id} (remaining ${remaining[challenger]}) preempts ${procs[current].id} (remaining ${remaining[current]})`,
        });
        current = challenger;
        events.push({
          t,
          kind: 'dispatch',
          pid: procs[current].id,
          detail: `${procs[current].id} dispatched (shortest remaining=${remaining[current]})`,
        });
      }
    }

    let preemptAt = Infinity;
    for (let j = nextIdx; j < n; j++) {
      if (procs[j].service < remaining[current] && procs[j].arrival > t) {
        preemptAt = procs[j].arrival;
        break;
      }
    }
    const end = Math.min(t + remaining[current], preemptAt);
    const completes = remaining[current] <= preemptAt - t;
    segments.push({
      pid: procs[current].id,
      start: t,
      end,
      endedBy: completes ? 'completed' : 'preempted',
    });
    remaining[current] -= end - t;
    if (completes) {
      events.push({ t: end, kind: 'complete', pid: procs[current].id, detail: `${procs[current].id} completed at t=${end}` });
      remaining[current] = 0;
      unfinished -= 1;
      current = -1;
    }
    t = end;
  }
  return finalize(procs, segments, events);
}

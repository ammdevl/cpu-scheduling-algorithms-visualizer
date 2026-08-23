import { finalize, validateProcesses } from './core';
import type { ProcessInput, QueueSnapshot, RunOptions, SimEvent, SimResult, Segment } from './types';

export function simulateRr(processes: ProcessInput[], options?: RunOptions): SimResult {
  const raw = options?.quantum ?? 1;
  if (!Number.isFinite(raw)) {
    throw new Error('RR quantum must be a finite number');
  }
  const quantum = Math.max(1, Math.floor(raw));
  const procs = validateProcesses(processes);
  const n = procs.length;
  const remaining = procs.map((p) => p.service);
  const queue: number[] = [];
  const segments: Segment[] = [];
  const events: SimEvent[] = [];
  const queueTimeline: QueueSnapshot[] = [];
  let t = 0;
  let nextIdx = 0;
  let current = -1;

  const snap = (time: number) => {
    queueTimeline.push({ t: time, queue: queue.map((i) => ({ pid: procs[i].id })) });
  };

  const admit = (uptoInclusive: number, into: number[]): void => {
    while (nextIdx < n && procs[nextIdx].arrival <= uptoInclusive) {
      const p = procs[nextIdx++];
      events.push({ t: p.arrival, kind: 'arrive', pid: p.id, detail: `${p.id} arrives (service ${p.service})` });
      into.push(nextIdx - 1);
    }
  };

  while (current !== -1 || queue.length > 0 || nextIdx < n) {
    admit(t, queue);
    snap(t);
    if (current === -1) {
      if (queue.length === 0) {
        const na = procs[nextIdx].arrival;
        events.push({ t, kind: 'idle', detail: `CPU idle until t=${na}` });
        t = na;
        continue;
      }
      current = queue.shift()!;
      snap(t);
      events.push({ t, kind: 'dispatch', pid: procs[current].id, detail: `${procs[current].id} dispatched (quantum=${quantum})` });
    }
    const run = Math.min(quantum, remaining[current]);
    const end = t + run;
    const arrivalsInSlice: number[] = [];
    admit(end, arrivalsInSlice);
    segments.push({
      pid: procs[current].id,
      start: t,
      end,
      endedBy: remaining[current] <= run ? 'completed' : 'quantum-expired',
    });
    remaining[current] -= run;
    queue.push(...arrivalsInSlice);
    snap(end);
    if (remaining[current] === 0) {
      events.push({ t: end, kind: 'complete', pid: procs[current].id, detail: `${procs[current].id} completed at t=${end}` });
    } else {
      events.push({ t: end, kind: 'quantum-expired', pid: procs[current].id, detail: `${procs[current].id} quantum expired (remaining ${remaining[current]}) → requeued` });
      queue.push(current);
      snap(end);
    }
    current = -1;
    t = end;
  }
  const result = finalize(procs, segments, events);
  return { ...result, queueTimeline };
}

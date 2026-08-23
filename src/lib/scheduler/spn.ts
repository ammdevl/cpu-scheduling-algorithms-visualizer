import { finalize, validateProcesses } from './core';
import type { ProcessInput, SimEvent, SimResult, Segment } from './types';

export function simulateSpn(processes: ProcessInput[]): SimResult {
  const procs = validateProcesses(processes);
  const pending = [...procs];
  const ready: ProcessInput[] = [];
  const segments: Segment[] = [];
  const events: SimEvent[] = [];
  let t = 0;
  while (pending.length > 0 || ready.length > 0) {
    while (pending.length > 0 && pending[0].arrival <= t) {
      const p = pending.shift()!;
      events.push({ t: p.arrival, kind: 'arrive', pid: p.id, detail: `${p.id} arrives (service ${p.service})` });
      ready.push(p);
    }
    if (ready.length === 0) {
      const next = pending[0];
      events.push({ t, kind: 'idle', detail: `CPU idle until t=${next.arrival}` });
      t = next.arrival;
      continue;
    }
    let best = 0;
    for (let i = 1; i < ready.length; i++) {
      if (ready[i].service < ready[best].service) best = i;
    }
    const p = ready.splice(best, 1)[0];
    events.push({ t, kind: 'dispatch', pid: p.id, detail: `${p.id} dispatched (shortest service=${p.service})` });
    const end = t + p.service;
    segments.push({ pid: p.id, start: t, end, endedBy: 'completed' });
    events.push({ t: end, kind: 'complete', pid: p.id, detail: `${p.id} completed at t=${end}` });
    t = end;
  }
  return finalize(procs, segments, events);
}

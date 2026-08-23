import { finalize, validateProcesses } from './core';
import type { ProcessInput, SimEvent, SimResult, Segment } from './types';

export function simulateFcfs(processes: ProcessInput[]): SimResult {
  const procs = validateProcesses(processes);
  const segments: Segment[] = [];
  const events: SimEvent[] = [];
  let t = 0;
  for (const p of procs) {
    if (p.arrival > t) {
      events.push({ t, kind: 'idle', detail: `CPU idle until t=${p.arrival}` });
      t = p.arrival;
    }
    events.push({ t, kind: 'dispatch', pid: p.id, detail: `${p.id} dispatched (arrival order)` });
    const end = t + p.service;
    segments.push({ pid: p.id, start: t, end, endedBy: 'completed' });
    events.push({ t: end, kind: 'complete', pid: p.id, detail: `${p.id} completed at t=${end}` });
    t = end;
  }
  return finalize(procs, segments, events);
}

import type { ProcessInput, ProcessMetrics, Segment, SimEvent, SimResult, SimSummary } from './types';

export function validateProcesses(processes: ProcessInput[]): ProcessInput[] {
  if (!Array.isArray(processes) || processes.length === 0) {
    throw new Error('At least one process is required');
  }
  const seen = new Set<string>();
  processes.forEach((p, i) => {
    if (!p.id || typeof p.id !== 'string') {
      throw new Error(`Process at index ${i} has an invalid id`);
    }
    if (seen.has(p.id)) {
      throw new Error(`Duplicate process id: ${p.id}`);
    }
    seen.add(p.id);
    if (!Number.isFinite(p.arrival) || p.arrival < 0) {
      throw new Error(`Process ${p.id}: arrival time must be a finite number >= 0`);
    }
    if (!Number.isFinite(p.service) || p.service <= 0) {
      throw new Error(`Process ${p.id}: service time must be a finite number > 0`);
    }
  });
  return [...processes].sort((a, b) => a.arrival - b.arrival);
}

export function finalize(
  procs: ProcessInput[],
  segments: Segment[],
  events: SimEvent[]
): SimResult {
  const metrics: Record<string, ProcessMetrics> = {};
  let makespan = 0;
  for (const p of procs) {
    let finish = 0;
    for (const s of segments) {
      if (s.pid === p.id && s.end > finish) finish = s.end;
    }
    const turnaround = finish - p.arrival;
    metrics[p.id] = {
      finish,
      turnaround,
      normTr: turnaround / p.service,
      waiting: turnaround - p.service,
    };
    if (finish > makespan) makespan = finish;
  }
  const n = procs.length;
  const sum = (fn: (m: ProcessMetrics) => number) =>
    procs.reduce((acc, p) => acc + fn(metrics[p.id]), 0);
  const summary: SimSummary = {
    meanTurnaround: sum((m) => m.turnaround) / n,
    meanNormTr: sum((m) => m.normTr) / n,
    meanWaiting: sum((m) => m.waiting) / n,
  };
  return { segments, events, metrics, summary, makespan };
}

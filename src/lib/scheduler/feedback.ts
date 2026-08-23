import { finalize, validateProcesses } from './core';
import type { ProcessInput, QueueSnapshot, RunOptions, SimEvent, SimResult, Segment } from './types';

export function fbQuantaConstant(q = 1): number[] {
  return new Array(16).fill(Math.max(1, Math.floor(q)));
}

export function fbQuantaExponential(base = 2, levels = 16): number[] {
  return Array.from({ length: levels }, (_, i) => Math.max(1, Math.floor(base ** i)));
}

export function simulateFeedback(processes: ProcessInput[], options?: RunOptions): SimResult {
  const raw = options?.quanta;
  if (!raw || raw.length === 0 || raw.some((v) => !Number.isFinite(v) || v < 1)) {
    throw new Error('Feedback requires at least one quantum >= 1 per level');
  }
  const quanta = raw.map((v) => Math.max(1, Math.floor(v)));
  const procs = validateProcesses(processes);
  const n = procs.length;
  const remaining = procs.map((p) => p.service);
  const levelOf = new Array<number>(n).fill(0);
  const levels: number[][] = [[]];
  const segments: Segment[] = [];
  const events: SimEvent[] = [];
  let t = 0;
  let nextIdx = 0;
  let current = -1;
  let currentLevel = 0;
  let contested = false;

  const totalQueued = (): number => levels.reduce((acc, q) => acc + q.length, 0);

  const queueTimeline: QueueSnapshot[] = [];
  const snap = (time: number) => {
    queueTimeline.push({
      t: time,
      queue: levels.flatMap((q, lvl) => q.map((i) => ({ pid: procs[i].id, level: lvl }))),
    });
  };

  const admit = (upto: number, strict: boolean): boolean => {
    let admitted = false;
    while (
      nextIdx < n &&
      procs[nextIdx].arrival <= upto &&
      (!strict || procs[nextIdx].arrival < upto)
    ) {
      const idx = nextIdx++;
      const p = procs[idx];
      events.push({ t: p.arrival, kind: 'arrive', pid: p.id, detail: `${p.id} arrives (service ${p.service})` });
      levels[0].push(idx);
      admitted = true;
    }
    return admitted;
  };

  while (true) {
    admit(t, false);
    if (current !== -1) {
      if (contested) {
        const newLevel = currentLevel + 1;
        if (levels[newLevel] === undefined) levels[newLevel] = [];
        levelOf[current] = newLevel;
        levels[newLevel].push(current);
        events.push({
          t,
          kind: 'quantum-expired',
          pid: procs[current].id,
          detail: `${procs[current].id} quantum expired (remaining ${remaining[current]}) → demoted to level ${newLevel}`,
        });
      } else {
        levels[currentLevel].push(current);
        events.push({
          t,
          kind: 'quantum-expired',
          pid: procs[current].id,
          detail: `${procs[current].id} quantum expired (remaining ${remaining[current]}) → stays at level ${currentLevel} (uncontended)`,
        });
      }
      snap(t);
      current = -1;
    }
    const lvl = levels.findIndex((q) => q.length > 0);
    if (lvl === -1) {
      if (nextIdx >= n) break;
      const na = procs[nextIdx].arrival;
      events.push({ t, kind: 'idle', detail: `CPU idle until t=${na}` });
      t = na;
      continue;
    }
    current = levels[lvl].shift()!;
    currentLevel = lvl;
    snap(t);
    const q = quanta[Math.min(currentLevel, quanta.length - 1)];
    const run = Math.min(q, remaining[current]);
    const end = t + run;
    events.push({
      t,
      kind: 'dispatch',
      pid: procs[current].id,
      detail: `${procs[current].id} dispatched at level ${currentLevel} (quantum=${q})`,
    });
    const contestedAtStart = totalQueued() > 0;
    const arrivalDuring = admit(end, true);
    if (arrivalDuring) snap(end);
    contested = contestedAtStart || arrivalDuring;
    segments.push({
      pid: procs[current].id,
      start: t,
      end,
      level: currentLevel,
      endedBy: remaining[current] <= run ? 'completed' : 'quantum-expired',
    });
    remaining[current] -= run;
    t = end;
    if (remaining[current] === 0) {
      events.push({ t: end, kind: 'complete', pid: procs[current].id, detail: `${procs[current].id} completed at t=${end}` });
      current = -1;
    }
  }
  const result = finalize(procs, segments, events);
  return { ...result, queueTimeline };
}

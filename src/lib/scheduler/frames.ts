import type { ProcessInput, SimEvent, SimResult } from './types';

export interface QueueEntry {
  pid: string;
  level?: number;
  remaining?: number;
}

export interface SimFrame {
  t: number;
  running: string | null;
  runningLevel: number | null;
  queue: QueueEntry[];
  remaining: Record<string, number>;
  completed: string[];
  events: SimEvent[];
  justCompleted: string[];
}

export function buildFrames(
  result: SimResult,
  processes: ProcessInput[],
  sortBy: 'arrival' | 'remaining' = 'arrival'
): SimFrame[] {
  const finish = new Map<string, number>();
  for (const [pid, m] of Object.entries(result.metrics)) finish.set(pid, m.finish);
  const order = new Map(processes.map((p, i) => [p.id, i]));

  const runningAt: (string | null)[] = [];
  const levelAt: (number | null)[] = [];
  for (let t = 0; t < result.makespan; t++) {
    runningAt.push(null);
    levelAt.push(null);
  }
  for (const seg of result.segments) {
    for (let t = Math.floor(seg.start); t < seg.end && t < result.makespan; t++) {
      runningAt[t] = seg.pid;
      levelAt[t] = seg.level ?? null;
    }
  }

  const executedBy = (pid: string, t: number): number => {
    let executed = 0;
    for (const seg of result.segments) {
      if (seg.pid !== pid) continue;
      executed += Math.max(0, Math.min(seg.end, t) - seg.start);
    }
    return executed;
  };

  const timeline = result.queueTimeline;
  const frames: SimFrame[] = [];
  for (let t = 0; t <= result.makespan; t++) {
    const running = t < result.makespan ? runningAt[t] : null;
    const runningLevel = t < result.makespan ? levelAt[t] : null;
    const completed = processes
      .filter((p) => (finish.get(p.id) ?? Infinity) <= t)
      .map((p) => p.id);
    const justCompleted =
      t === 0 ? [] : processes.filter((p) => finish.get(p.id) === t).map((p) => p.id);
    const remaining: Record<string, number> = {};
    for (const p of processes) remaining[p.id] = p.service - executedBy(p.id, t);

    let queue: QueueEntry[];
    if (timeline && timeline.length > 0) {
      let snapIdx = -1;
      for (let i = 0; i < timeline.length; i++) {
        if (timeline[i].t <= t) snapIdx = i;
        else break;
      }
      const snap = snapIdx >= 0 ? timeline[snapIdx].queue : [];
      queue = snap.filter((e) => !completed.includes(e.pid) && e.pid !== running);
    } else {
      queue = processes
        .filter(
          (p) => p.arrival <= t && (finish.get(p.id) ?? Infinity) > t && p.id !== running
        )
        .sort((a, b) => {
          if (sortBy === 'remaining') {
            const d = remaining[a.id] - remaining[b.id];
            if (d !== 0) return d;
          }
          return (a.arrival - b.arrival) || (order.get(a.id)! - order.get(b.id)!);
        })
        .map((p) => ({ pid: p.id, remaining: remaining[p.id] }));
    }

    frames.push({
      t,
      running,
      runningLevel,
      queue,
      remaining,
      completed,
      events: result.events.filter((e) => e.t === t),
      justCompleted,
    });
  }
  return frames;
}

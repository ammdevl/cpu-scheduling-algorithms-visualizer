import { describe, expect, it } from 'vitest';
import {
  ALGORITHMS,
  LECTURE_EXAMPLE,
  getAlgorithm,
  runAlgorithm,
  simulateFeedback,
  fbQuantaConstant,
  fbQuantaExponential,
  validateProcesses,
} from '../index';
import type { SimResult } from '../types';

const FINISHES: Record<string, Record<string, number>> = {
  fcfs: { A: 3, B: 9, C: 13, D: 18, E: 20 },
  rr_q1: { A: 4, B: 18, C: 17, D: 20, E: 15 },
  rr_q4: { A: 3, B: 17, C: 11, D: 20, E: 19 },
  spn: { A: 3, B: 9, C: 15, D: 20, E: 11 },
  srt: { A: 3, B: 15, C: 8, D: 20, E: 10 },
  hrrn: { A: 3, B: 9, C: 13, D: 20, E: 15 },
  fb_q1: { A: 4, B: 20, C: 16, D: 19, E: 11 },
  fb_q2i: { A: 4, B: 17, C: 18, D: 20, E: 14 },
};

const MEANS: Record<string, { tr: number; norm: number }> = {
  fcfs: { tr: 8.6, norm: 2.56 },
  rr_q1: { tr: 10.8, norm: 2.71 },
  rr_q4: { tr: 10.0, norm: 2.71 },
  spn: { tr: 7.6, norm: 1.84 },
  srt: { tr: 7.2, norm: 1.59 },
  hrrn: { tr: 8.0, norm: 2.14 },
  fb_q1: { tr: 10.0, norm: 2.29 },
  fb_q2i: { tr: 10.6, norm: 2.63 },
};

const GANTT: Record<string, string> = {
  rr_q1: 'AABABCBDCBEDCBEDCBDD',
  rr_q4: 'AAABBBBCCCCDDDDBBEED',
  fb_q1: 'AABACBDCEDEBCDBCDBDB',
  fb_q2i: 'AABACBBDECCDDEBBBCDD',
};

function run(key: string): SimResult {
  switch (key) {
    case 'fcfs':
      return runAlgorithm('fcfs', LECTURE_EXAMPLE);
    case 'rr_q1':
      return runAlgorithm('rr', LECTURE_EXAMPLE, { quantum: 1 });
    case 'rr_q4':
      return runAlgorithm('rr', LECTURE_EXAMPLE, { quantum: 4 });
    case 'spn':
      return runAlgorithm('spn', LECTURE_EXAMPLE);
    case 'srt':
      return runAlgorithm('srt', LECTURE_EXAMPLE);
    case 'hrrn':
      return runAlgorithm('hrrn', LECTURE_EXAMPLE);
    case 'fb_q1':
      return simulateFeedback(LECTURE_EXAMPLE, { quanta: fbQuantaConstant(1) });
    case 'fb_q2i':
      return simulateFeedback(LECTURE_EXAMPLE, { quanta: fbQuantaExponential(2) });
    default:
      throw new Error(key);
  }
}

function expandGantt(result: SimResult): string {
  const chars: string[] = [];
  for (const seg of result.segments) {
    for (let t = seg.start; t < seg.end; t++) chars.push(seg.pid);
  }
  return chars.join('');
}

describe('golden fixtures from lecture (Stallings Ch.9 example)', () => {
  for (const key of Object.keys(FINISHES)) {
    it(`${key}: per-process finish times match the lecture table`, () => {
      const result = run(key);
      for (const [pid, finish] of Object.entries(FINISHES[key])) {
        expect(result.metrics[pid]?.finish, `${key} ${pid}`).toBe(finish);
      }
      expect(result.makespan).toBe(20);
    });

    it(`${key}: mean turnaround and normalized Tr/Ts match the lecture table`, () => {
      const result = run(key);
      expect(result.summary.meanTurnaround).toBeCloseTo(MEANS[key].tr, 6);
      expect(result.summary.meanNormTr).toBeCloseTo(MEANS[key].norm, 2);
    });
  }

  for (const [key, expected] of Object.entries(GANTT)) {
    it(`${key}: execution order matches the lecture Gantt chart`, () => {
      expect(expandGantt(run(key))).toBe(expected);
    });
  }

  it('segments do not overlap and cover the timeline', () => {
    for (const key of Object.keys(FINISHES)) {
      const result = run(key);
      let prev = 0;
      for (const seg of result.segments) {
        expect(seg.start, `${key} segment continuity`).toBe(prev);
        expect(seg.end).toBeGreaterThan(seg.start);
        prev = seg.end;
      }
      expect(prev).toBe(20);
    }
  });

  it('feedback segments carry queue levels', () => {
    const result = run('fb_q1');
    for (const seg of result.segments) {
      expect(seg.level).toBeDefined();
      expect(seg.level).toBeGreaterThanOrEqual(0);
    }
  });

  it('metrics are internally consistent', () => {
    const result = run('srt');
    for (const p of LECTURE_EXAMPLE) {
      const m = result.metrics[p.id];
      expect(m.turnaround).toBe(m.finish - p.arrival);
      expect(m.waiting).toBe(m.turnaround - p.service);
      expect(m.normTr).toBeCloseTo(m.turnaround / p.service, 10);
    }
    expect(result.summary.meanWaiting).toBeCloseTo(
      LECTURE_EXAMPLE.reduce((a, p) => a + result.metrics[p.id].waiting, 0) / 5,
      10
    );
  });
});

describe('algorithm metadata registry', () => {
  it('exposes all six algorithms', () => {
    expect(ALGORITHMS.map((a) => a.meta.id)).toEqual([
      'fcfs',
      'rr',
      'spn',
      'srt',
      'hrrn',
      'feedback',
    ]);
  });

  it('resolves algorithms by id', () => {
    expect(getAlgorithm('rr')?.meta.name).toBe('Round Robin');
    expect(getAlgorithm('nope')).toBeUndefined();
  });
});

describe('edge cases', () => {
  it('handles idle CPU before first arrival', () => {
    const result = runAlgorithm('fcfs', [{ id: 'X', arrival: 5, service: 2 }]);
    expect(result.metrics.X.finish).toBe(7);
    expect(result.segments).toEqual([{ pid: 'X', start: 5, end: 7, endedBy: 'completed' }]);
    expect(result.events.some((e) => e.kind === 'idle')).toBe(true);
  });

  it('handles idle gap between processes', () => {
    const result = runAlgorithm('fcfs', [
      { id: 'X', arrival: 0, service: 2 },
      { id: 'Y', arrival: 10, service: 3 },
    ]);
    expect(result.metrics.Y.finish).toBe(13);
    expect(expandGantt(result)).toBe('XXYYY');
  });

  it('SRT: running process continues on equal remaining time', () => {
    const result = runAlgorithm('srt', [
      { id: 'A', arrival: 0, service: 4 },
      { id: 'B', arrival: 2, service: 2 },
    ]);
    expect(expandGantt(result)).toBe('AAAABB');
  });

  it('RR: arrival at quantum boundary enters the queue before the preempted process', () => {
    const result = runAlgorithm('rr', [
      { id: 'A', arrival: 0, service: 2 },
      { id: 'B', arrival: 1, service: 1 },
    ], { quantum: 1 });
    expect(expandGantt(result)).toBe('ABA');
  });

  it('single process in FB never demotes (uncontended quanta)', () => {
    const result = simulateFeedback([{ id: 'Solo', arrival: 0, service: 5 }], {
      quanta: fbQuantaExponential(2),
    });
    expect(result.segments.every((s) => s.level === 0)).toBe(true);
    expect(result.segments.reduce((a, s) => a + (s.end - s.start), 0)).toBe(5);
  });

  it('rejects invalid inputs', () => {
    expect(() => validateProcesses([])).toThrow();
    expect(() => validateProcesses([{ id: 'A', arrival: 0, service: 0 }])).toThrow();
    expect(() => validateProcesses([{ id: 'A', arrival: -1, service: 2 }])).toThrow();
    expect(() =>
      validateProcesses([
        { id: 'A', arrival: 0, service: 2 },
        { id: 'A', arrival: 1, service: 2 },
      ])
    ).toThrow(/Duplicate/);
    expect(() => runAlgorithm('rr', LECTURE_EXAMPLE, { quantum: Number.NaN })).toThrow();
    expect(() => simulateFeedback(LECTURE_EXAMPLE, { quanta: [] })).toThrow();
    expect(() => simulateFeedback(LECTURE_EXAMPLE, { quanta: [0] })).toThrow();
  });

  it('clamps sub-1 quantum to 1', () => {
    const result = runAlgorithm('rr', [{ id: 'A', arrival: 0, service: 2 }], { quantum: 0 });
    expect(expandGantt(result)).toBe('AA');
  });
});

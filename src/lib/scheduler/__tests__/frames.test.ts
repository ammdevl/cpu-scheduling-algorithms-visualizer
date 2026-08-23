import { describe, expect, it } from 'vitest';
import {
  LECTURE_EXAMPLE,
  buildFrames,
  runAlgorithm,
  simulateFeedback,
  fbQuantaExponential,
} from '../index';

describe('step frames', () => {
  it('RR: queue order matches the lecture trace at every tick', () => {
    const result = runAlgorithm('rr', LECTURE_EXAMPLE, { quantum: 1 });
    const frames = buildFrames(result, LECTURE_EXAMPLE);
    expect(frames).toHaveLength(result.makespan + 1);
    expect(frames[0].running).toBe('A');
    expect(frames[0].queue.map((e) => e.pid)).toEqual([]);
    expect(frames[2].running).toBe('B');
    expect(frames[2].queue.map((e) => e.pid)).toEqual(['A']);
    expect(frames[3].running).toBe('A');
    expect(frames[3].queue.map((e) => e.pid)).toEqual(['B']);
    expect(frames[4].running).toBe('B');
    expect(frames[4].queue.map((e) => e.pid)).toEqual(['C']);
    expect(frames[4].justCompleted).toEqual(['A']);
    const last = frames[result.makespan];
    expect(last.running).toBeNull();
    expect(last.queue).toHaveLength(0);
    expect(last.completed).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect(last.justCompleted).toEqual(['D']);
  });

  it('RR q=1: remaining times decrease for the active process', () => {
    const result = runAlgorithm('rr', LECTURE_EXAMPLE, { quantum: 1 });
    const frames = buildFrames(result, LECTURE_EXAMPLE);
    expect(frames[0].remaining.A).toBe(3);
    expect(frames[1].remaining.A).toBe(2);
    expect(frames[2].remaining.A).toBe(1);
    expect(frames[2].remaining.B).toBe(6);
    expect(frames[3].remaining.A).toBe(1);
    expect(frames[3].remaining.B).toBe(5);
    expect(frames[4].remaining.A).toBe(0);
  });

  it('FB: queue entries carry queue levels', () => {
    const result = simulateFeedback(LECTURE_EXAMPLE, { quanta: fbQuantaExponential(2) });
    const frames = buildFrames(result, LECTURE_EXAMPLE);
    expect(frames[3].running).toBe('A');
    expect(frames[3].queue).toEqual([{ pid: 'B', level: 1 }]);
    const t9 = frames[9];
    expect(t9.running).toBe('C');
    expect(t9.queue.map((e) => `${e.pid}@L${e.level}`)).toEqual(['D@L1', 'E@L1', 'B@L2']);
  });

  it('non-preemptive algorithms derive the waiting queue by arrival order', () => {
    const result = runAlgorithm('fcfs', LECTURE_EXAMPLE);
    const frames = buildFrames(result, LECTURE_EXAMPLE);
    expect(frames[4].running).toBe('B');
    expect(frames[4].queue.map((e) => e.pid)).toEqual(['C']);
    expect(frames[6].queue.map((e) => e.pid)).toEqual(['C', 'D']);
  });

  it('SRT: waiting queue is sorted by remaining time', () => {
    const result = runAlgorithm('srt', LECTURE_EXAMPLE);
    const frames = buildFrames(result, LECTURE_EXAMPLE, 'remaining');
    expect(frames[8].running).toBe('E');
    expect(frames[8].queue.map((e) => e.pid)).toEqual(['B', 'D']);
    const t10 = frames[10];
    expect(t10.running).toBe('B');
    expect(t10.queue.map((e) => e.remaining)).toEqual([5]);
  });
});

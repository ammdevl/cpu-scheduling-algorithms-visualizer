import { simulateFcfs } from './fcfs';
import { simulateHrrn } from './hrrn';
import { simulateRr } from './rr';
import { simulateSpn } from './spn';
import { simulateSrt } from './srt';
import { simulateFeedback, fbQuantaConstant, fbQuantaExponential } from './feedback';
import type { AlgoId, Algorithm, ProcessInput, RunOptions } from './types';

export const LECTURE_EXAMPLE: ProcessInput[] = [
  { id: 'A', arrival: 0, service: 3 },
  { id: 'B', arrival: 2, service: 6 },
  { id: 'C', arrival: 4, service: 4 },
  { id: 'D', arrival: 6, service: 5 },
  { id: 'E', arrival: 8, service: 2 },
];

export const ALGORITHMS: Algorithm[] = [
  {
    meta: {
      id: 'fcfs',
      name: 'First-Come, First-Served',
      short: 'FCFS',
      decisionMode: 'non-preemptive',
      selectionFunction: 'max w',
      blurb:
        'Processes are executed strictly in arrival order — the simplest policy. The CPU is never taken away from a running process.',
      how: [
        'Sort ready processes by arrival time.',
        'Dispatch the earliest arrival and run it to completion.',
        'Repeat; the CPU idles if no process has arrived yet.',
      ],
      note: 'Convoy effect: one long job delays every short job queued behind it, inflating average waiting time.',
      hasQuantum: false,
    },
    run: (p) => simulateFcfs(p),
  },
  {
    meta: {
      id: 'rr',
      name: 'Round Robin',
      short: 'RR',
      decisionMode: 'preemptive',
      selectionFunction: 'cyclic (FIFO)',
      blurb:
        'Each process gets a fixed time slice (quantum q), then is preempted and requeued. Built for time-sharing systems.',
      how: [
        'Keep a FIFO ready queue.',
        'Dispatch the head of the queue for at most q time units.',
        'On quantum expiry, requeue the process at the tail and dispatch the next.',
        'A process that finishes early hands the CPU over immediately.',
      ],
      note: 'Small q gives snappy response but many context switches; very large q degrades into FCFS.',
      hasQuantum: true,
    },
    run: (p, o) => simulateRr(p, o),
  },
  {
    meta: {
      id: 'spn',
      name: 'Shortest Process Next',
      short: 'SPN',
      decisionMode: 'non-preemptive',
      selectionFunction: 'min s',
      blurb:
        'Picks the waiting process with the smallest expected service time. Runs it to completion without preemption.',
      how: [
        'Among arrived, unfinished processes pick the smallest service time s.',
        'Run it to completion.',
        'Re-select whenever the CPU becomes free; tie-break by earlier arrival.',
      ],
      note: 'Optimal average turnaround when all processes arrive together — but long jobs can starve if short ones keep arriving.',
      hasQuantum: false,
    },
    run: (p) => simulateSpn(p),
  },
  {
    meta: {
      id: 'srt',
      name: 'Shortest Remaining Time',
      short: 'SRT',
      decisionMode: 'preemptive',
      selectionFunction: "min s' (remaining)",
      blurb:
        'Preemptive SPN: a newly arrived process with less remaining time than the current process preempts it immediately.',
      how: [
        'Track remaining time for every process.',
        'On each arrival, compare its service time with the running process\u2019s remaining time.',
        'Strictly smaller remaining time wins; ties continue the running process.',
      ],
      note: 'Best average turnaround for the classic five-process example — but the OS needs accurate service-time estimates.',
      hasQuantum: false,
    },
    run: (p) => simulateSrt(p),
  },
  {
    meta: {
      id: 'hrrn',
      name: 'Highest Response Ratio Next',
      short: 'HRRN',
      decisionMode: 'non-preemptive',
      selectionFunction: 'max (w + s)/s',
      blurb:
        'Ranks waiting processes by response ratio R = (w + s)/s. The longer a process waits, the larger R grows.',
      how: [
        'For every waiting process compute R = (w + s)/s.',
        'Dispatch the process with the highest R.',
        'Non-preemptive: run to completion, then re-select.',
      ],
      note: 'Aging built into the formula gives long jobs a chance eventually — an elegant fix for SPN starvation.',
      hasQuantum: false,
    },
    run: (p) => simulateHrrn(p),
  },
  {
    meta: {
      id: 'feedback',
      name: 'Feedback Scheduling',
      short: 'FB',
      decisionMode: 'preemptive',
      selectionFunction: 'min level (FIFO)',
      blurb:
        'Multilevel queues: new jobs start at the top level; a job that burns its quantum while others wait is demoted. Penalizes long-running jobs without knowing service times.',
      how: [
        'New arrivals enter the highest-priority queue (L0).',
        'Each level i runs with its own quantum q\u1D62.',
        'A quantum that expires while others are waiting demotes the process one level.',
        'An uncontended quantum keeps the level; always serve the lowest non-empty queue first.',
      ],
      note: 'Interactive jobs stay high; batch jobs sink but still get served — no service-time estimate needed.',
      hasQuantum: true,
    },
    run: (p, o) =>
      simulateFeedback(p, {
        quanta: o?.quanta ?? fbQuantaExponential(2, 16),
      }),
  },
];

export const DEFAULT_RR_QUANTUM = 1;

export function getAlgorithm(id: string): Algorithm | undefined {
  return ALGORITHMS.find((a) => a.meta.id === id);
}

export function runAlgorithm(
  id: AlgoId,
  processes: ProcessInput[],
  options?: RunOptions
): ReturnType<Algorithm['run']> {
  const algo = getAlgorithm(id);
  if (!algo) throw new Error(`Unknown algorithm: ${id}`);
  return algo.run(processes, options);
}

export { fbQuantaConstant, fbQuantaExponential };

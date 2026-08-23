export interface ProcessInput {
  id: string;
  arrival: number;
  service: number;
}

export type SegmentEnd = 'completed' | 'quantum-expired' | 'preempted';

export interface Segment {
  pid: string;
  start: number;
  end: number;
  level?: number;
  endedBy?: SegmentEnd;
}

export type SimEventKind =
  | 'arrive'
  | 'dispatch'
  | 'complete'
  | 'quantum-expired'
  | 'preempt'
  | 'idle';

export interface SimEvent {
  t: number;
  kind: SimEventKind;
  pid?: string;
  detail: string;
}

export interface ProcessMetrics {
  finish: number;
  turnaround: number;
  normTr: number;
  waiting: number;
}

export interface SimSummary {
  meanTurnaround: number;
  meanNormTr: number;
  meanWaiting: number;
}

export interface QueueSnapshot {
  t: number;
  queue: { pid: string; level?: number }[];
}

export interface SimResult {
  segments: Segment[];
  events: SimEvent[];
  metrics: Record<string, ProcessMetrics>;
  summary: SimSummary;
  makespan: number;
  queueTimeline?: QueueSnapshot[];
}

export interface RunOptions {
  quantum?: number;
  quanta?: number[];
}

export type AlgoId = 'fcfs' | 'rr' | 'spn' | 'srt' | 'hrrn' | 'feedback';

export interface AlgorithmMeta {
  id: AlgoId;
  name: string;
  short: string;
  decisionMode: 'non-preemptive' | 'preemptive';
  selectionFunction: string;
  blurb: string;
  how: string[];
  note: string;
  hasQuantum: boolean;
}

export interface Algorithm {
  meta: AlgorithmMeta;
  run(processes: ProcessInput[], options?: RunOptions): SimResult;
}

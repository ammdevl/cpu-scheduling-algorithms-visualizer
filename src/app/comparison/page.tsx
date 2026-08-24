import type { Metadata, Viewport } from 'next';
import { ComparisonClient } from './ComparisonClient';

export const metadata: Metadata = {
  title: 'Comparison',
  description:
    'Compare FCFS, Round Robin, SPN, SRT, HRRN and Feedback scheduling on the same workload — average turnaround, Tr/Ts and waiting time side by side.',
};

export const viewport: Viewport = {
  width: 1280,
};

export default function ComparisonPage() {
  return <ComparisonClient />;
}

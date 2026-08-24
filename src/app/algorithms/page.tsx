import type { Metadata, Viewport } from 'next';
import { Visualizer } from '@/components/Visualizer/Visualizer';
import { Reveal } from '@/components/Reveal/Reveal';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Algorithms',
  description:
    'Simulate FCFS, Round Robin, SPN, SRT, HRRN and Feedback scheduling on your own process set with step-by-step Gantt tables and metrics.',
};

export const viewport: Viewport = {
  width: 1280,
};

export default function AlgorithmsPage() {
  return (
    <main className={styles.page}>
      <Reveal>
        <header className={styles.header}>
          <h1>Scheduling algorithms</h1>
          <p>
            Configure the workload on the left, pick a policy, and watch the simulation
            unfold tick by tick. A five-process example is preloaded so you can start
            immediately — every number is editable.
          </p>
        </header>
      </Reveal>
      <Visualizer />
    </main>
  );
}

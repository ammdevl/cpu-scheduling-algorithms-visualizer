import { Skeleton } from '@/components/Skeleton/Skeleton';
import { VisualizerSkeleton } from '@/components/VisualizerSkeleton/VisualizerSkeleton';
import styles from './page.module.scss';

export default function Loading() {
  return (
    <main className={styles.page}>
      <div className={styles.header} aria-hidden="true">
        <Skeleton h={28} w="min(320px, 60%)" r="8px" />
        <Skeleton h={13} w="min(560px, 90%)" />
      </div>
      <VisualizerSkeleton />
    </main>
  );
}

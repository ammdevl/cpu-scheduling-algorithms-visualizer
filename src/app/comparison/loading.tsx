import { Skeleton } from '@/components/Skeleton/Skeleton';
import styles from './page.module.scss';

export default function Loading() {
  return (
    <main className={styles.page} aria-hidden="true">
      <div className={styles.header}>
        <Skeleton h={28} w="min(340px, 60%)" r="8px" />
        <Skeleton h={13} w="min(600px, 90%)" />
      </div>
      <div className={styles.card}>
        <Skeleton h={16} w="28%" />
        <Skeleton h={190} r="8px" />
      </div>
      <div className={styles.card}>
        <Skeleton h={16} w="28%" />
        <Skeleton h={120} r="8px" />
      </div>
    </main>
  );
}

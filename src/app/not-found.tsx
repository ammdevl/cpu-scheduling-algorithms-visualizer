import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './not-found.module.scss';

export const metadata: Metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <main id="main" className={styles.page}>
      <p className={styles.code} aria-hidden="true">
        404
      </p>
      <h1>Page not found</h1>
      <p className={styles.text}>
        The page you are looking for doesn&rsquo;t exist or has moved.
      </p>
      <div className={styles.actions}>
        <Link href="/" className={styles.primary}>
          Back to home
        </Link>
        <Link href="/algorithms" className={styles.secondary}>
          Open the visualizer
        </Link>
      </div>
    </main>
  );
}

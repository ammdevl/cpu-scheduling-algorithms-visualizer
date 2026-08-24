import Link from 'next/link';
import { ALGORITHMS } from '@/lib/scheduler';
import styles from './Footer.module.scss';

const REPO = 'https://github.com/ammdevl/cpu-scheduling-algorithms-visualizer';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <div className={styles.brand}>
            <svg viewBox="0 0 64 64" className={styles.brandIcon} aria-hidden="true">
              <rect x="16" y="16" width="32" height="32" rx="6" fill="currentColor" />
              <rect x="25" y="25" width="14" height="14" rx="2" fill="var(--surface)" />
              <g stroke="currentColor" strokeWidth="4" strokeLinecap="round">
                <line x1="24" y1="6" x2="24" y2="12" />
                <line x1="32" y1="6" x2="32" y2="12" />
                <line x1="40" y1="6" x2="40" y2="12" />
                <line x1="24" y1="52" x2="24" y2="58" />
                <line x1="32" y1="52" x2="32" y2="58" />
                <line x1="40" y1="52" x2="40" y2="58" />
                <line x1="6" y1="24" x2="12" y2="24" />
                <line x1="6" y1="32" x2="12" y2="32" />
                <line x1="6" y1="40" x2="12" y2="40" />
                <line x1="52" y1="24" x2="58" y2="24" />
                <line x1="52" y1="32" x2="58" y2="32" />
                <line x1="52" y1="40" x2="58" y2="40" />
              </g>
            </svg>
            <span>CPU Scheduling Algorithms Visualizer</span>
          </div>
          <p>
            An interactive, fully client-side simulator for the classic CPU scheduling
            policies — built for operating-system learners. Enter a workload, pick a
            policy, and step through every tick of the simulation.
          </p>
        </div>

        <nav className={styles.col} aria-label="Product">
          <h3>Product</h3>
          <Link href="/">Home</Link>
          <Link href="/algorithms">Algorithms</Link>
          <Link href="/comparison">Comparison</Link>
        </nav>

        <nav className={styles.col} aria-label="Algorithms">
          <h3>Algorithms</h3>
          {ALGORITHMS.map((a) => (
            <Link key={a.meta.id} href="/algorithms">
              {a.meta.name}
            </Link>
          ))}
        </nav>

        <nav className={styles.col} aria-label="Resources">
          <h3>Resources</h3>
          <a href={REPO} target="_blank" rel="noopener noreferrer">
            GitHub repository
          </a>
          <a href={`${REPO}/blob/main/docs`} target="_blank" rel="noopener noreferrer">
            Documentation
          </a>
          <a href={`${REPO}/issues`} target="_blank" rel="noopener noreferrer">
            Report an issue
          </a>
        </nav>
      </div>

      <div className={styles.bottomWrap}>
        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} CPU Scheduling Algorithms Visualizer. All rights reserved.</span>
          <span>Built with Next.js · No trackers · No account required</span>
        </div>
      </div>
    </footer>
  );
}

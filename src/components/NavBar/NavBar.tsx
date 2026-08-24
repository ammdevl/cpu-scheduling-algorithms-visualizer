'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './NavBar.module.scss';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/algorithms', label: 'Algorithms' },
  { href: '/comparison', label: 'Comparison' },
];

export function NavBar() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
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
        </Link>
        <div className={styles.links}>
          {LINKS.map((l) => {
            const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`${styles.link} ${active ? styles.active : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {l.label}
              </Link>
            );
          })}
          <a
            className={styles.gh}
            href="https://github.com/ammdevl/cpu-scheduling-algorithms-visualizer"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            title="GitHub repository"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              />
            </svg>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

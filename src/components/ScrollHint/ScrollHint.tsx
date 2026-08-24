'use client';

import { useEffect, useState } from 'react';
import styles from './ScrollHint.module.scss';

export function ScrollHint({ label = 'Scroll to explore' }: { label?: string }) {
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    const onScroll = () => setFaded(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`${styles.hint} ${faded ? styles.faded : ''}`} aria-hidden="true">
      <span className={styles.label}>{label}</span>
      <svg viewBox="0 0 24 24" className={styles.chevron}>
        <path
          d="M5 9l7 7 7-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

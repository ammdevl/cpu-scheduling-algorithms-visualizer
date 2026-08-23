'use client';

import styles from './ThemeToggle.module.scss';

export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem('csv-theme', next);
    } catch {}
  };
  return (
    <button
      type="button"
      className={styles.button}
      onClick={toggle}
      aria-label="Toggle dark or light theme"
      title="Toggle theme"
    >
      <svg viewBox="0 0 24 24" className={styles.sun} aria-hidden="true">
        <circle cx="12" cy="12" r="4.5" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <line x1="12" y1="1.5" x2="12" y2="4.5" />
          <line x1="12" y1="19.5" x2="12" y2="22.5" />
          <line x1="1.5" y1="12" x2="4.5" y2="12" />
          <line x1="19.5" y1="12" x2="22.5" y2="12" />
          <line x1="4.6" y1="4.6" x2="6.7" y2="6.7" />
          <line x1="17.3" y1="17.3" x2="19.4" y2="19.4" />
          <line x1="4.6" y1="19.4" x2="6.7" y2="17.3" />
          <line x1="17.3" y1="6.7" x2="19.4" y2="4.6" />
        </g>
      </svg>
      <svg viewBox="0 0 24 24" className={styles.moon} aria-hidden="true">
        <path
          d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
}

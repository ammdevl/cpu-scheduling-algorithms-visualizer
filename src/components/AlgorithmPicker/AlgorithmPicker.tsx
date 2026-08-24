'use client';

import { ALGORITHMS, type AlgoId } from '@/lib/scheduler';
import { useSimStore } from '@/lib/store';
import styles from './AlgorithmPicker.module.scss';

export function AlgorithmPicker() {
  const algorithm = useSimStore((s) => s.algorithm);
  const setAlgorithm = useSimStore((s) => s.setAlgorithm);
  const quantum = useSimStore((s) => s.quantum);
  const setQuantum = useSimStore((s) => s.setQuantum);
  const fbPreset = useSimStore((s) => s.fbPreset);
  const setFbPreset = useSimStore((s) => s.setFbPreset);

  return (
    <div className={styles.wrap}>
      <label className={styles.field}>
        <span className={styles.label}>Algorithm</span>
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value as AlgoId)}
          aria-label="Scheduling algorithm"
        >
          {ALGORITHMS.map((a) => (
            <option key={a.meta.id} value={a.meta.id}>
              {a.meta.name}
            </option>
          ))}
        </select>
      </label>
      {algorithm === 'rr' && (
        <label className={styles.field}>
          <span className={styles.label}>Time quantum</span>
          <select
            value={quantum}
            onChange={(e) => setQuantum(Number(e.target.value))}
            aria-label="Round Robin time quantum"
          >
            {Array.from({ length: 20 }, (_, i) => i + 1).map((q) => (
              <option key={q} value={q}>
                q = {q}
              </option>
            ))}
          </select>
        </label>
      )}
      {algorithm === 'feedback' && (
        <label className={styles.field}>
          <span className={styles.label}>Quantum per level</span>
          <select
            value={fbPreset}
            onChange={(e) => setFbPreset(e.target.value === 'flat1' ? 'flat1' : 'exp2')}
            aria-label="Feedback quantum preset"
          >
            <option value="exp2">q = 2&#8305; (1, 2, 4, 8, …)</option>
            <option value="flat1">q = 1 (uniform)</option>
          </select>
        </label>
      )}
    </div>
  );
}

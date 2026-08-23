'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  ALGORITHMS,
  fbQuantaConstant,
  fbQuantaExponential,
  runAlgorithm,
  type SimResult,
} from '@/lib/scheduler';
import { useSimStore, useStoreHydration } from '@/lib/store';
import { GanttTable } from '@/components/GanttTable/GanttTable';
import { MetricsTable } from '@/components/MetricsTable/MetricsTable';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import styles from './page.module.scss';

export default function ComparisonPage() {
  const ready = useStoreHydration();
  const processes = useSimStore((s) => s.processes);
  const quantum = useSimStore((s) => s.quantum);
  const fbPreset = useSimStore((s) => s.fbPreset);

  const rows = useMemo(() => {
    if (!ready) return [];
    return ALGORITHMS.map((algo) => {
      try {
        const options =
          algo.meta.id === 'rr'
            ? { quantum }
            : algo.meta.id === 'feedback'
              ? {
                  quanta:
                    fbPreset === 'flat1' ? fbQuantaConstant(1) : fbQuantaExponential(2),
                }
              : undefined;
        const result = runAlgorithm(algo.meta.id, processes, options) as SimResult;
        return { algo, result, error: null as string | null };
      } catch (e) {
        return {
          algo,
          result: null,
          error: e instanceof Error ? e.message : 'Simulation failed',
        };
      }
    });
  }, [ready, processes, quantum, fbPreset]);

  const ok = rows.filter((r) => r.result);
  const bestTr = ok.length
    ? Math.min(...ok.map((r) => r.result!.summary.meanTurnaround))
    : 0;
  const bestNorm = ok.length
    ? Math.min(...ok.map((r) => r.result!.summary.meanNormTr))
    : 0;
  const maxTr = ok.length
    ? Math.max(...ok.map((r) => r.result!.summary.meanTurnaround))
    : 1;

  if (!ready) {
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

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Algorithm comparison</h1>
        <p>
          Every policy runs on the same workload you configured on the{' '}
          <Link href="/algorithms">Algorithms page</Link> (Round Robin q={quantum},
          Feedback {fbPreset === 'flat1' ? 'q = 1 per level' : 'q = 2\u2071 per level'}).
          Lower is better for every metric shown — green marks the winner.
        </p>
      </header>

      {ok.length === 0 ? (
        <div className={styles.card}>
          <p className={styles.error}>Add at least one valid process to compare algorithms.</p>
        </div>
      ) : (
        <>
          <section className={styles.card}>
            <h2>Averages across algorithms</h2>
            <div className={styles.scroll}>
              <table className={styles.compare}>
                <thead>
                  <tr>
                    <th>Algorithm</th>
                    <th>Mean Tr</th>
                    <th>Mean Tr / Ts</th>
                    <th>Mean waiting</th>
                    <th>Makespan</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ algo, result }) => {
                    if (!result) {
                      return (
                        <tr key={algo.meta.id} className={styles.rowError}>
                          <td>{algo.meta.short}</td>
                          <td colSpan={4}>failed</td>
                        </tr>
                      );
                    }
                    const s = result.summary;
                    return (
                      <tr key={algo.meta.id}>
                        <td>{algo.meta.name}</td>
                        <td className={s.meanTurnaround === bestTr ? styles.best : undefined}>
                          {s.meanTurnaround.toFixed(2)}
                        </td>
                        <td className={s.meanNormTr === bestNorm ? styles.best : undefined}>
                          {s.meanNormTr.toFixed(2)}
                        </td>
                        <td>{s.meanWaiting.toFixed(2)}</td>
                        <td>{result.makespan}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className={styles.caption}>
              Green marks the best (lowest) value per metric. Tr = turnaround time.
            </p>
          </section>

          <section className={styles.card}>
            <h2>Mean turnaround at a glance</h2>
            <div className={styles.bars}>
              {rows.map(({ algo, result }) =>
                result ? (
                  <div key={algo.meta.id} className={styles.barRow}>
                    <span className={styles.barLabel}>{algo.meta.name}</span>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{
                          width: `${(result.summary.meanTurnaround / maxTr) * 100}%`,
                          background: 'var(--primary)',
                        }}
                      />
                      <span className={styles.barValue}>
                        {result.summary.meanTurnaround.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </section>

          {rows.map(({ algo, result }) =>
            result ? (
              <details key={algo.meta.id} open className={styles.perAlgo}>
                <summary>
                  {algo.meta.name}
                  <span className={styles.summaryMeta}>
                    mean Tr {result.summary.meanTurnaround.toFixed(2)}
                  </span>
                </summary>
                <div className={styles.perAlgoBody}>
                  <GanttTable result={result} processes={processes} />
                  <MetricsTable processes={processes} result={result} />
                </div>
              </details>
            ) : null
          )}
        </>
      )}
    </main>
  );
}

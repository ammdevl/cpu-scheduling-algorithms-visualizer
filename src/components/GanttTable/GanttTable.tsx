import type { ProcessInput, SimResult } from '@/lib/scheduler';
import styles from './GanttTable.module.scss';

interface GanttTableProps {
  result: SimResult;
  processes: ProcessInput[];
  revealUpTo?: number;
  highlightT?: number | null;
}

export function GanttTable({ result, processes, revealUpTo, highlightT }: GanttTableProps) {
  const { makespan, segments } = result;
  const order = new Map(processes.map((p, i) => [p.id, i]));
  const rows = processes.map((p) => {
    const cells: (number | null)[] = new Array(makespan).fill(null);
    for (const seg of segments) {
      if (seg.pid !== p.id) continue;
      for (let t = Math.floor(seg.start); t < seg.end && t < makespan; t++) {
        cells[t] = seg.level ?? -1;
      }
    }
    return { p, cells };
  });
  const times = Array.from({ length: makespan }, (_, i) => i);

  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.corner}>Process</th>
            {times.map((t) => (
              <th
                key={t}
                className={`${styles.time} ${t === highlightT ? styles.timeActive : ''}`}
              >
                {t + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ p, cells }) => {
            const idx = order.get(p.id) ?? 0;
            return (
              <tr key={p.id}>
                <th className={styles.label} scope="row">
                  <span
                    className={styles.chip}
                    style={{ background: `var(--p${idx % 8})` }}
                  />
                  {p.id}
                </th>
                {cells.map((level, t) => {
                  const revealed = revealUpTo === undefined || t < revealUpTo;
                  const hasRun = level !== null;
                  if (!hasRun || !revealed) {
                    return <td key={t} className={styles.cell} />;
                  }
                  return (
                    <td
                      key={t}
                      className={`${styles.cell} ${styles.filled} ${
                        t === highlightT ? styles.cellActive : ''
                      }`}
                      style={{ background: `var(--p${idx % 8})` }}
                      title={`${p.id} runs from t=${t} to t=${t + 1}${
                        level !== null && level >= 0 ? ` (queue level ${level})` : ''
                      }`}
                    />
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

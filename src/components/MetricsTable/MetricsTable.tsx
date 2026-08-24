import type { ProcessInput, SimResult } from '@/lib/scheduler';
import styles from './MetricsTable.module.scss';

interface MetricsTableProps {
  processes: ProcessInput[];
  result: SimResult;
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

export function MetricsTable({ processes, result }: MetricsTableProps) {
  const { metrics, summary } = result;
  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <caption className="srOnly">
          Per-process scheduling metrics: arrival, service, finish, turnaround, normalized
          turnaround and waiting time
        </caption>
        <thead>
          <tr>
            <th>Process</th>
            <th>Arrival</th>
            <th>Service (Ts)</th>
            <th>Finish</th>
            <th>Turnaround (Tr)</th>
            <th>Tr / Ts</th>
            <th>Waiting</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((p, i) => {
            const m = metrics[p.id];
            return (
              <tr key={p.id}>
                <td>
                  <span className={styles.chip} style={{ background: `var(--p${i % 8})` }} />
                  {p.id}
                </td>
                <td>{p.arrival}</td>
                <td>{p.service}</td>
                <td>{fmt(m.finish)}</td>
                <td>{fmt(m.turnaround)}</td>
                <td>{m.normTr.toFixed(2)}</td>
                <td>{fmt(m.waiting)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4}>Mean</td>
            <td>{summary.meanTurnaround.toFixed(2)}</td>
            <td>{summary.meanNormTr.toFixed(2)}</td>
            <td>{summary.meanWaiting.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

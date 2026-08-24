'use client';

import { useSimStore, processRowError } from '@/lib/store';
import styles from './ProcessEditor.module.scss';

export function ProcessEditor() {
  const processes = useSimStore((s) => s.processes);
  const updateProcess = useSimStore((s) => s.updateProcess);
  const addProcess = useSimStore((s) => s.addProcess);
  const removeProcess = useSimStore((s) => s.removeProcess);
  const resetProcesses = useSimStore((s) => s.resetProcesses);

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h3>Processes</h3>
        <span className={styles.count}>{processes.length}</span>
      </div>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Arrival</th>
              <th>Service</th>
              <th aria-label="Remove" />
            </tr>
          </thead>
          <tbody>
            {processes.map((p, i) => {
              const error = processRowError(p, processes);
              return (
                <tr key={i} className={error ? styles.rowError : undefined}>
                  <td>
                    <input
                      type="text"
                      value={p.id}
                      maxLength={6}
                      aria-label={`Name of process ${i + 1}`}
                      onChange={(e) => updateProcess(i, { id: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      max={999}
                      step={1}
                      value={p.arrival}
                      aria-label={`Arrival time of process ${i + 1}`}
                      onChange={(e) => {
                        const v = e.target.valueAsNumber;
                        if (Number.isFinite(v))
                          updateProcess(i, { arrival: Math.min(999, Math.max(0, Math.trunc(v))) });
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      step={1}
                      value={p.service}
                      aria-label={`Service time of process ${i + 1}`}
                      onChange={(e) => {
                        const v = e.target.valueAsNumber;
                        if (Number.isFinite(v))
                          updateProcess(i, { service: Math.min(500, Math.max(1, Math.trunc(v))) });
                      }}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.remove}
                      aria-label={`Remove process ${p.id}`}
                      title="Remove process"
                      onClick={() => removeProcess(i)}
                      disabled={processes.length <= 1}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {processes.some((p) => processRowError(p, processes)) && (
        <p className={styles.error} role="alert">
          Fix the highlighted rows — names must be unique and times must be whole numbers
          (arrival 0–999, service 1–500).
        </p>
      )}
      <div className={styles.footer}>
        <button type="button" className={styles.add} onClick={addProcess}>
          + Add process
        </button>
        <button type="button" className={styles.reset} onClick={resetProcesses}>
          Reset example
        </button>
      </div>
    </div>
  );
}

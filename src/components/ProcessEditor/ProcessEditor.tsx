'use client';

import { useState } from 'react';
import { useSimStore, processRowError } from '@/lib/store';
import styles from './ProcessEditor.module.scss';

type NumberField = 'arrival' | 'service';

export function ProcessEditor() {
  const processes = useSimStore((s) => s.processes);
  const updateProcess = useSimStore((s) => s.updateProcess);
  const addProcess = useSimStore((s) => s.addProcess);
  const removeProcess = useSimStore((s) => s.removeProcess);
  const resetProcesses = useSimStore((s) => s.resetProcesses);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const clearDrafts = () => setDrafts({});

  const numberInput = (
    i: number,
    field: NumberField,
    p: { arrival: number; service: number },
    min: number,
    max: number,
    label: string
  ) => {
    const key = `${i}:${field}`;
    return (
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={1}
        value={drafts[key] ?? String(p[field])}
        aria-label={label}
        onChange={(e) => {
          const raw = e.target.value;
          setDrafts((d) => ({ ...d, [key]: raw }));
          const v = Number(raw);
          if (raw.trim() !== '' && Number.isFinite(v)) {
            updateProcess(i, { [field]: Math.min(max, Math.max(min, Math.trunc(v))) });
          }
        }}
        onBlur={() =>
          setDrafts((d) => {
            const next = { ...d };
            delete next[key];
            return next;
          })
        }
      />
    );
  };

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
                    {numberInput(i, 'arrival', p, 0, 999, `Arrival time of process ${i + 1}`)}
                  </td>
                  <td>
                    {numberInput(i, 'service', p, 1, 500, `Service time of process ${i + 1}`)}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.remove}
                      aria-label={`Remove process ${p.id}`}
                      title="Remove process"
                      onClick={() => {
                        clearDrafts();
                        removeProcess(i);
                      }}
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
        <button
          type="button"
          className={styles.add}
          onClick={() => {
            clearDrafts();
            addProcess();
          }}
        >
          + Add process
        </button>
        <button
          type="button"
          className={styles.reset}
          onClick={() => {
            clearDrafts();
            resetProcesses();
          }}
        >
          Reset example
        </button>
      </div>
    </div>
  );
}

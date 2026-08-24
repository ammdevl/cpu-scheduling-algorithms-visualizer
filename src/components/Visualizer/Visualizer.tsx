'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ALGORITHMS,
  buildFrames,
  fbQuantaConstant,
  fbQuantaExponential,
  runAlgorithm,
  type RunOptions,
  type SimResult,
} from '@/lib/scheduler';
import { useSimStore, useStoreHydration } from '@/lib/store';
import { AlgorithmPicker } from '../AlgorithmPicker/AlgorithmPicker';
import { ProcessEditor } from '../ProcessEditor/ProcessEditor';
import { GanttTable } from '../GanttTable/GanttTable';
import { MetricsTable } from '../MetricsTable/MetricsTable';
import { VisualizerSkeleton } from '../VisualizerSkeleton/VisualizerSkeleton';
import { Reveal } from '../Reveal/Reveal';
import styles from './Visualizer.module.scss';

const SPEEDS = [
  { label: '0.5×', ms: 1600 },
  { label: '1×', ms: 800 },
  { label: '1.5×', ms: 533 },
  { label: '2×', ms: 400 },
];

function optionsFor(
  id: string,
  quantum: number,
  fbPreset: 'exp2' | 'flat1'
): RunOptions | undefined {
  if (id === 'rr') return { quantum };
  if (id === 'feedback') {
    return { quanta: fbPreset === 'flat1' ? fbQuantaConstant(1) : fbQuantaExponential(2) };
  }
  return undefined;
}

export function Visualizer() {
  const ready = useStoreHydration();
  const processes = useSimStore((s) => s.processes);
  const algorithm = useSimStore((s) => s.algorithm);
  const quantum = useSimStore((s) => s.quantum);
  const fbPreset = useSimStore((s) => s.fbPreset);

  const [clock, setClock] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);

  const { result, error } = useMemo(() => {
    try {
      return {
        result: runAlgorithm(
          algorithm,
          processes,
          optionsFor(algorithm, quantum, fbPreset)
        ) as SimResult,
        error: null,
      };
    } catch (e) {
      return { result: null, error: e instanceof Error ? e.message : 'Simulation failed' };
    }
  }, [processes, algorithm, quantum, fbPreset]);

  const [prevResult, setPrevResult] = useState<SimResult | null>(result);
  if (prevResult !== result) {
    setPrevResult(result);
    setClock(0);
    setPlaying(false);
  }

  const frames = useMemo(() => {
    if (!result) return [];
    return buildFrames(result, processes, algorithm === 'srt' ? 'remaining' : 'arrival');
  }, [result, processes, algorithm]);

  useEffect(() => {
    if (!playing || !result) return;
    if (clock >= result.makespan) return;
    const id = setTimeout(() => {
      if (clock + 1 >= result.makespan) setPlaying(false);
      setClock(clock + 1);
    }, speed);
    return () => clearTimeout(id);
  }, [playing, clock, speed, result]);

  if (!ready) {
    return <VisualizerSkeleton />;
  }

  const meta = ALGORITHMS.find((a) => a.meta.id === algorithm)!.meta;

  if (!result) {
    return (
      <div className={styles.layout}>
        <aside className={styles.config}>
          <AlgorithmPicker />
          <ProcessEditor />
        </aside>
        <section className={styles.results}>
          <div className={`${styles.panel} ${styles.errorPanel}`}>
            <h2>Cannot simulate</h2>
            <p>{error}</p>
          </div>
        </section>
      </div>
    );
  }

  const makespan = result.makespan;
  const frame = frames[Math.min(clock, frames.length - 1)];
  const finished = clock >= makespan;
  const activeRemaining = frame.running ? frame.remaining[frame.running] : null;
  const activeIdx = frame.running
    ? processes.findIndex((p) => p.id === frame.running)
    : -1;
  const activeColor = activeIdx >= 0 ? `var(--p${activeIdx % 8})` : undefined;

  const stepBy = (d: number) => {
    setPlaying(false);
    setClock((c) => Math.min(makespan, Math.max(0, c + d)));
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.config}>
        <AlgorithmPicker />
        <ProcessEditor />
      </aside>

      <section className={styles.results}>
        <Reveal>
          <div className={styles.panel}>
            <div className={styles.theoryHead}>
              <h2>How {meta.name} works</h2>
              <span
                className={`${styles.badge} ${
                  meta.decisionMode === 'preemptive' ? styles.badgePreempt : ''
                }`}
              >
                {meta.decisionMode}
              </span>
              <span className={styles.badge}>
                <code>{meta.selectionFunction}</code>
              </span>
            </div>
            <p className={styles.blurb}>{meta.blurb}</p>
            <ol className={styles.steps}>
              {meta.how.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <p className={styles.note}>{meta.note}</p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className={styles.panel}>
            <div className={styles.simHead}>
              <h2>Step-by-step simulation</h2>
              <span className={styles.clock}>
              t = {clock} <em>/ {makespan}</em>
            </span>
          </div>
          <div className={styles.progress}>
            <div
              className={styles.progressFill}
              style={{ width: `${(clock / makespan) * 100}%` }}
            />
          </div>
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.runBtn}
              onClick={() => {
                if (finished) {
                  setClock(0);
                  setPlaying(true);
                } else {
                  setPlaying((p) => !p);
                }
              }}
            >
              {playing ? '❚❚ Pause' : finished ? '▶ Replay' : '▶ Run'}
            </button>
            <button type="button" onClick={() => stepBy(-1)} disabled={clock === 0}>
              ‹ Back
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setClock((c) => Math.min(makespan, c + 1));
              }}
              disabled={finished}
            >
              Step ›
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setClock(0);
              }}
              disabled={clock === 0 && !playing}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setClock(makespan);
              }}
              disabled={finished}
            >
              Final ⏭
            </button>
            <label className={styles.speed}>
              Speed
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                aria-label="Simulation speed"
              >
                {SPEEDS.map((s) => (
                  <option key={s.ms} value={s.ms}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.statusGrid}>
            <div className={styles.statusCell}>
              <span>CPU clock</span>
              <strong className={styles.valuePrimary}>t = {clock}</strong>
            </div>
            <div className={styles.statusCell}>
              <span>Active process</span>
              <strong
                className={frame.running ? undefined : styles.idle}
                style={activeColor ? { color: activeColor } : undefined}
              >
                {frame.running ?? 'IDLE'}
                {frame.running && frame.runningLevel !== null && (
                  <em className={styles.levelBadge}>L{frame.runningLevel}</em>
                )}
              </strong>
            </div>
            <div className={styles.statusCell}>
              <span>Remaining time</span>
              <strong className={activeRemaining !== null ? styles.valueAccent : undefined}>
                {activeRemaining !== null ? activeRemaining : '—'}
              </strong>
            </div>
          </div>

          <div className={styles.narration} aria-live="polite">
            {frame.justCompleted.map((pid) => (
              <span key={pid} className={styles.doneBadge}>
                ✓ {pid} finished at t={clock}
              </span>
            ))}
            {frame.events
              .filter((e) => e.kind !== 'complete')
              .map((e, i) => (
                <span key={i} className={styles.eventChip} data-kind={e.kind}>
                  {e.detail}
                </span>
              ))}
          </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
        <div className={styles.panel}>
          <h2>Gantt chart</h2>
          <p className={styles.caption}>
            One row per process, one column per time unit — cells fill in as the clock
            advances. The outlined column is the current step.
          </p>
          <GanttTable
            result={result}
            processes={processes}
            revealUpTo={clock}
            highlightT={clock > 0 ? clock - 1 : null}
          />
          <div className={styles.ganttQueue}>
            <div className={styles.queueHead}>
              <span className={styles.queueTitle}>Ready queue</span>
              <span className={styles.queueTime}>at t = {clock}</span>
            </div>
            <div className={styles.queueChips}>
              {frame.queue.length === 0 ? (
                <span className={styles.queueEmpty}>empty</span>
              ) : (
                <>
                  {frame.queue.map((e) => {
                    const idx = processes.findIndex((p) => p.id === e.pid);
                    return (
                      <span key={e.pid} className={styles.queueChip}>
                        <i
                          className={styles.queueDot}
                          style={{ background: `var(--p${(idx >= 0 ? idx : 0) % 8})` }}
                        />
                        {e.pid}
                        {e.level !== undefined && <em>L{e.level}</em>}
                        {e.remaining !== undefined && (
                          <small>rem {e.remaining}</small>
                        )}
                      </span>
                    );
                  })}
                  <span className={styles.queueArrow}>← next</span>
                </>
              )}
            </div>
          </div>
        </div>
        </Reveal>

        {finished ? (
          <Reveal delay={80}>
          <div className={styles.panel}>
            <h2>Final metrics</h2>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Avg turnaround (Tr)</span>
                <span className={styles.statValue}>
                  {result.summary.meanTurnaround.toFixed(2)}
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Avg Tr / Ts</span>
                <span className={styles.statValue}>
                  {result.summary.meanNormTr.toFixed(2)}
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Avg waiting</span>
                <span className={styles.statValue}>
                  {result.summary.meanWaiting.toFixed(2)}
                </span>
              </div>
            </div>
            <MetricsTable processes={processes} result={result} />
            <p className={styles.caption}>
              Tr = finish − arrival · Tr/Ts = normalized turnaround · Waiting = Tr − Ts
            </p>
          </div>
          </Reveal>
        ) : null}

        <Reveal delay={80}>
        <details className={styles.logDetails}>
          <summary>Full execution timeline ({result.events.length} events)</summary>
          <ol className={styles.events}>
            {result.events.map((e, i) => (
              <li key={i} className={styles.event} data-kind={e.kind}>
                <span className={styles.eventTime}>t={e.t}</span>
                <span>{e.detail}</span>
              </li>
            ))}
          </ol>
        </details>
        </Reveal>
      </section>
    </div>
  );
}

import type { Viewport } from 'next';
import Link from 'next/link';
import { ALGORITHMS, LECTURE_EXAMPLE } from '@/lib/scheduler';
import { Reveal } from '@/components/Reveal/Reveal';
import { ScrollHint } from '@/components/ScrollHint/ScrollHint';
import styles from './page.module.scss';

export const viewport: Viewport = {
  width: 1280,
};

const MOCK_ROWS = [
  { id: 'A', cells: [0, 1, 3] },
  { id: 'B', cells: [2, 5] },
  { id: 'C', cells: [4, 7] },
  { id: 'D', cells: [6, 9] },
  { id: 'E', cells: [8] },
];

const CAPABILITIES = [
  {
    eyebrow: 'Simulate',
    title: 'Watch every tick of the CPU',
    body: 'Press run and follow the clock second by second: who holds the CPU, who is waiting, who just finished — with narration for every arrival, preemption and completion.',
    pills: ['Run / pause / step', '0.5× – 2× speed', 'Live ready queue', 'Event narration'],
  },
  {
    eyebrow: 'Understand',
    title: 'Read results like a table',
    body: 'The Gantt table fills one cell per time unit, the ready queue updates underneath, and finish time, turnaround (Tr), Tr/Ts and waiting are computed for every process.',
    pills: ['Gantt table', 'Queue levels', 'Turnaround Tr', 'Tr / Ts ratio'],
  },
  {
    eyebrow: 'Compare',
    title: 'Put all six policies head to head',
    body: 'Run every algorithm on the same workload and see which one wins on average turnaround, normalized Tr/Ts and waiting time — with the best value highlighted.',
    pills: ['Side-by-side averages', 'Turnaround bars', 'Per-policy details'],
  },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.blobA} aria-hidden="true" />
        <div className={styles.blobB} aria-hidden="true" />
        <Reveal>
          <span className={styles.badge}>Free · No signup · Runs in your browser</span>
        </Reveal>
        <Reveal delay={80}>
          <h1>
            See how the CPU decides{' '}
            <span className={styles.accent}>who runs next</span>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className={styles.lede}>
            An interactive playground for CPU scheduling. Enter your own processes,
            pick a policy, and step through the simulation tick by tick — with the
            Gantt table, ready queue and turnaround metrics updating live.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className={styles.cta}>
            <Link href="/algorithms" className={styles.primary}>
              Start visualizing
            </Link>
            <Link href="/comparison" className={styles.secondary}>
              Compare algorithms
            </Link>
          </div>
          <p className={styles.micro}>No account needed · Works offline · Light &amp; dark theme</p>
        </Reveal>

        <Reveal delay={320} className={styles.mockReveal}>
          <div className={styles.mock} aria-hidden="true">
            <div className={styles.mockBar}>
              <span className={styles.mockDot} />
              <span className={styles.mockDot} />
              <span className={styles.mockDot} />
              <span className={styles.mockUrl}>cpu-scheduling.app/algorithms</span>
            </div>
            <div className={styles.mockToolbar}>
              <span className={styles.mockSelect}>Round Robin · q = 1 ▾</span>
              <span className={styles.mockRun}>▶ Run</span>
            </div>
            <div className={styles.mockGrid}>
              <span className={styles.mockCorner} />
              {Array.from({ length: 10 }, (_, t) => (
                <span key={t} className={styles.mockTime}>
                  {t + 1}
                </span>
              ))}
              {MOCK_ROWS.map((row, r) => (
                <MockRow key={row.id} id={row.id} cells={row.cells} row={r} />
              ))}
            </div>
            <div className={styles.mockChip}>
              <span>Avg turnaround</span>
              <strong>8.60</strong>
            </div>
          </div>
        </Reveal>
        <ScrollHint />
      </section>

      <section>
        <Reveal>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>Everything you need</span>
            <h2>From arrival to completion, visually</h2>
          </div>
        </Reveal>
        <div className={styles.capabilities}>
          {CAPABILITIES.map((cap, i) => (
            <Reveal key={cap.eyebrow} delay={i * 90}>
              <div className={styles.capability}>
                <span className={styles.capEyebrow}>{cap.eyebrow}</span>
                <h3>{cap.title}</h3>
                <p>{cap.body}</p>
                <div className={styles.pills}>
                  {cap.pills.map((pill) => (
                    <span key={pill} className={styles.pill}>
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section>
        <Reveal>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>The algorithms</span>
            <h2>Six classic policies, one workload</h2>
          </div>
        </Reveal>
        <div className={styles.algos}>
          {ALGORITHMS.map((a, i) => (
            <Reveal key={a.meta.id} delay={i * 60}>
              <div className={styles.algo}>
                <span className={styles.algoName}>{a.meta.name}</span>
                <span
                  className={`${styles.algoMode} ${
                    a.meta.decisionMode === 'preemptive' ? styles.algoModePreempt : ''
                  }`}
                >
                  {a.meta.decisionMode}
                </span>
                <code>{a.meta.selectionFunction}</code>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section>
        <Reveal>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>How it works</span>
            <h2>Three steps to scheduling intuition</h2>
          </div>
        </Reveal>
        <Reveal>
          <ol className={styles.steps}>
            <li>
              <strong>Enter processes.</strong> A five-process example is preloaded —
              edit, remove or add your own.
              <div className={styles.tableScroll}>
                <div className={styles.miniTable} aria-hidden="true">
                  <table>
                    <thead>
                      <tr>
                        <th />
                        {LECTURE_EXAMPLE.map((p) => (
                          <th key={p.id}>{p.id}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Arrival</td>
                        {LECTURE_EXAMPLE.map((p) => (
                          <td key={p.id}>{p.arrival}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Service</td>
                        {LECTURE_EXAMPLE.map((p) => (
                          <td key={p.id}>{p.service}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </li>
            <li>
              <strong>Pick a policy.</strong> Choose from the dropdown and tune
              parameters like the Round Robin quantum or the Feedback level quanta.
            </li>
            <li>
              <strong>Press run.</strong> Step through tick by tick, then check the
              Gantt table and metrics against your own hand-traced answer.
            </li>
          </ol>
        </Reveal>
      </section>

      <Reveal>
        <section className={styles.ctaBand}>
          <h2>Ready to watch the scheduler work?</h2>
          <p>Load the built-in example or bring your own workload — the CPU is waiting.</p>
          <div className={styles.cta}>
            <Link href="/algorithms" className={styles.bandBtn}>
              Start visualizing
            </Link>
          </div>
          <span className={styles.bandMicro}>No signup · Six policies · Step-by-step playback</span>
        </section>
      </Reveal>
    </main>
  );
}

function MockRow({ id, cells, row }: { id: string; cells: number[]; row: number }) {
  return (
    <>
      <span className={styles.mockLabel}>{id}</span>
      {Array.from({ length: 10 }, (_, t) => (
        <span
          key={t}
          className={`${styles.mockCell} ${cells.includes(t) ? styles.mockFilled : ''}`}
          style={cells.includes(t) ? { background: `var(--p${row % 8})` } : undefined}
        />
      ))}
    </>
  );
}

import Link from 'next/link';
import { ALGORITHMS, LECTURE_EXAMPLE } from '@/lib/scheduler';
import { Reveal } from '@/components/Reveal/Reveal';
import styles from './page.module.scss';

const FEATURES = [
  {
    title: 'Six classic policies',
    body: 'FCFS, Round Robin (any quantum), Shortest Process Next, Shortest Remaining Time, Highest Response Ratio Next and multilevel Feedback — each with a plain-language explanation of how it picks the next process.',
  },
  {
    title: 'Step-by-step Gantt tables',
    body: 'One row per process, one column per time unit. Press run and watch each process take the CPU tick by tick, with the ready queue and remaining times updated live.',
  },
  {
    title: 'Side-by-side comparison',
    body: 'Run every algorithm on the same workload and compare average turnaround, normalized Tr/Ts and waiting time to see which policy wins — and why.',
  },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Interactive learning tool</p>
        <h1>
          See how the CPU decides <span className={styles.accent}>who runs next</span>
        </h1>
        <p className={styles.lede}>
          An interactive playground for CPU scheduling. Enter your own processes, pick an
          algorithm, and watch the simulation unfold step by step — with turnaround and
          waiting metrics computed for every policy.
        </p>
        <div className={styles.cta}>
          <Link href="/algorithms" className={styles.primary}>
            Start visualizing
          </Link>
          <Link href="/comparison" className={styles.secondary}>
            Compare algorithms
          </Link>
        </div>
      </section>

      <Reveal>
        <section className={styles.features}>
          {FEATURES.map((f, i) => (
            <div className={styles.featureRow} key={f.title}>
              <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
              <div className={styles.featureBody}>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            </div>
          ))}
        </section>
      </Reveal>

      <Reveal>
        <section>
          <h2 className={styles.sectionTitle}>The algorithms</h2>
          <div className={styles.chips}>
            {ALGORITHMS.map((a, i) => (
              <Reveal key={a.meta.id} delay={i * 70}>
                <div className={styles.chip}>
                  <span>{a.meta.name}</span>
                  <em>{a.meta.decisionMode}</em>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section>
          <h2 className={styles.sectionTitle}>How it works</h2>
          <ol className={styles.steps}>
            <li>
              <strong>Enter processes.</strong> A five-process example (A–E, arrivals 0–8,
              service 3–2) is preloaded — edit, remove or add your own.
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
              <strong>Pick an algorithm.</strong> Tune parameters like the Round Robin
              quantum or the Feedback level quanta and read a short explanation of the
              policy.
            </li>
            <li>
              <strong>Watch it run.</strong> Step through the simulation tick by tick, then
              read the Gantt table to see exactly which process owned the CPU in each time
              unit, with finish time, Tr and Tr/Ts computed for every process.
            </li>
          </ol>
        </section>
      </Reveal>
    </main>
  );
}

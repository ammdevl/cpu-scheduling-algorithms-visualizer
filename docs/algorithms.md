# Algorithms

All six policies operate on the same input model and are pinned by golden
tests to the classic five-process example:

| Process | A | B | C | D | E |
| --- | --- | --- | --- | --- | --- |
| Arrival | 0 | 2 | 4 | 6 | 8 |
| Service (Ts) | 3 | 6 | 4 | 5 | 2 |

Notation: **w** = waiting time so far, **s** = total service time, **s'** =
remaining service time.

## Overview

| Algorithm | Mode | Selection function | Parameters |
| --- | --- | --- | --- |
| First-Come, First-Served (FCFS) | non-preemptive | earliest arrival (max w) | — |
| Round Robin (RR) | preemptive | cyclic FIFO | quantum q (1–20, default 1) |
| Shortest Process Next (SPN) | non-preemptive | min s | — |
| Shortest Remaining Time (SRT) | preemptive | min s' | — |
| Highest Response Ratio Next (HRRN) | non-preemptive | max (w + s) / s | — |
| Feedback (FB) | preemptive | lowest queue level, FIFO | per-level quanta (2^i or uniform 1) |

## Rules and conventions

These conventions are pinned by tests. Changing one is a deliberate,
documented decision (update fixtures + this page + AGENTS.md).

### Common

- A process arriving exactly when another's quantum expires enqueues **before**
  the expired process rejoins the ready queue.
- Equal-priority ties resolve by earlier arrival, then by input order.

### FCFS

Run processes strictly in arrival order to completion. The CPU idles until the
first arrival.

### Round Robin

1. Keep a FIFO ready queue; dispatch the head for at most q time units.
2. On quantum expiry the process rejoins the **tail**; arrivals during the
   slice (and at its boundary) enqueue first.
3. A process that finishes early hands over the CPU immediately.

### SPN

Among arrived, unfinished processes pick the smallest service time and run it
to completion. Ties: earlier arrival first.

### SRT

Preemptive SPN. On every arrival, compare the newcomer's service time with the
running process's remaining time; preempt only on **strictly smaller**
remaining time — ties continue the running process. Waiting-order ties resolve
by arrival time.

### HRRN

Pick the waiting process with the highest response ratio
`R = (w + s) / s`. R grows while waiting, which prevents the starvation SPN
can cause. Non-preemptive.

### Feedback (multilevel queues)

The variant implemented here reproduces the lecture's traces exactly:

1. New arrivals enter the **top queue (L0)**.
2. Each level `i` runs with its own quantum `q_i` (preset `2^i`: 1, 2, 4, 8,
   ...; or uniform 1).
3. Always dispatch from the **lowest non-empty level**, FIFO within a level.
4. A quantum that expires **while other processes are waiting** demotes the
   process one level; an **uncontended** quantum (nothing ready during the
   quantum) lets it stay at the same level.
5. **No mid-quantum preemption** — arrivals wait for the next scheduling point.
6. Per-level quanta are clamped to a minimum of 1.

## Golden fixtures

Expected per-process finish times (classic workload):

| Variant | A | B | C | D | E | Mean Tr | Mean Tr/Ts |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FCFS | 3 | 9 | 13 | 18 | 20 | 8.60 | 2.56 |
| RR q=1 | 4 | 18 | 17 | 20 | 15 | 10.80 | 2.71 |
| RR q=4 | 3 | 17 | 11 | 20 | 19 | 10.00 | 2.71 |
| SPN | 3 | 9 | 15 | 20 | 11 | 7.60 | 1.84 |
| SRT | 3 | 15 | 8 | 20 | 10 | 7.20 | 1.59 |
| HRRN | 3 | 9 | 13 | 20 | 15 | 8.00 | 2.14 |
| FB q=1 | 4 | 20 | 16 | 19 | 11 | 10.00 | 2.29 |
| FB q=2^i | 4 | 17 | 18 | 20 | 14 | 10.60 | 2.63 |

The tests additionally pin the full execution order (per-unit Gantt string),
e.g. RR q=1 is `AABABCBDCBEDCBEDCBDD` and FB q=2^i is
`AABACBBDECCDDEBBBCDD`.

## Adding an algorithm

1. Implement `simulateX(processes, options?): SimResult` in a new engine file,
   following the non-preemptive or preemptive patterns. Emit narrated events,
   and a queue timeline if the policy uses an ordered queue.
2. Add a registry entry with full name, decision mode, selection function,
   `how` steps and a `note` (starvation / overhead caveats).
3. Add golden tests from a trusted reference (per-process finishes, means, and
   the full Gantt execution order).
4. Update this page and the main README algorithm list.

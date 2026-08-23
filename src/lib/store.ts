import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { LECTURE_EXAMPLE } from './scheduler/registry';
import type { AlgoId, ProcessInput } from './scheduler/types';

export type FbPreset = 'exp2' | 'flat1';

interface SimState {
  processes: ProcessInput[];
  algorithm: AlgoId;
  quantum: number;
  fbPreset: FbPreset;
  setAlgorithm: (id: AlgoId) => void;
  setQuantum: (q: number) => void;
  setFbPreset: (p: FbPreset) => void;
  updateProcess: (index: number, patch: Partial<ProcessInput>) => void;
  addProcess: () => void;
  removeProcess: (index: number) => void;
  resetProcesses: () => void;
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function nextId(processes: ProcessInput[]): string {
  const used = new Set(processes.map((p) => p.id.toUpperCase()));
  for (const l of LETTERS) {
    if (!used.has(l)) return l;
  }
  return `P${processes.length + 1}`;
}

export function processRowError(p: ProcessInput, all: ProcessInput[]): string | null {
  if (!p.id.trim()) return 'Name is required';
  const dup = all.filter((q) => q.id.trim().toUpperCase() === p.id.trim().toUpperCase());
  if (dup.length > 1) return 'Duplicate name';
  if (!Number.isInteger(p.arrival) || p.arrival < 0) return 'Arrival must be an integer ≥ 0';
  if (!Number.isInteger(p.service) || p.service < 1) return 'Service must be an integer ≥ 1';
  return null;
}

export const useSimStore = create<SimState>()(
  persist(
    (set) => ({
      processes: LECTURE_EXAMPLE.map((p) => ({ ...p })),
      algorithm: 'fcfs',
      quantum: 1,
      fbPreset: 'exp2',
      setAlgorithm: (id) => set({ algorithm: id }),
      setQuantum: (q) => set({ quantum: Math.min(50, Math.max(1, Math.floor(q) || 1)) }),
      setFbPreset: (p) => set({ fbPreset: p }),
      updateProcess: (index, patch) =>
        set((s) => ({
          processes: s.processes.map((p, i) => (i === index ? { ...p, ...patch } : p)),
        })),
      addProcess: () =>
        set((s) => ({
          processes: [...s.processes, { id: nextId(s.processes), arrival: 0, service: 1 }],
        })),
      removeProcess: (index) =>
        set((s) => ({ processes: s.processes.filter((_, i) => i !== index) })),
      resetProcesses: () => set({ processes: LECTURE_EXAMPLE.map((p) => ({ ...p })) }),
    }),
    {
      name: 'csv-sim',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        processes: s.processes,
        algorithm: s.algorithm,
        quantum: s.quantum,
        fbPreset: s.fbPreset,
      }),
    }
  )
);

export function useStoreHydration(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const unsub = useSimStore.persist.onFinishHydration(() => setReady(true));
    Promise.resolve(useSimStore.persist.rehydrate()).finally(() => setReady(true));
    return () => unsub();
  }, []);
  return ready;
}

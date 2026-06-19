import { create } from 'zustand';
import { db, type FoodLog } from '../db/database';

interface FoodLogStore {
  logs: FoodLog[];
  loading: boolean;
  loadByDate: (date: string) => Promise<void>;
  add: (log: Omit<FoodLog, 'id' | 'createdAt'>) => Promise<void>;
  remove: (id: number) => Promise<void>;
  updateServings: (id: number, servings: number) => Promise<void>;
}

export const useFoodLogStore = create<FoodLogStore>((set) => ({
  logs: [],
  loading: true,

  loadByDate: async (date: string) => {
    set({ loading: true });
    const logs = await db.foodLogs.where('date').equals(date).toArray();
    set({ logs, loading: false });
  },

  add: async (log) => {
    const entry = { ...log, createdAt: Date.now() };
    const id = await db.foodLogs.add(entry as FoodLog);
    const saved = { ...entry, id } as FoodLog;
    set((s) => ({ logs: [...s.logs, saved] }));
  },

  remove: async (id) => {
    await db.foodLogs.delete(id);
    set((s) => ({ logs: s.logs.filter((l) => l.id !== id) }));
  },

  updateServings: async (id, servings) => {
    await db.foodLogs.update(id, { servings });
    set((s) => ({
      logs: s.logs.map((l) => (l.id === id ? { ...l, servings } : l)),
    }));
  },
}));

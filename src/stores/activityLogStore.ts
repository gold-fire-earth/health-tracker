import { create } from 'zustand';
import { db, type ActivityLog } from '../db/database';

interface ActivityLogStore {
  logs: ActivityLog[];
  loading: boolean;
  loadByDate: (date: string) => Promise<void>;
  add: (log: Omit<ActivityLog, 'id' | 'createdAt'>) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useActivityLogStore = create<ActivityLogStore>((set) => ({
  logs: [],
  loading: true,

  loadByDate: async (date: string) => {
    set({ loading: true });
    const logs = await db.activityLogs.where('date').equals(date).toArray();
    set({ logs, loading: false });
  },

  add: async (log) => {
    const entry = { ...log, createdAt: Date.now() };
    const id = await db.activityLogs.add(entry as ActivityLog);
    set((s) => ({ logs: [...s.logs, { ...entry, id } as ActivityLog] }));
  },

  remove: async (id) => {
    await db.activityLogs.delete(id);
    set((s) => ({ logs: s.logs.filter((l) => l.id !== id) }));
  },
}));

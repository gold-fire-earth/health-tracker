import { create } from 'zustand';
import { db, type UserProfile, type DailyTarget } from '../db/database';
import { calcCalorieTarget, calcMacroTargets } from '../utils/tdee';

interface GoalStore {
  profile: UserProfile | null;
  todayTarget: DailyTarget | null;
  loading: boolean;
  load: () => Promise<void>;
  saveProfile: (p: Omit<UserProfile, 'id'>) => Promise<void>;
  hasProfile: () => boolean;
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  profile: null,
  todayTarget: null,
  loading: true,

  load: async () => {
    const profiles = await db.userProfile.toArray();
    const profile = profiles[0] || null;
    const today = new Date().toISOString().slice(0, 10);
    const targets = await db.dailyTargets.where('date').equals(today).toArray();
    const todayTarget = targets[0] || null;
    set({ profile, todayTarget, loading: false });
  },

  saveProfile: async (p) => {
    const profiles = await db.userProfile.toArray();
    let profile: UserProfile;
    if (profiles.length > 0) {
      await db.userProfile.update(profiles[0].id!, p);
      profile = { ...p, id: profiles[0].id } as UserProfile;
    } else {
      const id = await db.userProfile.add(p as UserProfile);
      profile = { ...p, id } as UserProfile;
    }

    // Recalculate today's target
    const today = new Date().toISOString().slice(0, 10);
    const macroTargets = calcMacroTargets(profile);
    const target: DailyTarget = { date: today, ...macroTargets };

    const existingTargets = await db.dailyTargets.where('date').equals(today).toArray();
    if (existingTargets.length > 0) {
      await db.dailyTargets.update(existingTargets[0].id!, target);
    } else {
      await db.dailyTargets.add(target);
    }

    set({ profile, todayTarget: target });
  },

  hasProfile: () => get().profile !== null,
}));

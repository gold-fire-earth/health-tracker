import { create } from 'zustand';
import { db, type Recipe } from '../db/database';
import presetRecipes from '../data/presetRecipes';

interface RecipeStore {
  recipes: Recipe[];
  loading: boolean;
  load: () => Promise<void>;
  add: (r: Omit<Recipe, 'id'>) => Promise<number>;
  update: (id: number, r: Partial<Recipe>) => Promise<void>;
  remove: (id: number) => Promise<void>;
  getById: (id: number) => Recipe | undefined;
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  loading: true,

  load: async () => {
    const count = await db.recipes.count();
    if (count === 0) {
      // First run: seed all presets
      await db.recipes.bulkAdd(presetRecipes as Recipe[]);
    } else {
      // Incremental: add any new presets not yet in DB
      const existing = await db.recipes.toArray();
      const existingNames = new Set(existing.map((r) => r.name));
      const newPresets = presetRecipes.filter((p) => !existingNames.has(p.name));
      if (newPresets.length > 0) {
        await db.recipes.bulkAdd(newPresets as Recipe[]);
      }
    }
    const all = await db.recipes.orderBy('name').toArray();
    set({ recipes: all, loading: false });
  },

  add: async (r) => {
    const id = await db.recipes.add(r as Recipe);
    set((s) => ({ recipes: [...s.recipes, { ...r, id } as Recipe] }));
    return id as number;
  },

  update: async (id, r) => {
    await db.recipes.update(id, r);
    set((s) => ({
      recipes: s.recipes.map((x) => (x.id === id ? { ...x, ...r } : x)),
    }));
  },

  remove: async (id) => {
    await db.recipes.delete(id);
    set((s) => ({ recipes: s.recipes.filter((x) => x.id !== id) }));
  },

  getById: (id) => get().recipes.find((r) => r.id === id),
}));

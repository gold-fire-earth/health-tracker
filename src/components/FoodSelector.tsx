import { useState, useMemo } from 'react';
import { useRecipeStore } from '../stores/recipeStore';
import type { Recipe } from '../db/database';

interface Props {
  mealType: Recipe['mealType'];
  recentRecipeIds: number[];
  onSelect: (recipe: Recipe) => void;
  onClose: () => void;
}

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'breakfast', label: '🌅 早餐' },
  { key: 'lunch', label: '☀️ 午餐' },
  { key: 'dinner', label: '🌙 晚餐' },
  { key: 'snack', label: '🍎 加餐' },
] as const;

export function FoodSelector({ mealType, recentRecipeIds, onSelect, onClose }: Props) {
  const recipes = useRecipeStore((s) => s.recipes);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>(mealType);

  const recentSet = useMemo(() => new Set(recentRecipeIds), [recentRecipeIds]);

  const filtered = useMemo(() => {
    let list = recipes;
    if (filter !== 'all') {
      if (filter === 'lunch') {
        list = list.filter((r) => r.mealType === 'lunch' || r.mealType === 'dinner');
      } else if (filter === 'dinner') {
        list = list.filter((r) => r.mealType === 'dinner' || r.mealType === 'lunch');
      } else {
        list = list.filter((r) => r.mealType === filter);
      }
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q));
    } else {
      // Sort by recent usage: frequently used items first
      list = [...list].sort((a, b) => {
        const aIdx = recentRecipeIds.indexOf(a.id!);
        const bIdx = recentRecipeIds.indexOf(b.id!);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return 0;
      });
    }
    return list.slice(0, 40);
  }, [recipes, filter, search, recentRecipeIds]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <button onClick={onClose} className="text-gray-400 text-lg p-1">
          ✕
        </button>
        <input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索食物..."
          className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-sm"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar border-b border-gray-50">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              filter === f.key
                ? 'bg-primary-400 text-white font-medium'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-12">没有找到匹配的食物</p>
        )}
        {filtered.map((r) => (
          <button
            key={r.id}
            onClick={() => onSelect(r)}
            className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 active:bg-gray-50"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-gray-700">{r.name}</p>
              <p className="text-xs text-gray-400">
                {r.servingSize}{r.servingUnit} · 每份
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-energy-500">{r.calories} kcal</p>
              <p className="text-xs text-gray-400">
                P{r.protein}g · C{r.carbs}g · F{r.fat}g
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

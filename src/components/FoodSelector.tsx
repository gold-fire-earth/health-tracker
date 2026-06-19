import { useState, useMemo, useEffect, useRef } from 'react';
import { useRecipeStore } from '../stores/recipeStore';
import type { Recipe } from '../db/database';

export interface OnlineResult {
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
}

interface Props {
  mealType: Recipe['mealType'];
  recentRecipeIds: number[];
  onSelect: (recipe: Recipe) => void;
  onSelectOnline: (result: OnlineResult) => void;
  onClose: () => void;
}

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'breakfast', label: '🌅 早餐' },
  { key: 'lunch', label: '☀️ 午餐' },
  { key: 'dinner', label: '🌙 晚餐' },
  { key: 'snack', label: '🍎 加餐' },
] as const;

export function FoodSelector({ mealType, recentRecipeIds, onSelect, onSelectOnline, onClose }: Props) {
  const recipes = useRecipeStore((s) => s.recipes);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>(mealType);
  const [onlineResults, setOnlineResults] = useState<OnlineResult[]>([]);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

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

  // Debounced online search — direct OpenFoodFacts API call
  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) {
      setOnlineResults([]);
      return;
    }
    setSearching(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const offUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&json=1&page_size=20&search_simple=1`;
        const res = await fetch(offUrl);
        const data = await res.json() as {
          products?: Array<{
            product_name?: string;
            brands?: string;
            nutriments?: Record<string, number>;
            serving_size?: string;
          }>;
        };
        const products = data.products || [];
        const results: OnlineResult[] = products
          .filter((p) => p.product_name && p.nutriments?.['energy-kcal_100g'])
          .slice(0, 20)
          .map((p) => ({
            name: p.product_name!,
            brand: p.brands || '',
            calories: Math.round(p.nutriments?.['energy-kcal_100g'] || 0),
            protein: +(p.nutriments?.proteins_100g || 0).toFixed(1),
            carbs: +(p.nutriments?.carbohydrates_100g || 0).toFixed(1),
            fat: +(p.nutriments?.fat_100g || 0).toFixed(1),
            servingSize: p.serving_size || '100g',
          }));
        setOnlineResults(results);
      } catch {
        setOnlineResults([]);
      }
      setSearching(false);
    }, 400);
    return () => clearTimeout(timerRef.current);
  }, [search]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <button onClick={onClose} className="text-gray-400 text-lg p-1">✕</button>
        <input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索食物... 输入关键词支持联网搜索"
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
              filter === f.key ? 'bg-primary-400 text-white font-medium' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Local Results */}
        {filtered.length === 0 && !search.trim() && (
          <p className="text-center text-gray-400 py-12">没有找到匹配的食物</p>
        )}
        {filtered.length === 0 && search.trim() && (
          <p className="text-center text-gray-400 pt-8 pb-2 text-sm">本地食谱中没有匹配项</p>
        )}

        {filtered.map((r) => (
          <button
            key={r.id}
            onClick={() => onSelect(r)}
            className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 active:bg-gray-50"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-gray-700">{r.name}</p>
              <p className="text-xs text-gray-400">{r.servingSize}{r.servingUnit} · 每份</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-energy-500">{r.calories} kcal</p>
              <p className="text-xs text-gray-400">P{r.protein}g · C{r.carbs}g · F{r.fat}g</p>
            </div>
          </button>
        ))}

        {/* Online Results */}
        {search.trim().length >= 2 && (
          <div className="border-t border-gray-100 mt-2">
            <div className="flex items-center gap-2 px-4 py-3 sticky top-0 bg-gray-50 z-10">
              <span className="text-sm font-semibold text-gray-600">🌐 联网搜索结果</span>
              {searching && <span className="text-xs text-gray-400 animate-pulse">搜索中...</span>}
              {!searching && onlineResults.length > 0 && (
                <span className="text-xs text-gray-400">{onlineResults.length} 条</span>
              )}
            </div>

            {!searching && onlineResults.length === 0 && search.trim().length >= 2 && (
              <p className="text-center text-gray-400 py-8 text-sm">
                联网搜索无结果，试试其他关键词
              </p>
            )}

            {onlineResults.map((r, i) => (
              <button
                key={`online-${i}`}
                onClick={() => onSelectOnline(r)}
                className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 active:bg-blue-50"
              >
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{r.name}</p>
                  <p className="text-xs text-gray-400">
                    {r.brand ? `${r.brand} · ` : ''}每100g
                  </p>
                </div>
                <div className="text-right ml-2">
                  <p className="text-sm font-semibold text-blue-500">{r.calories} kcal</p>
                  <p className="text-xs text-gray-400">P{r.protein}g · C{r.carbs}g · F{r.fat}g</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

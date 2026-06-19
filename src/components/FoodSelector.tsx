import { useState, useMemo, useEffect, useRef } from 'react';
import { useRecipeStore } from '../stores/recipeStore';
import { CATEGORY_LABELS, type Category, type Recipe } from '../db/database';

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
  onSelectBatch: (recipes: Recipe[]) => void;
  onClose: () => void;
}

const CATEGORY_OPTIONS: Array<{ key: Category | 'all'; label: string }> = [
  { key: 'all', label: '全部类别' },
  { key: 'breakfast', label: CATEGORY_LABELS.breakfast },
  { key: 'staple', label: CATEGORY_LABELS.staple },
  { key: 'meat', label: CATEGORY_LABELS.meat },
  { key: 'home-cooking', label: CATEGORY_LABELS['home-cooking'] },
  { key: 'vegetable', label: CATEGORY_LABELS.vegetable },
  { key: 'hotpot', label: CATEGORY_LABELS.hotpot },
  { key: 'fast-food', label: CATEGORY_LABELS['fast-food'] },
  { key: 'packaged', label: CATEGORY_LABELS.packaged },
  { key: 'fruit', label: CATEGORY_LABELS.fruit },
  { key: 'snack-dessert', label: CATEGORY_LABELS['snack-dessert'] },
  { key: 'beverage', label: CATEGORY_LABELS.beverage },
];

export function FoodSelector({ mealType, recentRecipeIds, onSelect, onSelectOnline, onSelectBatch, onClose }: Props) {
  const recipes = useRecipeStore((s) => s.recipes);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [onlineResults, setOnlineResults] = useState<OnlineResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addedOnline, setAddedOnline] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Filter strictly by mealType (no lunch/dinner merge)
  const mealFiltered = useMemo(() => {
    return recipes.filter((r) => r.mealType === mealType);
  }, [recipes, mealType]);

  // Then filter by category dropdown and search text
  const filtered = useMemo(() => {
    let list = mealFiltered;
    if (category !== 'all') {
      list = list.filter((r) => r.category === category);
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
    return list.slice(0, 60);
  }, [mealFiltered, category, search, recentRecipeIds]);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    if (selected.size === 0) return;
    const chosen = recipes.filter((r) => r.id !== undefined && selected.has(r.id));
    if (chosen.length > 0) {
      onSelectBatch(chosen);
    }
    onClose();
  };

  // Debounced online search — direct OpenFoodFacts API
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

  const mealLabel = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' }[mealType];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <button onClick={onClose} className="text-gray-400 text-lg p-1">✕</button>
        <div className="flex-1">
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`搜索${mealLabel}食物... 输入关键词支持联网搜索`}
            className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Category dropdown */}
      <div className="px-4 py-3 border-b border-gray-50">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category | 'all')}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 16px center',
            paddingRight: '40px',
          }}
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Local Results */}
        <p className="px-4 py-2 text-xs text-gray-400">
          本地食谱 · {filtered.length} 项
        </p>

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">没有匹配的食谱</p>
        )}

        {filtered.map((r) => {
          const isChecked = selected.has(r.id!);
          return (
            <button
              key={r.id}
              onClick={() => toggle(r.id!)}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 active:bg-gray-50"
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                isChecked ? 'bg-primary-400 border-primary-400' : 'border-gray-300'
              }`}>
                {isChecked && <span className="text-white text-xs">✓</span>}
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{r.name}</p>
                <p className="text-xs text-gray-400">
                  {r.servingSize}{r.servingUnit} · {CATEGORY_LABELS[r.category] || r.category}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-energy-500">{r.calories} kcal</p>
                <p className="text-xs text-gray-400">P{r.protein}g · C{r.carbs}g · F{r.fat}g</p>
              </div>
            </button>
          );
        })}

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
              <p className="text-center text-gray-400 py-8 text-sm">联网搜索无结果，试试其他关键词</p>
            )}

            {onlineResults.map((r, i) => {
              const key = `online-${i}`;
              const added = addedOnline.has(key);
              return (
                <button
                  key={key}
                  onClick={() => {
                    if (!added) {
                      setAddedOnline((prev) => new Set(prev).add(key));
                      onSelectOnline(r);
                    }
                  }}
                  disabled={added}
                  className={`w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 ${
                    added ? 'bg-gray-50 opacity-50' : 'active:bg-blue-50'
                  }`}
                >
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{r.name}</p>
                    <p className="text-xs text-gray-400">
                      {r.brand ? `${r.brand} · ` : ''}每{r.servingSize}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-semibold text-blue-500">{r.calories} kcal</p>
                    <p className="text-xs text-gray-400">P{r.protein}g · C{r.carbs}g · F{r.fat}g</p>
                  </div>
                  {added && <span className="text-green-400 text-sm ml-1">已添加</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom confirm bar */}
      {selected.size > 0 && (
        <div className="border-t border-gray-200 p-4 flex items-center justify-between bg-white safe-bottom">
          <span className="text-sm text-gray-600">
            已选 <span className="font-semibold text-primary-500">{selected.size}</span> 项
          </span>
          <button onClick={handleConfirm} className="btn-primary px-8 py-2.5 text-sm">
            添加选中食谱
          </button>
        </div>
      )}
    </div>
  );
}

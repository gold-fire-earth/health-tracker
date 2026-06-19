import { useEffect, useMemo, useState } from 'react';
import { useFoodLogStore } from '../stores/foodLogStore';
import { FoodSelector } from '../components/FoodSelector';
import type { Recipe } from '../db/database';
import { db } from '../db/database';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

const MEAL_CONFIG: Record<string, { label: string; icon: string; bg: string }> = {
  breakfast: { label: '早餐', icon: '🌅', bg: 'bg-amber-50 border-amber-200' },
  lunch: { label: '午餐', icon: '☀️', bg: 'bg-blue-50 border-blue-200' },
  dinner: { label: '晚餐', icon: '🌙', bg: 'bg-indigo-50 border-indigo-200' },
  snack: { label: '加餐', icon: '🍎', bg: 'bg-green-50 border-green-200' },
};

export default function FoodLog() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<Recipe['mealType']>('breakfast');

  // Quick record state
  const [quickMeal, setQuickMeal] = useState<string | null>(null);
  const [quickName, setQuickName] = useState('');
  const [quickCal, setQuickCal] = useState('');
  const [quickProtein, setQuickProtein] = useState('');

  const logs = useFoodLogStore((s) => s.logs);
  const loadByDate = useFoodLogStore((s) => s.loadByDate);
  const addLog = useFoodLogStore((s) => s.add);
  const removeLog = useFoodLogStore((s) => s.remove);
  const updateServings = useFoodLogStore((s) => s.updateServings);

  const [recentRecipeIds, setRecentRecipeIds] = useState<number[]>([]);

  useEffect(() => {
    loadByDate(date);
  }, [date]);

  useEffect(() => {
    // Load recently used recipe IDs for sorting in selector
    db.foodLogs.orderBy('createdAt').reverse().limit(100).toArray().then((allLogs) => {
      const freq: Record<number, number> = {};
      allLogs.forEach((l) => {
        freq[l.recipeId] = (freq[l.recipeId] || 0) + 1;
      });
      const sorted = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => Number(id));
      setRecentRecipeIds(sorted);
    });
  }, [logs]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof logs> = { breakfast: [], lunch: [], dinner: [], snack: [] };
    logs.forEach((l) => map[l.mealType].push(l));
    return map;
  }, [logs]);

  const mealTotals = useMemo(() => {
    const t: Record<string, number> = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
    logs.forEach((l) => (t[l.mealType] += Math.round(l.calories * l.servings)));
    return t;
  }, [logs]);

  const dayTotal = Object.values(mealTotals).reduce((a, b) => a + b, 0);

  const handleSelect = (recipe: Recipe) => {
    addLog({
      date,
      mealType: activeMealType,
      recipeId: recipe.id!,
      recipeName: recipe.name,
      servings: 1,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
    });
    setSelectorOpen(false);
  };

  const handleQuickAdd = () => {
    if (!quickName.trim() || !quickCal || !quickMeal) return;
    const cal = Number(quickCal);
    const pro = Number(quickProtein) || 0;
    addLog({
      date,
      mealType: quickMeal as Recipe['mealType'],
      recipeId: -1,
      recipeName: quickName.trim(),
      servings: 1,
      calories: cal,
      protein: pro,
      carbs: 0,
      fat: 0,
    });
    setQuickMeal(null);
    setQuickName('');
    setQuickCal('');
    setQuickProtein('');
  };

  const changeDate = (offset: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + offset);
    setDate(d.toISOString().slice(0, 10));
  };

  const isToday = date === today;

  return (
    <div className="p-4 pt-6 max-w-lg mx-auto space-y-4">
      {/* Date Picker */}
      <div className="flex items-center justify-between">
        <button onClick={() => changeDate(-1)} className="btn-ghost text-lg px-2">
          ◀
        </button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800">
            {isToday ? '今天' : date}
          </h1>
          <p className="text-sm text-gray-400">{dayTotal} kcal</p>
        </div>
        <button
          onClick={() => changeDate(1)}
          className={`btn-ghost text-lg px-2 ${isToday ? 'invisible' : ''}`}
        >
          ▶
        </button>
      </div>

      {/* Meal Sections */}
      {MEAL_TYPES.map((meal) => {
        const config = MEAL_CONFIG[meal];
        const items = grouped[meal];
        return (
          <div key={meal} className={`card border ${config.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">
                {config.icon} {config.label}
              </h3>
              <span className="text-sm text-gray-500">{mealTotals[meal]} kcal</span>
            </div>

            {items.length === 0 && (
              <p className="text-sm text-gray-400 py-2">还没有记录</p>
            )}

            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-white/70 rounded-xl px-3 py-2.5"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{item.recipeName}</p>
                    <p className="text-xs text-gray-400">
                      {Math.round(item.calories * item.servings)} kcal · P{item.protein * item.servings}g
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() => {
                        if (item.servings > 0.5) updateServings(item.id!, item.servings - 0.5);
                      }}
                      className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 text-lg flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-sm font-semibold text-gray-700 w-8 text-center">
                      {item.servings}x
                    </span>
                    <button
                      onClick={() => updateServings(item.id!, item.servings + 0.5)}
                      className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 text-lg flex items-center justify-center"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeLog(item.id!)}
                      className="ml-1 text-gray-300 hover:text-red-400 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  setActiveMealType(meal);
                  setSelectorOpen(true);
                }}
                className="flex-1 py-2 text-sm text-primary-500 font-medium border border-dashed border-primary-300 rounded-xl hover:bg-primary-50 transition-colors"
              >
                📋 食谱选择
              </button>
              <button
                onClick={() => {
                  setQuickMeal(meal);
                  setQuickName('');
                  setQuickCal('');
                  setQuickProtein('');
                }}
                className="flex-1 py-2 text-sm text-gray-500 font-medium border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                ✏️ 快速记录
              </button>
            </div>

            {/* Quick Record Inline Form */}
            {quickMeal === meal && (
              <div className="mt-3 p-3 bg-white rounded-xl space-y-2">
                <input
                  autoFocus
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder="食物名称 (如: 公司食堂盒饭)"
                  className="input-field text-sm"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={quickCal}
                    onChange={(e) => setQuickCal(e.target.value)}
                    placeholder="热量 kcal"
                    className="input-field text-sm flex-1"
                  />
                  <input
                    type="number"
                    value={quickProtein}
                    onChange={(e) => setQuickProtein(e.target.value)}
                    placeholder="蛋白质 g (选填)"
                    className="input-field text-sm flex-1"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleQuickAdd}
                    className="flex-1 btn-primary text-sm py-2"
                  >
                    确认添加
                  </button>
                  <button
                    onClick={() => setQuickMeal(null)}
                    className="px-4 py-2 text-sm text-gray-400"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Food Selector Modal */}
      {selectorOpen && (
        <FoodSelector
          mealType={activeMealType}
          recentRecipeIds={recentRecipeIds}
          onSelect={handleSelect}
          onClose={() => setSelectorOpen(false)}
        />
      )}
    </div>
  );
}

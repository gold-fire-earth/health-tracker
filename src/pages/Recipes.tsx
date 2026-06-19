import { useState, useMemo } from 'react';
import { useRecipeStore } from '../stores/recipeStore';
import type { Recipe } from '../db/database';

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'breakfast', label: '🌅 早餐' },
  { key: 'lunch', label: '☀️ 午餐' },
  { key: 'dinner', label: '🌙 晚餐' },
  { key: 'snack', label: '🍎 加餐' },
] as const;

const EMPTY_FORM: Omit<Recipe, 'id'> = {
  name: '',
  mealType: 'lunch',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  servingSize: 100,
  servingUnit: 'g',
  isPreset: false,
};

export default function Recipes() {
  const recipes = useRecipeStore((s) => s.recipes);
  const add = useRecipeStore((s) => s.add);
  const update = useRecipeStore((s) => s.update);
  const remove = useRecipeStore((s) => s.remove);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

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
    }
    return list;
  }, [recipes, filter, search]);

  const openEdit = (r: Recipe) => {
    setEditingId(r.id!);
    setForm({
      name: r.name,
      mealType: r.mealType,
      calories: r.calories,
      protein: r.protein,
      carbs: r.carbs,
      fat: r.fat,
      servingSize: r.servingSize,
      servingUnit: r.servingUnit,
      isPreset: r.isPreset,
    });
    setShowForm(true);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      update(editingId, form);
    } else {
      add(form);
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (editingId) {
      remove(editingId);
      setShowForm(false);
    }
  };

  return (
    <div className="p-4 pt-6 max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">食谱库</h1>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="搜索食谱..."
        className="input-field"
      />

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
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

      {/* Count */}
      <p className="text-sm text-gray-400">{filtered.length} 个食谱</p>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-12">没有找到</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => openEdit(r)}
              className="card w-full text-left flex items-center justify-between active:bg-gray-50"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-700">{r.name}</p>
                  {r.isPreset && (
                    <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">预设</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {r.servingSize}{r.servingUnit}/份 · P{r.protein}g C{r.carbs}g F{r.fat}g
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-energy-500">{r.calories}</p>
                <p className="text-xs text-gray-400">kcal</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Add Button */}
      <button onClick={openAdd} className="btn-primary w-full flex items-center justify-center gap-2">
        <span>+</span> 新建食谱
      </button>

      {/* Recipe Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <button onClick={() => setShowForm(false)} className="text-gray-400 text-lg">✕</button>
            <h2 className="font-semibold text-gray-700">{editingId ? '编辑食谱' : '新建食谱'}</h2>
            <button onClick={handleSave} className="text-primary-500 font-semibold">保存</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Name */}
            <div>
              <label className="text-sm text-gray-500 block mb-1">名称</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                placeholder="例如：鸡胸肉沙拉"
              />
            </div>

            {/* Meal Type */}
            <div>
              <label className="text-sm text-gray-500 block mb-1">餐段</label>
              <div className="grid grid-cols-4 gap-2">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setForm({ ...form, mealType: m })}
                    className={`py-2 rounded-lg text-sm transition-colors ${
                      form.mealType === m
                        ? 'bg-primary-400 text-white font-medium'
                        : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    {{ breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' }[m]}
                  </button>
                ))}
              </div>
            </div>

            {/* Calories */}
            <div>
              <label className="text-sm text-gray-500 block mb-1">每份热量 (kcal)</label>
              <input
                type="number"
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })}
                className="input-field"
              />
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-gray-500 block mb-1">蛋白质 (g)</label>
                <input
                  type="number"
                  value={form.protein}
                  onChange={(e) => setForm({ ...form, protein: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">碳水 (g)</label>
                <input
                  type="number"
                  value={form.carbs}
                  onChange={(e) => setForm({ ...form, carbs: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">脂肪 (g)</label>
                <input
                  type="number"
                  value={form.fat}
                  onChange={(e) => setForm({ ...form, fat: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
            </div>

            {/* Serving */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-500 block mb-1">份量</label>
                <input
                  type="number"
                  value={form.servingSize}
                  onChange={(e) => setForm({ ...form, servingSize: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">单位</label>
                <select
                  value={form.servingUnit}
                  onChange={(e) => setForm({ ...form, servingUnit: e.target.value })}
                  className="input-field"
                >
                  <option value="g">克 (g)</option>
                  <option value="ml">毫升 (ml)</option>
                  <option value="个">个</option>
                  <option value="份">份</option>
                  <option value="碗">碗</option>
                  <option value="片">片</option>
                  <option value="根">根</option>
                </select>
              </div>
            </div>

            {/* Delete */}
            {editingId && !form.isPreset && (
              <button
                onClick={handleDelete}
                className="w-full py-3 text-red-400 font-medium border border-red-200 rounded-xl active:bg-red-50"
              >
                删除食谱
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useRecipeStore } from '../stores/recipeStore';
import { CATEGORY_LABELS, type Category, type Recipe } from '../db/database';

const MEAL_OPTIONS = [
  { key: 'all', label: '全部餐段' },
  { key: 'breakfast', label: '🌅 早餐' },
  { key: 'lunch', label: '☀️ 午餐' },
  { key: 'dinner', label: '🌙 晚餐' },
  { key: 'snack', label: '🍎 加餐' },
] as const;

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

const EMPTY_FORM: Omit<Recipe, 'id'> = {
  name: '',
  mealType: 'lunch',
  category: 'home-cooking',
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
  const [mealFilter, setMealFilter] = useState<string>('all');
  const [catFilter, setCatFilter] = useState<Category | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const filtered = useMemo(() => {
    let list = recipes;
    if (mealFilter !== 'all') {
      list = list.filter((r) => r.mealType === mealFilter);
    }
    if (catFilter !== 'all') {
      list = list.filter((r) => r.category === catFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q));
    }
    return list;
  }, [recipes, mealFilter, catFilter, search]);

  const openEdit = (r: Recipe) => {
    setEditingId(r.id!);
    setForm({
      name: r.name,
      mealType: r.mealType,
      category: r.category,
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

      {/* Filters: two dropdowns side by side */}
      <div className="grid grid-cols-2 gap-2">
        <select
          value={mealFilter}
          onChange={(e) => setMealFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            paddingRight: '32px',
          }}
        >
          {MEAL_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value as Category | 'all')}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            paddingRight: '32px',
          }}
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
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
                  {r.servingSize}{r.servingUnit}/份 · {CATEGORY_LABELS[r.category] || r.category} · P{r.protein}g C{r.carbs}g F{r.fat}g
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

            {/* Category */}
            <div>
              <label className="text-sm text-gray-500 block mb-1">类别</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                className="input-field"
              >
                {CATEGORY_OPTIONS.filter((o) => o.key !== 'all').map((opt) => (
                  <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
              </select>
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

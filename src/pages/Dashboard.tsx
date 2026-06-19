import { useEffect, useMemo, useState } from 'react';
import { useGoalStore } from '../stores/goalStore';
import { useFoodLogStore } from '../stores/foodLogStore';
import { useActivityLogStore } from '../stores/activityLogStore';
import { CalorieRing } from '../components/CalorieRing';
import { MacroBar } from '../components/MacroBar';

const MEAL_LABELS: Record<string, string> = {
  breakfast: '🌅 早餐',
  lunch: '☀️ 午餐',
  dinner: '🌙 晚餐',
  snack: '🍎 加餐',
};

export default function Dashboard({ onGoToFood }: { onGoToFood: () => void }) {
  const profile = useGoalStore((s) => s.profile);
  const todayTarget = useGoalStore((s) => s.todayTarget);
  const loadFoodLogs = useFoodLogStore((s) => s.loadByDate);
  const foodLogs = useFoodLogStore((s) => s.logs);
  const loadActivityLogs = useActivityLogStore((s) => s.loadByDate);
  const activityLogs = useActivityLogStore((s) => s.logs);

  const today = new Date().toISOString().slice(0, 10);
  const [date] = useState(today);

  useEffect(() => {
    loadFoodLogs(date);
    loadActivityLogs(date);
  }, [date]);

  const totals = useMemo(() => {
    const foodTotal = foodLogs.reduce(
      (acc, l) => ({
        calories: acc.calories + l.calories * l.servings,
        protein: acc.protein + l.protein * l.servings,
        carbs: acc.carbs + l.carbs * l.servings,
        fat: acc.fat + l.fat * l.servings,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
    const activityTotal = activityLogs.reduce((acc, l) => acc + l.caloriesBurned, 0);
    return { ...foodTotal, activityTotal };
  }, [foodLogs, activityLogs]);

  const mealTotals = useMemo(() => {
    const map: Record<string, number> = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
    foodLogs.forEach((l) => {
      map[l.mealType] = (map[l.mealType] || 0) + l.calories * l.servings;
    });
    return map;
  }, [foodLogs]);

  const target = todayTarget?.calorieTarget || 2000;
  const progress = Math.min((totals.calories / target) * 100, 150);

  if (!profile) {
    return (
      <div className="p-4 pt-8 max-w-lg mx-auto">
        <div className="card text-center py-12">
          <p className="text-5xl mb-4">👋</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">欢迎使用 Health Tracker</h2>
          <p className="text-gray-500 mb-6">先设置你的身体数据，开始科学管理身材吧</p>
          <p className="text-sm text-gray-400">点击底部「我」开始设置</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-6 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">今日总览</h1>
          <p className="text-sm text-gray-400">{today}</p>
        </div>
        <div className="bg-primary-100 text-primary-700 text-sm font-medium px-3 py-1 rounded-full">
          {profile.goal === 'lose' ? '🎯 减脂中' : profile.goal === 'gain' ? '💪 增肌中' : '⚖️ 保持中'}
        </div>
      </div>

      {/* Calorie Ring */}
      <div className="card flex flex-col items-center py-6">
        <CalorieRing
          consumed={totals.calories}
          burned={totals.activityTotal}
          target={target}
          progress={progress}
        />
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="text-center">
            <p className="text-gray-400">已摄入</p>
            <p className="text-xl font-bold text-energy-500">{Math.round(totals.calories)}</p>
            <p className="text-xs text-gray-400">kcal</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400">运动消耗</p>
            <p className="text-xl font-bold text-primary-500">{Math.round(totals.activityTotal)}</p>
            <p className="text-xs text-gray-400">kcal</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400">还可摄入</p>
            <p className="text-xl font-bold text-gray-700">
              {Math.max(0, Math.round(target - totals.calories + totals.activityTotal))}
            </p>
            <p className="text-xs text-gray-400">kcal</p>
          </div>
        </div>
      </div>

      {/* Macros */}
      {todayTarget && (
        <div className="card space-y-3">
          <h3 className="font-semibold text-gray-700">宏量营养素</h3>
          <MacroBar
            label="蛋白质"
            current={Math.round(totals.protein)}
            target={todayTarget.proteinTarget}
            unit="g"
            color="bg-blue-400"
          />
          <MacroBar
            label="碳水"
            current={Math.round(totals.carbs)}
            target={todayTarget.carbsTarget}
            unit="g"
            color="bg-amber-400"
          />
          <MacroBar
            label="脂肪"
            current={Math.round(totals.fat)}
            target={todayTarget.fatTarget}
            unit="g"
            color="bg-pink-400"
          />
        </div>
      )}

      {/* Meal Summary */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-3">各餐热量</h3>
        <div className="space-y-2">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((meal) => (
            <div key={meal} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-gray-600">{MEAL_LABELS[meal]}</span>
              <span className="text-sm font-semibold text-gray-700">
                {Math.round(mealTotals[meal])} kcal
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={onGoToFood}
          className="btn-primary w-full mt-4 text-center flex items-center justify-center gap-2"
        >
          <span>+</span> 记录饮食
        </button>
      </div>

      {/* Activity Summary */}
      {activityLogs.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-2">今日运动</h3>
          <div className="space-y-2">
            {activityLogs.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{a.activityType}</span>
                <span className="text-gray-400">{a.duration}分钟 · {a.caloriesBurned} kcal</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

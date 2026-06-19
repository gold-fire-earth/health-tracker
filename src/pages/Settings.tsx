import { useState, useEffect } from 'react';
import { useGoalStore } from '../stores/goalStore';
import {
  calcBMR,
  calcTDEE,
  calcMacroTargets,
  ACTIVITY_LEVEL_LABELS,
  GOAL_LABELS,
} from '../utils/tdee';
import type { UserProfile } from '../db/database';

const EMPTY: Omit<UserProfile, 'id'> = {
  height: 170,
  weight: 70,
  age: 25,
  gender: 'male',
  activityLevel: 2,
  goal: 'lose',
};

export default function Settings() {
  const profile = useGoalStore((s) => s.profile);
  const todayTarget = useGoalStore((s) => s.todayTarget);
  const saveProfile = useGoalStore((s) => s.saveProfile);

  const [form, setForm] = useState(profile ? { ...profile } : { ...EMPTY });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) setForm({ ...profile });
  }, [profile]);

  const computed = profile ? calcMacroTargets(profile) : null;
  const bmr = profile ? calcBMR(profile) : 0;
  const tdee = profile ? calcTDEE(profile) : 0;

  const handleSave = () => {
    saveProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 pt-6 max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">个人设置</h1>

      {/* Body Info */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-gray-700">身体数据</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-500 block mb-1">性别</label>
            <div className="flex gap-2">
              <button
                onClick={() => setForm({ ...form, gender: 'male' })}
                className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                  form.gender === 'male' ? 'bg-blue-400 text-white' : 'bg-gray-50 text-gray-500'
                }`}
              >
                男
              </button>
              <button
                onClick={() => setForm({ ...form, gender: 'female' })}
                className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                  form.gender === 'female' ? 'bg-pink-400 text-white' : 'bg-gray-50 text-gray-500'
                }`}
              >
                女
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">年龄</label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
              className="input-field"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-500 block mb-1">身高 (cm)</label>
            <input
              type="number"
              value={form.height}
              onChange={(e) => setForm({ ...form, height: Number(e.target.value) })}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">体重 (kg)</label>
            <input
              type="number"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
              className="input-field"
            />
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="text-sm text-gray-500 block mb-2">活动水平</label>
          <div className="space-y-1.5">
            {([1, 2, 3, 4, 5] as const).map((level) => (
              <button
                key={level}
                onClick={() => setForm({ ...form, activityLevel: level })}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  form.activityLevel === level
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'bg-gray-50 text-gray-500'
                }`}
              >
                {ACTIVITY_LEVEL_LABELS[level]}
              </button>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div>
          <label className="text-sm text-gray-500 block mb-2">目标</label>
          <div className="grid grid-cols-3 gap-2">
            {(['lose', 'maintain', 'gain'] as const).map((goal) => (
              <button
                key={goal}
                onClick={() => setForm({ ...form, goal })}
                className={`py-2.5 rounded-xl text-sm transition-colors ${
                  form.goal === goal
                    ? 'bg-primary-400 text-white font-medium'
                    : 'bg-gray-50 text-gray-500'
                }`}
              >
                {GOAL_LABELS[goal]}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`btn-primary w-full text-center ${saved ? 'bg-green-400' : ''}`}
        >
          {saved ? '✓ 已保存' : '保存设置'}
        </button>
      </div>

      {/* TDEE Display */}
      {profile && computed && (
        <div className="card space-y-3">
          <h3 className="font-semibold text-gray-700">每日能量分析</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">基础代谢</p>
              <p className="text-lg font-bold text-gray-700">{bmr}</p>
              <p className="text-xs text-gray-400">kcal/天</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">TDEE</p>
              <p className="text-lg font-bold text-gray-700">{tdee}</p>
              <p className="text-xs text-gray-400">kcal/天</p>
            </div>
            <div className="bg-primary-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">每日目标</p>
              <p className="text-lg font-bold text-primary-600">{computed.calorieTarget}</p>
              <p className="text-xs text-gray-400">kcal/天</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-sm text-gray-500 mb-2">宏量营养素目标</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-blue-500">{computed.proteinTarget}g</p>
                <p className="text-xs text-gray-400">蛋白质</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-amber-500">{computed.carbsTarget}g</p>
                <p className="text-xs text-gray-400">碳水</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-pink-500">{computed.fatTarget}g</p>
                <p className="text-xs text-gray-400">脂肪</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <p className="text-center text-xs text-gray-400 pb-4">
        数据仅存储在你的设备本地 · v1.0
      </p>
    </div>
  );
}

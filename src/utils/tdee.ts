import type { UserProfile } from '../db/database';

const ACTIVITY_MULTIPLIERS: Record<number, number> = {
  1: 1.2,   // sedentary
  2: 1.375, // light
  3: 1.55,  // moderate
  4: 1.725, // active
  5: 1.9,   // very active
};

const GOAL_ADJUSTMENTS: Record<string, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

const MACRO_RATIOS: Record<string, { protein: number; carbs: number; fat: number }> = {
  lose:    { protein: 0.40, carbs: 0.30, fat: 0.30 },
  maintain:{ protein: 0.30, carbs: 0.40, fat: 0.30 },
  gain:    { protein: 0.35, carbs: 0.35, fat: 0.30 },
};

export function calcBMR(p: UserProfile): number {
  if (p.gender === 'male') {
    return 10 * p.weight + 6.25 * p.height - 5 * p.age + 5;
  }
  return 10 * p.weight + 6.25 * p.height - 5 * p.age - 161;
}

export function calcTDEE(p: UserProfile): number {
  return Math.round(calcBMR(p) * ACTIVITY_MULTIPLIERS[p.activityLevel]);
}

export function calcCalorieTarget(p: UserProfile): number {
  return calcTDEE(p) + GOAL_ADJUSTMENTS[p.goal];
}

export function calcMacroTargets(p: UserProfile) {
  const calories = calcCalorieTarget(p);
  const ratio = MACRO_RATIOS[p.goal];
  return {
    calorieTarget: calories,
    proteinTarget: Math.round((calories * ratio.protein) / 4),
    carbsTarget: Math.round((calories * ratio.carbs) / 4),
    fatTarget: Math.round((calories * ratio.fat) / 9),
  };
}

export function calcActivityCalories(met: number, weightKg: number, durationMin: number): number {
  return Math.round(met * weightKg * (durationMin / 60));
}

export const ACTIVITY_LEVEL_LABELS: Record<number, string> = {
  1: '久坐 (几乎不运动)',
  2: '轻度 (每周1-2次)',
  3: '中度 (每周3-5次)',
  4: '活跃 (每周6-7次)',
  5: '高强度 (每天高强度训练)',
};

export const GOAL_LABELS: Record<string, string> = {
  lose: '减脂',
  maintain: '保持',
  gain: '增肌',
};

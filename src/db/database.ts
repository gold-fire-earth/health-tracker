import Dexie, { Table } from 'dexie';

export interface Recipe {
  id?: number;
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
  isPreset: boolean;
}

export interface FoodLog {
  id?: number;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId: number;
  recipeName: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: number;
}

export interface ActivityLog {
  id?: number;
  date: string;
  activityType: string;
  duration: number;
  caloriesBurned: number;
  note: string;
  createdAt: number;
}

export interface UserProfile {
  id?: number;
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: 1 | 2 | 3 | 4 | 5;
  goal: 'lose' | 'maintain' | 'gain';
}

export interface DailyTarget {
  id?: number;
  date: string;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
}

class HealthDB extends Dexie {
  recipes!: Table<Recipe, number>;
  foodLogs!: Table<FoodLog, number>;
  activityLogs!: Table<ActivityLog, number>;
  userProfile!: Table<UserProfile, number>;
  dailyTargets!: Table<DailyTarget, number>;

  constructor() {
    super('HealthTrackerDB');
    this.version(1).stores({
      recipes: '++id, mealType, name, isPreset',
      foodLogs: '++id, date, mealType, [date+mealType]',
      activityLogs: '++id, date',
      userProfile: '++id',
      dailyTargets: '++id, date',
    });
  }
}

export const db = new HealthDB();

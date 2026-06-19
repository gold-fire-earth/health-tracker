import { useState, useEffect } from 'react';
import { useRecipeStore } from './stores/recipeStore';
import { useGoalStore } from './stores/goalStore';
import Dashboard from './pages/Dashboard';
import FoodLog from './pages/FoodLog';
import Activity from './pages/Activity';
import Recipes from './pages/Recipes';
import Settings from './pages/Settings';

const TABS = [
  { key: 'dashboard', label: '总览', icon: '📊' },
  { key: 'food', label: '饮食', icon: '🍽️' },
  { key: 'activity', label: '运动', icon: '⚡' },
  { key: 'recipes', label: '食谱', icon: '📖' },
  { key: 'settings', label: '我', icon: '👤' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function App() {
  const [tab, setTab] = useState<TabKey>('dashboard');
  const loadRecipes = useRecipeStore((s) => s.load);
  const loadGoals = useGoalStore((s) => s.load);
  const loading = useRecipeStore((s) => s.loading);
  const goalLoading = useGoalStore((s) => s.loading);

  useEffect(() => {
    loadRecipes();
    loadGoals();
  }, []);

  if (loading || goalLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🥗</div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 pb-20">
      <div className="page-enter">
        {tab === 'dashboard' && <Dashboard onGoToFood={() => setTab('food')} />}
        {tab === 'food' && <FoodLog />}
        {tab === 'activity' && <Activity />}
        {tab === 'recipes' && <Recipes />}
        {tab === 'settings' && <Settings />}
      </div>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors ${
                tab === t.key ? 'text-primary-500' : 'text-gray-400'
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

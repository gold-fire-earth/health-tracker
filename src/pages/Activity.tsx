import { useEffect, useState, useMemo } from 'react';
import { useActivityLogStore } from '../stores/activityLogStore';
import { useGoalStore } from '../stores/goalStore';
import presetActivities from '../data/presetActivities';
import { calcActivityCalories } from '../utils/tdee';

export default function Activity() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [duration, setDuration] = useState(30);
  const [manualCalories, setManualCalories] = useState(false);
  const [calories, setCalories] = useState(0);
  const [note, setNote] = useState('');

  const logs = useActivityLogStore((s) => s.logs);
  const loadByDate = useActivityLogStore((s) => s.loadByDate);
  const addLog = useActivityLogStore((s) => s.add);
  const removeLog = useActivityLogStore((s) => s.remove);
  const profile = useGoalStore((s) => s.profile);

  useEffect(() => {
    loadByDate(date);
  }, [date]);

  const totalBurned = useMemo(() => logs.reduce((acc, l) => acc + l.caloriesBurned, 0), [logs]);

  const selectedPreset = presetActivities.find((a) => a.type === selectedType);

  const computedCalories = useMemo(() => {
    if (manualCalories) return calories;
    if (selectedPreset && profile) {
      return calcActivityCalories(selectedPreset.met, profile.weight, duration);
    }
    return 0;
  }, [manualCalories, calories, selectedPreset, profile, duration]);

  const handleSubmit = () => {
    if (!selectedType) return;
    const preset = presetActivities.find((a) => a.type === selectedType);
    if (!preset) return;
    addLog({
      date,
      activityType: preset.label,
      duration: manualCalories ? 0 : duration,
      caloriesBurned: computedCalories,
      note,
    });
    setShowForm(false);
    setSelectedType('');
    setDuration(30);
    setCalories(0);
    setManualCalories(false);
    setNote('');
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
        <button onClick={() => changeDate(-1)} className="btn-ghost text-lg px-2">◀</button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800">{isToday ? '今天' : date}</h1>
          <p className="text-sm text-gray-400">消耗 {totalBurned} kcal</p>
        </div>
        <button onClick={() => changeDate(1)} className={`btn-ghost text-lg px-2 ${isToday ? 'invisible' : ''}`}>▶</button>
      </div>

      {/* Activity List */}
      {logs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-5xl mb-4">⚡</p>
          <p className="text-gray-500">今天还没有运动记录</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((l) => (
            <div key={l.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">{l.activityType}</p>
                <p className="text-xs text-gray-400">
                  {l.duration > 0 ? `${l.duration} 分钟` : '手动输入'}
                  {l.note && ` · ${l.note}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary-500">{l.caloriesBurned} kcal</span>
                <button onClick={() => removeLog(l.id!)} className="text-gray-300 hover:text-red-400 text-sm">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Button */}
      <button onClick={() => setShowForm(true)} className="btn-primary w-full flex items-center justify-center gap-2">
        <span>+</span> 记录运动
      </button>

      {/* Add Activity Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <button onClick={() => setShowForm(false)} className="text-gray-400 text-lg">✕</button>
            <h2 className="font-semibold text-gray-700">记录运动</h2>
            <button onClick={handleSubmit} className="text-primary-500 font-semibold" disabled={!selectedType}>
              保存
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Activity Type Grid */}
            <div>
              <p className="text-sm text-gray-500 mb-3">运动类型</p>
              <div className="grid grid-cols-3 gap-2">
                {presetActivities.map((a) => (
                  <button
                    key={a.type}
                    onClick={() => setSelectedType(a.type)}
                    className={`p-3 rounded-xl text-center transition-all ${
                      selectedType === a.type
                        ? 'bg-primary-400 text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <p className="text-2xl">{a.icon}</p>
                    <p className="text-xs mt-1">{a.label.split(' ')[0]}</p>
                  </button>
                ))}
              </div>
            </div>

            {selectedType && (
              <>
                {/* Duration or Manual Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setManualCalories(false)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      !manualCalories ? 'bg-primary-100 text-primary-700' : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    按时长计算
                  </button>
                  <button
                    onClick={() => setManualCalories(true)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      manualCalories ? 'bg-primary-100 text-primary-700' : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    手动输入热量
                  </button>
                </div>

                {!manualCalories ? (
                  <div>
                    <label className="text-sm text-gray-500 block mb-2">时长 (分钟)</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setDuration(Math.max(5, duration - 5))} className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 text-lg">-</button>
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
                        className="input-field text-center text-xl font-bold flex-1"
                      />
                      <button onClick={() => setDuration(duration + 5)} className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 text-lg">+</button>
                    </div>
                    <p className="text-center text-sm text-gray-400 mt-2">
                      预计消耗 <span className="font-bold text-primary-500">{computedCalories}</span> kcal
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm text-gray-500 block mb-2">消耗热量 (kcal)</label>
                    <input
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(Number(e.target.value))}
                      className="input-field text-center text-xl font-bold"
                      placeholder="输入热量"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-500 block mb-2">备注 (可选)</label>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="input-field"
                    placeholder="例如：户外跑、健身房..."
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

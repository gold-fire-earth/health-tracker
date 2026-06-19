interface Props {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

export function MacroBar({ label, current, target, unit, color }: Props) {
  const pct = Math.min((current / target) * 100, 100);

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-500">
          <span className="font-semibold text-gray-700">{current}</span>
          <span className="text-gray-400"> / {target} {unit}</span>
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

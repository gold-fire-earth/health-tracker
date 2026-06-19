interface Props {
  consumed: number;
  burned: number;
  target: number;
  progress: number;
}

export function CalorieRing({ consumed, burned, target, progress }: Props) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(progress, 100);
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  const ringColor = progress > 100 ? '#FB923C' : '#4ADE80';
  const textColor = progress > 100 ? 'text-energy-500' : 'text-primary-500';

  return (
    <div className="relative flex items-center justify-center">
      <svg width="220" height="220" viewBox="0 0 220 220">
        {/* Background ring */}
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="14"
        />
        {/* Progress ring */}
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 110 110)"
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className={`text-3xl font-extrabold ${textColor}`}>
          {Math.round(clampedProgress)}%
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {Math.round(consumed)} / {target}
        </p>
        <p className="text-xs text-gray-400">kcal</p>
      </div>
    </div>
  );
}

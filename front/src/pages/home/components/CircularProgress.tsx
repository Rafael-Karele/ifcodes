interface CircularProgressProps {
  percentage: number;
  label: string;
}

export function CircularProgress({ percentage, label }: CircularProgressProps) {
  const size = 36;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const center = size / 2;

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xl sm:text-3xl font-bold tabular-nums tracking-tight text-stone-900">
          {Math.round(percentage)}%
        </div>
        <p className="text-xs sm:text-sm mt-0.5 sm:mt-1 font-medium text-stone-500">
          {label}
        </p>
      </div>
      <svg
        width={size}
        height={size}
        className="circular-progress -rotate-90 shrink-0"
        style={{ ["--cp-offset" as string]: offset }}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e7e5e4"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#0d9488"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="circular-progress-ring"
        />
      </svg>
    </div>
  );
}

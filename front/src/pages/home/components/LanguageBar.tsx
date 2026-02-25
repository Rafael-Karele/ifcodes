export interface LanguageStat {
  language: string;
  count: number;
  percentage: number;
  color: string;
}

interface LanguageBarProps {
  stats: LanguageStat[];
}

export function LanguageBar({ stats }: LanguageBarProps) {
  if (stats.length === 0) {
    return (
      <div className="text-sm text-stone-400 text-center py-6">
        Nenhuma submissão ainda
      </div>
    );
  }

  return (
    <div>
      {/* Stacked bar */}
      <div className="flex h-5 rounded-full overflow-hidden">
        {stats.map((s) => (
          <div
            key={s.language}
            className="h-full transition-all duration-500"
            style={{ width: `${s.percentage}%`, backgroundColor: s.color }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
        {stats.map((s) => (
          <div key={s.language} className="flex items-center gap-1.5 text-xs text-stone-600">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: s.color }} />
            <span className="font-medium">{s.language}</span>
            <span className="text-stone-400">{Math.round(s.percentage)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

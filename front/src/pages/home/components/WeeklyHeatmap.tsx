import { Flame } from "lucide-react";

export interface HeatmapCell {
  date: Date;
  count: number;
}

interface WeeklyHeatmapProps {
  cells: HeatmapCell[];
  streak: number;
}

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function cellColor(count: number): string {
  if (count === 0) return "bg-stone-100";
  if (count <= 2) return "bg-teal-200";
  if (count <= 4) return "bg-teal-400";
  return "bg-teal-600";
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function WeeklyHeatmap({ cells, streak }: WeeklyHeatmapProps) {
  const today = new Date();

  // cells is 28 entries ordered by date asc (Mon wk-3 → Sun wk0)
  // Layout: 7 columns (Mon-Sun) x 4 rows (weeks, oldest on top)
  // cells[0..6] = week -3, cells[7..13] = week -2, etc.
  const weeks = [
    cells.slice(0, 7),
    cells.slice(7, 14),
    cells.slice(14, 21),
    cells.slice(21, 28),
  ];

  return (
    <div className="rounded-xl border border-stone-200 bg-white px-3 py-3 sm:px-5 sm:py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Atividade Semanal</h3>
        {streak > 0 && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${streak >= 3 ? "text-orange-500" : "text-stone-400"}`}>
            <Flame className="w-3.5 h-3.5" />
            {streak} {streak === 1 ? "dia" : "dias"} seguidos
          </div>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Day labels */}
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-[10px] text-stone-400 text-center font-medium pb-1">
            {d}
          </div>
        ))}

        {/* Cells */}
        {weeks.map((week, wi) =>
          week.map((cell, di) => {
            const isToday = isSameDay(cell.date, today);
            const isFuture = cell.date > today && !isToday;

            return (
              <div
                key={`${wi}-${di}`}
                className={`h-4 rounded-sm heatmap-cell ${
                  isFuture
                    ? "border border-dashed border-stone-300 bg-transparent"
                    : cellColor(cell.count)
                } ${isToday ? "ring-2 ring-teal-500 ring-offset-1" : ""}`}
                style={{ animationDelay: `${(wi * 7 + di) * 10}ms` }}
                title={`${cell.date.toLocaleDateString("pt-BR")} — ${cell.count} submissões`}
              />
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-stone-400">
        <span>Menos</span>
        <div className="w-2.5 h-2.5 rounded-sm bg-stone-100" />
        <div className="w-2.5 h-2.5 rounded-sm bg-teal-200" />
        <div className="w-2.5 h-2.5 rounded-sm bg-teal-400" />
        <div className="w-2.5 h-2.5 rounded-sm bg-teal-600" />
        <span>Mais</span>
      </div>
    </div>
  );
}

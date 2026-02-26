import { ArrowRight } from "lucide-react";
import type { Activity } from "@/types";
import { StatusBadge, activityStatusConfig, type ActivityStatusKey } from "./StatusBadge";

/* ── helpers ─────────────────────────────────────────── */

function getDaysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  const now = new Date();
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDueDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRelativeLabel(dateStr: string): { text: string; tone: "overdue" | "urgent" | "normal" } {
  const days = getDaysUntil(dateStr);
  if (days < 0) return { text: `${Math.abs(days)}d em atraso`, tone: "overdue" };
  if (days === 0) return { text: "Vence hoje", tone: "urgent" };
  if (days === 1) return { text: "Vence amanhã", tone: "urgent" };
  if (days <= 3) return { text: `Vence em ${days} dias`, tone: "urgent" };
  return { text: `Vence em ${days} dias`, tone: "normal" };
}

/* ── component ───────────────────────────────────────── */

interface ActivityCardProps {
  activity: Activity;
  problemTitle: string;
  problemPreview?: string;
  onClick: () => void;
  index: number;
}

export function ActivityCard({ activity, problemTitle, problemPreview, onClick, index }: ActivityCardProps) {
  const isCompleted = activity.status === "completed";
  const rel = getRelativeLabel(activity.dueDate);
  const dueDateStr = formatDueDate(activity.dueDate);

  const statusBarColor =
    isCompleted
      ? "bg-emerald-500"
      : rel.tone === "overdue"
        ? "bg-red-500"
        : rel.tone === "urgent"
          ? "bg-amber-500"
          : (activityStatusConfig[activity.status as ActivityStatusKey]?.barColor || "bg-stone-300");

  return (
    <button
      onClick={onClick}
      className="group relative w-full text-left bg-white border border-stone-200 rounded-xl px-5 py-4 hover:border-stone-300 hover:shadow-sm transition-all duration-150 overflow-hidden"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* left accent bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full ${statusBarColor}`} />

      <div className="flex items-center justify-between gap-4 pl-2">
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium truncate ${isCompleted ? "text-stone-400 line-through" : "text-stone-800"}`}>
            {problemTitle}
          </p>
          {problemPreview && !isCompleted && (
            <p className="text-xs text-stone-400 truncate mt-0.5">{problemPreview}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
            <span className="text-xs text-stone-400">{dueDateStr}</span>
            {!isCompleted && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                  rel.tone === "overdue"
                    ? "bg-red-100 text-red-700"
                    : rel.tone === "urgent"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-stone-100 text-stone-500"
                }`}
              >
                {rel.text}
              </span>
            )}
            {isCompleted && (
              <StatusBadge label="Concluida" className="bg-emerald-50 text-emerald-600" />
            )}
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </button>
  );
}

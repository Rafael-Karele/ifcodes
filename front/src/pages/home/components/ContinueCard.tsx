import { useNavigate } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ArrowRight, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Activity } from "@/types";

interface ContinueCardProps {
  activity: Activity;
  problemTitle: string;
}

export function ContinueCard({ activity, problemTitle }: ContinueCardProps) {
  const navigate = useNavigate();
  const due = new Date(activity.dueDate);
  const isOverdue = due < new Date();

  return (
    <div
      className={`rounded-xl border px-4 py-3 sm:px-6 sm:py-5 flex items-center gap-3 sm:gap-4 ${
        isOverdue
          ? "bg-red-50/60 border-red-200/80"
          : "bg-amber-50/60 border-amber-200/80"
      }`}
    >
      <div className={`p-2 sm:p-2.5 rounded-lg shrink-0 ${isOverdue ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
        {isOverdue ? <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" /> : <Clock className="w-4 h-4 sm:w-5 sm:h-5" />}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold uppercase tracking-wide ${isOverdue ? "text-red-500" : "text-amber-600"}`}>
          {isOverdue ? "Atrasada" : "Próximo prazo"}
        </p>
        <p className="text-sm font-semibold text-stone-800 truncate">{problemTitle}</p>
        <p className={`text-xs ${isOverdue ? "text-red-500" : "text-amber-600"}`}>
          {isOverdue ? "Venceu " : "Vence "}
          {formatDistanceToNow(due, { addSuffix: true, locale: ptBR })}
        </p>
      </div>

      <Button
        size="sm"
        onClick={() => navigate(`/activities/${activity.id}`)}
        className={`hidden sm:flex min-h-[44px] rounded-xl shadow-none font-semibold shrink-0 ${
          isOverdue
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-amber-500 hover:bg-amber-600 text-white"
        }`}
      >
        Continuar
        <ArrowRight className="w-4 h-4 ml-1" />
      </Button>

      <button
        onClick={() => navigate(`/activities/${activity.id}`)}
        className={`sm:hidden p-2 rounded-lg shrink-0 ${
          isOverdue
            ? "bg-red-600 text-white"
            : "bg-amber-500 text-white"
        }`}
      >
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

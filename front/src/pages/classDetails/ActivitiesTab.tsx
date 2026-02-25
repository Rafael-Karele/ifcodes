import type { Activity, Problem } from "@/types";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Eye,
  FileText,
  Clock,
  HardDrive,
  Calendar,
  Terminal,
  Settings2,
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

interface ActivitiesTabProps {
  activities: Activity[];
  allProblems: Problem[];
  openMenuId: number | null;
  onNewActivity: () => void;
  onViewActivity: (activity: Activity) => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (activity: Activity) => void;
  onViewSubmissions: (activity: Activity) => void;
  onToggleMenu: (activityId: number) => void;
}

const stripColours = [
  "linear-gradient(90deg, #14b8a6, #34d399)",
  "linear-gradient(90deg, #f59e0b, #fb923c)",
  "linear-gradient(90deg, #38bdf8, #22d3ee)",
  "linear-gradient(90deg, #fb7185, #f472b6)",
  "linear-gradient(90deg, #a78bfa, #c084fc)",
  "linear-gradient(90deg, #a3e635, #4ade80)",
];

const statusConfig = {
  overdue: { label: "Atrasada", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  pending: { label: "Pendente", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  completed: { label: "Concluída", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
};

function getStatus(activity: Activity): "overdue" | "pending" | "completed" {
  if (activity.status === "completed") return "completed";
  return new Date(activity.dueDate) < new Date() ? "overdue" : "pending";
}

function hasAdvancedConfig(a: Activity): boolean {
  return !!(a.compilerOptions || a.commandLineArguments || a.redirectStderrToStdout ||
    a.wallTimeLimit != null || a.stackLimit != null || a.maxFileSize != null || a.maxProcessesAndOrThreads != null);
}

export default function ActivitiesTab({
  activities, allProblems, openMenuId,
  onNewActivity, onViewActivity, onEditActivity, onDeleteActivity, onViewSubmissions, onToggleMenu,
}: ActivitiesTabProps) {
  const { hasAnyRole } = useUserRole();
  const isProfessor = hasAnyRole(["professor", "admin"]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
      <style>{`
        @keyframes activities-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-stone-800">Atividades da Turma</h2>
        {isProfessor && (
          <Button onClick={onNewActivity}
            className="text-white rounded-xl hover:opacity-90 font-semibold transition-opacity h-11 px-6"
            style={{ backgroundColor: "#0d9488" }}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Atividade
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: "#ccfbf1" }}>
              <BookOpen className="w-7 h-7" style={{ color: "#0d9488" }} />
            </div>
            <p className="text-sm font-medium text-stone-600">Nenhuma atividade cadastrada</p>
            <p className="text-xs text-stone-400 mt-1">Crie a primeira atividade para esta turma</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const problem = allProblems.find((p) => p.id === activity.problemId);
            const status = getStatus(activity);
            const cfg = statusConfig[status];
            const dueDate = new Date(activity.dueDate);
            const advanced = hasAdvancedConfig(activity);

            return (
              <div
                key={activity.id}
                className="group bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                style={{ animation: "activities-fade-up 0.5s cubic-bezier(.22,1,.36,1) both", animationDelay: `${index * 60}ms` }}
              >
                <div className="h-1.5" style={{ background: stripColours[index % stripColours.length] }} />

                <div className="px-5 py-3.5 flex items-center gap-4">
                  {/* Left: info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-[1.05rem] font-bold text-stone-800 truncate">
                        {problem?.title || "Atividade"}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 mt-1.5 text-xs text-stone-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {dueDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} às{" "}
                        {dueDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.tempoLimite ?? problem?.timeLimitMs ?? "—"} ms
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {activity.memoriaLimite ?? problem?.memoryLimitKb ?? "—"} KB
                      </span>
                      {activity.compilerOptions && (
                        <span className="inline-flex items-center gap-1 font-mono text-stone-600">
                          <Terminal className="w-3 h-3" />
                          {activity.compilerOptions}
                        </span>
                      )}
                      {advanced && (
                        <span className="inline-flex items-center gap-1 text-teal-600">
                          <Settings2 className="w-3 h-3" />
                          Avançado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onViewActivity(activity); }}
                      className="rounded-lg p-1.5 text-stone-400 hover:text-teal-600 hover:bg-teal-50 transition-colors" title="Ver Problema">
                      <Eye className="w-4 h-4" />
                    </button>
                    {isProfessor && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); onViewSubmissions(activity); }}
                          className="rounded-lg p-1.5 text-stone-400 hover:text-teal-600 hover:bg-teal-50 transition-colors" title="Ver Submissões">
                          <FileText className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onEditActivity(activity); }}
                          className="rounded-lg p-1.5 text-stone-400 hover:text-teal-600 hover:bg-teal-50 transition-colors" title="Editar">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteActivity(activity); }}
                          className="rounded-lg p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Apagar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

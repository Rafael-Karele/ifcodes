import type { Activity, Problem } from "@/types";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, MoreVertical, Pencil, Trash2, Eye, FileText } from "lucide-react";
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

export default function ActivitiesTab({
  activities,
  allProblems,
  openMenuId,
  onNewActivity,
  onViewActivity,
  onEditActivity,
  onDeleteActivity,
  onViewSubmissions,
  onToggleMenu,
}: ActivitiesTabProps) {
  const { hasAnyRole } = useUserRole();

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-stone-800">Atividades da Turma</h2>
        {hasAnyRole(["professor", "admin"]) && (
          <Button onClick={onNewActivity}
            className="text-white rounded-xl hover:opacity-90 font-semibold transition-opacity h-11 px-6" style={{ backgroundColor: "#0d9488" }}>
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
          activities.map((activity) => {
            const dueDate = new Date(activity.dueDate);
            const now = new Date();
            const isOverdue = dueDate < now;
            const isPending = !isOverdue;
            const problem = allProblems.find(p => p.id === activity.problemId);

            return (
              <div
                key={activity.id}
                className={`p-4 pb-14 rounded-xl border-l-4 transition-all hover:shadow-md relative ${isOverdue
                  ? "bg-red-50 border-red-500"
                  : isPending
                    ? "bg-amber-50 border-amber-500"
                    : "bg-emerald-50 border-emerald-500"
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {problem?.title || "Atividade"}
                    </h3>
                    <p className="text-sm text-stone-600 mt-1">
                      Prazo: {dueDate.toLocaleDateString("pt-BR")} às{" "}
                      {dueDate.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {hasAnyRole(["professor", "admin"]) && (
                    <div className="relative ml-4 activity-menu">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleMenu(activity.id);
                        }}
                        className="p-2 rounded-full hover:bg-stone-100"
                      >
                        <MoreVertical size={20} />
                      </button>

                      {openMenuId === activity.id && (
                        <div
                          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-stone-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditActivity(activity);
                              }}
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-100"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteActivity(activity);
                              }}
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-stone-100"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Apagar</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewActivity(activity);
                    }}
                    className="h-8 text-xs gap-2"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver Problema
                  </Button>
                  {hasAnyRole(["professor", "admin"]) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewSubmissions(activity);
                      }}
                      className="h-8 text-xs gap-2"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Ver Submissões
                    </Button>
                  )}
                </div>

                <span
                  className={`absolute bottom-3 right-10 px-2.5 py-1 rounded-lg text-xs font-medium ${isOverdue
                    ? "bg-red-100 text-red-700"
                    : isPending
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                    }`}
                >
                  {isOverdue
                    ? "Atrasada"
                    : isPending
                      ? "Pendente"
                      : "Concluída"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Plus, Codesandbox } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import type { JamSession } from "@/types/jam";

interface JamSessionsTabProps {
  jamSessions: JamSession[];
  classId: string;
}

export default function JamSessionsTab({ jamSessions, classId }: JamSessionsTabProps) {
  const navigate = useNavigate();
  const { hasAnyRole } = useUserRole();

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
        <h2 className="text-lg font-semibold text-stone-800">Jam Sessions</h2>
        {hasAnyRole(["professor", "admin"]) && (
          <Button
            onClick={() => navigate(`/jam/create/${classId}`)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Sessão
          </Button>
        )}
      </div>

      {jamSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4 bg-teal-100">
            <Codesandbox className="w-7 h-7 text-teal-600" />
          </div>
          <p className="text-sm font-medium text-stone-600">Nenhuma jam session criada</p>
          <p className="text-xs text-stone-400 mt-1">Crie uma sessão para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jamSessions.map((jam) => (
            <div
              key={jam.id}
              onClick={() => navigate(`/jam/${jam.id}`)}
              className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-stone-200 p-4 cursor-pointer hover:bg-stone-50 transition-colors gap-3"
            >
              <div className="min-w-0">
                <h3 className="font-semibold text-stone-800 truncate">{jam.titulo}</h3>
                <p className="text-sm text-stone-500 truncate">
                  Problema: {jam.problema?.titulo || "—"}
                  {jam.tempo_limite && ` · ${jam.tempo_limite} min`}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs text-stone-400">
                  {jam.participants?.length || 0} participantes
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    jam.status === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : jam.status === "waiting"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {jam.status === "active"
                    ? "Ativa"
                    : jam.status === "waiting"
                    ? "Aguardando"
                    : "Encerrada"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
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
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: "#ccfbf1" }}>
            <Codesandbox className="w-7 h-7" style={{ color: "#0d9488" }} />
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
              className="flex items-center justify-between rounded-lg border border-stone-200 p-4 cursor-pointer hover:bg-stone-50 transition-colors"
            >
              <div>
                <h3 className="font-semibold text-stone-800">{jam.titulo}</h3>
                <p className="text-sm text-stone-500">
                  Problema: {jam.problema?.titulo || "—"}
                  {jam.tempo_limite && ` · ${jam.tempo_limite} min`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-400">
                  {jam.participants?.length || 0} participantes
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    jam.status === "active"
                      ? "bg-green-100 text-green-700"
                      : jam.status === "waiting"
                      ? "bg-yellow-100 text-yellow-700"
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

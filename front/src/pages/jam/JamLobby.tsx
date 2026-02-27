import { Users, Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JamSession, JamStreamParticipant } from "@/types/jam";

interface JamLobbyProps {
  session: JamSession;
  participants: JamStreamParticipant[];
  isProfessor: boolean;
  onStart: () => void;
}

export default function JamLobby({ session, participants, isProfessor, onStart }: JamLobbyProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg rounded-xl border border-stone-200 bg-white p-8 text-center shadow-lg">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <h2 className="mb-2 text-xl sm:text-2xl font-bold text-stone-800">{session.titulo}</h2>
        <p className="mb-1 text-stone-500">
          Problema: {session.problema?.titulo || "Carregando..."}
        </p>
        {session.instrucoes && (
          <p className="mb-4 text-sm text-stone-500">{session.instrucoes}</p>
        )}
        {session.tempo_limite && (
          <p className="mb-4 text-sm text-stone-400">
            Tempo limite: {session.tempo_limite} minutos
          </p>
        )}

        <div className="mb-6 rounded-lg bg-stone-50 p-4">
          <div className="mb-2 flex items-center justify-center gap-2 text-stone-600">
            <Users className="h-5 w-5" />
            <span className="font-medium">
              {participants.length} participante{participants.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {participants.map((p) => (
              <span
                key={p.userId}
                className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700"
              >
                {p.userName}
              </span>
            ))}
          </div>
          {participants.length === 0 && (
            <p className="text-sm text-stone-400">Aguardando participantes...</p>
          )}
        </div>

        {isProfessor ? (
          <Button
            onClick={onStart}
            size="lg"
            className="flex items-center gap-2 bg-teal-600 text-white hover:bg-teal-700"
          >
            <Play className="h-5 w-5" />
            Iniciar Sessão
          </Button>
        ) : (
          <div className="rounded-lg bg-teal-50 border border-teal-200 p-4 text-teal-700">
            <p className="font-medium">Aguardando o professor iniciar a sessão...</p>
          </div>
        )}
      </div>
    </div>
  );
}

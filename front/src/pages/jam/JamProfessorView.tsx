import { useState } from "react";
import { Users, CheckCircle2, Code2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import JamStudentCard from "@/components/jam/JamStudentCard";
import JamFocusView from "@/components/jam/JamFocusView";
import JamTimer from "@/components/jam/JamTimer";
import type { JamSession, JamStreamParticipant } from "@/types/jam";
import type { JamSubmissionResult } from "@/hooks/useJamSession";

interface JamProfessorViewProps {
  session: JamSession;
  participants: JamStreamParticipant[];
  submissionResults: Record<number, JamSubmissionResult>;
  onEndSession: () => void;
  onGiveFeedback: (studentId: number, feedback: string) => void;
}

export default function JamProfessorView({
  session,
  participants,
  submissionResults,
  onEndSession,
  onGiveFeedback,
}: JamProfessorViewProps) {
  const [focusedUserId, setFocusedUserId] = useState<number | null>(null);
  const focusedParticipant = focusedUserId !== null
    ? participants.find((p) => p.userId === focusedUserId) || null
    : null;

  const stats = {
    total: participants.length,
    coding: participants.filter((p) => p.status === "coding").length,
    submitted: participants.filter((p) => ["submitted", "passed", "failed"].includes(p.status)).length,
    passed: participants.filter((p) => p.status === "passed").length,
  };

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{session.titulo}</h2>
          <p className="text-sm text-gray-500">
            Problema: {session.problema?.titulo}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <JamTimer
            startedAt={session.started_at}
            timeLimitMinutes={session.tempo_limite}
          />
          <Button
            onClick={onEndSession}
            variant="outline"
            className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            <Square className="h-4 w-4" />
            Encerrar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-lg border bg-white p-4 text-center">
          <Users className="mx-auto mb-1 h-5 w-5 text-gray-500" />
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-500">Participantes</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <Code2 className="mx-auto mb-1 h-5 w-5 text-blue-500" />
          <p className="text-2xl font-bold text-blue-600">{stats.coding}</p>
          <p className="text-xs text-gray-500">Codificando</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <Square className="mx-auto mb-1 h-5 w-5 text-yellow-500" />
          <p className="text-2xl font-bold text-yellow-600">{stats.submitted}</p>
          <p className="text-xs text-gray-500">Submetidos</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-green-500" />
          <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
          <p className="text-xs text-gray-500">Aprovados</p>
        </div>
      </div>

      {/* Student Grid */}
      <div className="grid flex-1 grid-cols-2 gap-4 overflow-y-auto md:grid-cols-3 lg:grid-cols-4">
        {participants.map((p) => (
          <JamStudentCard
            key={p.userId}
            participant={p}
            onClick={() => setFocusedUserId(p.userId)}
          />
        ))}
        {participants.length === 0 && (
          <div className="col-span-full flex items-center justify-center text-gray-400">
            Nenhum participante conectado ainda.
          </div>
        )}
      </div>

      {/* Focus View Modal */}
      {focusedParticipant && (
        <JamFocusView
          participant={focusedParticipant}
          submissionResult={submissionResults[focusedParticipant.userId] || null}
          onClose={() => setFocusedUserId(null)}
          onGiveFeedback={onGiveFeedback}
        />
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Wifi, WifiOff } from "lucide-react";
import { useJamSession } from "@/hooks/useJamSession";
import { useUserRole } from "@/hooks/useUserRole";
import { JamSessionService } from "@/services/JamSessionService";
import type { JamSession } from "@/types/jam";
import Loading from "@/components/Loading";
import JamLobby from "./JamLobby";
import JamProfessorView from "./JamProfessorView";
import JamStudentView from "./JamStudentView";

export default function JamView() {
  const { jamId } = useParams<{ jamId: string }>();
  const navigate = useNavigate();
  const { hasAnyRole } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [restSession, setRestSession] = useState<JamSession | null>(null);

  const jamIdNum = jamId ? Number(jamId) : null;
  const isFinished = restSession?.status === "finished";

  // Only connect WS if session is not finished
  const {
    session: wsSession,
    participants,
    myParticipant,
    submissionResults,
    connected,
    error,
    updateCode,
    updateCursor,
    submitCode,
    startSession,
    endSession,
    giveFeedback,
    updateSettings,
  } = useJamSession(isFinished ? null : jamIdNum);

  // Use WS session when available, fall back to REST session
  const session = wsSession || restSession;

  const isProfessor = hasAnyRole(["professor", "admin"]);

  // Load session via REST and auto-join
  useEffect(() => {
    if (!jamIdNum) return;

    const init = async () => {
      try {
        // Load session data via REST first
        const sessionData = await JamSessionService.getById(jamIdNum);
        setRestSession(sessionData);

        // Only try to join if session is not finished
        if (sessionData.status !== "finished") {
          try {
            await JamSessionService.join(jamIdNum);
          } catch {
            // May already be joined, that's ok
          }
        }
      } catch {
        // Session not found or error
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [jamIdNum]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500">Sessão não encontrada.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-sm text-teal-600 hover:text-teal-700 hover:underline"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-1 hover:bg-stone-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-stone-500">Jam Session</span>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <div className="flex items-center gap-1 text-teal-600">
              <Wifi className="h-4 w-4" />
              <span className="text-xs">Conectado</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-500">
              <WifiOff className="h-4 w-4" />
              <span className="text-xs">Desconectado</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Main content based on session status and role */}
      <div className="flex-1 overflow-hidden">
        {session.status === "waiting" ? (
          <JamLobby
            session={session}
            participants={participants}
            isProfessor={isProfessor}
            onStart={startSession}
          />
        ) : session.status === "active" || session.status === "finished" ? (
          isProfessor ? (
            <JamProfessorView
              session={session}
              participants={participants}
              submissionResults={submissionResults}
              onEndSession={endSession}
              onGiveFeedback={giveFeedback}
              onUpdateSettings={updateSettings}
            />
          ) : (
            <JamStudentView
              session={session}
              myParticipant={myParticipant}
              participants={participants}
              submissionResult={myParticipant ? submissionResults[myParticipant.user_id] || null : null}
              onUpdateCode={updateCode}
              onUpdateCursor={updateCursor}
              onSubmitCode={submitCode}
            />
          )
        ) : null}
      </div>
    </div>
  );
}

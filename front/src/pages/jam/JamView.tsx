import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Wifi, WifiOff, Ban } from "lucide-react";
import { useJamSession } from "@/hooks/useJamSession";
import { useUserRole } from "@/hooks/useUserRole";
import { JamSessionService } from "@/services/JamSessionService";
import type { JamSession, JamStreamParticipant } from "@/types/jam";
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

  // Only connect WS if session is loaded and not finished
  const shouldConnect = restSession !== null && !isFinished;
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
  } = useJamSession(shouldConnect ? jamIdNum : null);

  // Use WS session when available, fall back to REST session
  const session = wsSession || restSession;

  // Convert REST participants to stream format as fallback for finished sessions
  const restParticipants: JamStreamParticipant[] = useMemo(
    () =>
      (restSession?.participants || []).map((p) => ({
        userId: p.user_id,
        userName: p.user?.name || "Aluno",
        code: p.codigo || "",
        language: p.linguagem || "c",
        status: p.status,
        feedback: p.feedback || [],
        online: false,
        cursor: undefined,
      })),
    [restSession?.participants]
  );

  // Use WS participants when active, REST participants when finished
  const effectiveParticipants = isFinished ? restParticipants : participants;

  const isProfessor = hasAnyRole(["professor", "admin"]);

  // When WS reports session finished, re-fetch REST data to get final state
  useEffect(() => {
    if (wsSession?.status === "finished" && jamIdNum) {
      JamSessionService.getById(jamIdNum).then(setRestSession).catch(() => {});
    }
  }, [wsSession?.status, jamIdNum]);

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
    <div className="flex h-[calc(100vh-56px-2.5rem)] flex-col -mx-[7.5rem] -mt-10">
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
          {isFinished ? (
            <div className="flex items-center gap-1 rounded-full border border-stone-200 bg-stone-100 px-2.5 py-0.5 text-stone-600">
              <Ban className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Encerrada</span>
            </div>
          ) : connected ? (
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
            participants={effectiveParticipants}
            isProfessor={isProfessor}
            onStart={startSession}
          />
        ) : session.status === "active" || session.status === "finished" ? (
          isProfessor ? (
            <JamProfessorView
              session={session}
              participants={effectiveParticipants}
              submissionResults={submissionResults}
              onEndSession={endSession}
              onGiveFeedback={giveFeedback}
              onUpdateSettings={updateSettings}
              isFinished={isFinished}
            />
          ) : (
            <JamStudentView
              session={session}
              myParticipant={myParticipant}
              participants={effectiveParticipants}
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

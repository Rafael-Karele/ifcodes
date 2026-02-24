import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Wifi, WifiOff } from "lucide-react";
import { useJamSession } from "@/hooks/useJamSession";
import { useUserRole } from "@/hooks/useUserRole";
import { JamSessionService } from "@/services/JamSessionService";
import Loading from "@/components/Loading";
import JamLobby from "./JamLobby";
import JamProfessorView from "./JamProfessorView";
import JamStudentView from "./JamStudentView";

export default function JamView() {
  const { jamId } = useParams<{ jamId: string }>();
  const navigate = useNavigate();
  const { hasAnyRole } = useUserRole();
  const [joining, setJoining] = useState(true);

  const jamIdNum = jamId ? Number(jamId) : null;

  const {
    session,
    participants,
    myParticipant,
    submissionResults,
    connected,
    error,
    updateCode,
    submitCode,
    startSession,
    endSession,
    giveFeedback,
  } = useJamSession(jamIdNum);

  const isProfessor = hasAnyRole(["professor", "admin"]);

  // Auto-join on mount (for students)
  useEffect(() => {
    if (!jamIdNum) return;

    const joinSession = async () => {
      try {
        await JamSessionService.join(jamIdNum);
      } catch {
        // May already be joined, that's ok
      } finally {
        setJoining(false);
      }
    };

    joinSession();
  }, [jamIdNum]);

  if (joining || !session) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-gray-500">Jam Session</span>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <div className="flex items-center gap-1 text-green-600">
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
        <div className="border-b bg-red-50 px-4 py-2 text-sm text-red-600">
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
            />
          ) : (
            <JamStudentView
              session={session}
              myParticipant={myParticipant}
              participants={participants}
              submissionResult={myParticipant ? submissionResults[myParticipant.user_id] || null : null}
              onUpdateCode={updateCode}
              onSubmitCode={submitCode}
            />
          )
        ) : null}
      </div>
    </div>
  );
}

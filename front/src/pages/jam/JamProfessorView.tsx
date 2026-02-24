import { useState, useEffect, useCallback } from "react";
import { Users, CheckCircle2, Code2, Square, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import JamStudentCard from "@/components/jam/JamStudentCard";
import JamFocusView from "@/components/jam/JamFocusView";
import JamTimer from "@/components/jam/JamTimer";
import type { JamSession, JamStreamParticipant } from "@/types/jam";
import type { JamSubmissionResult } from "@/hooks/useJamSession";

type CardSize = "sm" | "md" | "lg";

interface JamProfessorViewProps {
  session: JamSession;
  participants: JamStreamParticipant[];
  submissionResults: Record<number, JamSubmissionResult>;
  onEndSession: () => void;
  onGiveFeedback: (studentId: number, feedback: string) => void;
  onUpdateSettings: (settings: { titulo?: string; instrucoes?: string | null; tempoLimite?: number | null }) => void;
}

export default function JamProfessorView({
  session,
  participants,
  submissionResults,
  onEndSession,
  onGiveFeedback,
  onUpdateSettings,
}: JamProfessorViewProps) {
  const [cardSize, setCardSize] = useState<CardSize>("sm");
  const [cardSizes, setCardSizes] = useState<Record<number, { width: number; height: number }>>({});
  const [focusedUserId, setFocusedUserId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTitulo, setSettingsTitulo] = useState(session.titulo || "");
  const [settingsInstrucoes, setSettingsInstrucoes] = useState(session.instrucoes || "");
  const [settingsTempoLimite, setSettingsTempoLimite] = useState<string>(
    session.tempo_limite != null ? String(session.tempo_limite) : ""
  );

  // Sync form state when session changes (e.g. from a broadcast)
  useEffect(() => {
    if (!showSettings) {
      setSettingsTitulo(session.titulo || "");
      setSettingsInstrucoes(session.instrucoes || "");
      setSettingsTempoLimite(session.tempo_limite != null ? String(session.tempo_limite) : "");
    }
  }, [session.titulo, session.instrucoes, session.tempo_limite, showSettings]);

  const handleSaveSettings = () => {
    onUpdateSettings({
      titulo: settingsTitulo,
      instrucoes: settingsInstrucoes || null,
      tempoLimite: settingsTempoLimite ? Number(settingsTempoLimite) : null,
    });
    setShowSettings(false);
  };
  const gridClasses: Record<CardSize, string> = {
    sm: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    md: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    lg: "grid-cols-1 md:grid-cols-1 lg:grid-cols-2",
  };

  const editorHeights: Record<CardSize, string> = {
    sm: "h-32",
    md: "h-48",
    lg: "h-64",
  };

  const handleCardResize = useCallback(
    (userId: number, size: { width: number; height: number }) => {
      setCardSizes((prev) => ({ ...prev, [userId]: size }));
    },
    []
  );

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
          <h2 className="text-xl font-bold text-stone-800">{session.titulo}</h2>
          <p className="text-sm text-stone-500">
            Problema: {session.problema?.titulo}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <JamTimer
            startedAt={session.started_at}
            timeLimitMinutes={session.tempo_limite}
          />
          <div className="flex items-center rounded-md border border-stone-300">
            {(["sm", "md", "lg"] as const).map((size) => (
              <button
                key={size}
                onClick={() => setCardSize(size)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  cardSize === size
                    ? "text-white"
                    : "text-stone-600 hover:bg-stone-100"
                } ${size === "sm" ? "rounded-l-md" : ""} ${size === "lg" ? "rounded-r-md" : ""}`}
                style={cardSize === size ? { backgroundColor: "#0d9488" } : undefined}
              >
                {size === "sm" ? "P" : size === "md" ? "M" : "G"}
              </button>
            ))}
          </div>
          <Button
            onClick={() => setShowSettings(true)}
            variant="outline"
            className="flex items-center gap-2 border-stone-300"
          >
            <Settings className="h-4 w-4" />
            Configurações
          </Button>
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
        <div className="rounded-xl border border-stone-200 bg-white p-4 text-center">
          <Users className="mx-auto mb-1 h-5 w-5 text-stone-500" />
          <p className="text-2xl font-bold text-stone-800">{stats.total}</p>
          <p className="text-xs text-stone-500">Participantes</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 text-center">
          <Code2 className="mx-auto mb-1 h-5 w-5 text-blue-500" />
          <p className="text-2xl font-bold text-blue-600">{stats.coding}</p>
          <p className="text-xs text-stone-500">Codificando</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 text-center">
          <Square className="mx-auto mb-1 h-5 w-5 text-yellow-500" />
          <p className="text-2xl font-bold text-yellow-600">{stats.submitted}</p>
          <p className="text-xs text-stone-500">Submetidos</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 text-center">
          <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-green-500" />
          <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
          <p className="text-xs text-stone-500">Aprovados</p>
        </div>
      </div>

      {/* Student Grid */}
      <div className={`grid flex-1 auto-rows-min content-start gap-4 overflow-y-auto ${gridClasses[cardSize]}`}>
        {participants.map((p) => (
          <JamStudentCard
            key={p.userId}
            participant={p}
            onClick={() => setFocusedUserId(p.userId)}
            editorHeight={editorHeights[cardSize]}
            customSize={cardSizes[p.userId]}
            onResize={(size) => handleCardResize(p.userId, size)}
          />
        ))}
        {participants.length === 0 && (
          <div className="col-span-full flex items-center justify-center text-stone-400">
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

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-stone-800">Configurações da Sessão</h3>
              <button onClick={() => setShowSettings(false)} className="rounded p-1 hover:bg-stone-100">
                <X className="h-5 w-5 text-stone-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Título</label>
                <input
                  type="text"
                  value={settingsTitulo}
                  onChange={(e) => setSettingsTitulo(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Instruções</label>
                <textarea
                  value={settingsInstrucoes}
                  onChange={(e) => setSettingsInstrucoes(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Tempo limite (minutos)</label>
                <input
                  type="number"
                  min="1"
                  value={settingsTempoLimite}
                  onChange={(e) => setSettingsTempoLimite(e.target.value)}
                  placeholder="Sem limite"
                  className="w-full rounded-md border px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSaveSettings}
                style={{ backgroundColor: "#0d9488" }}
                className="hover:opacity-90"
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

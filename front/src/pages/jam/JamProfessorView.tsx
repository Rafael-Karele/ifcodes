import { useState, useEffect, useRef, useCallback } from "react";
import { Users, CheckCircle2, Square, Settings, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import JamStudentCard from "@/components/jam/JamStudentCard";
import type { CardLayout } from "@/components/jam/JamStudentCard";
import JamFocusView from "@/components/jam/JamFocusView";
import JamTimer from "@/components/jam/JamTimer";
import type { JamSession, JamStreamParticipant } from "@/types/jam";
import type { JamSubmissionResult } from "@/hooks/useJamSession";

const DEFAULT_CARD_W = 280;
const DEFAULT_CARD_H = 220;
const GAP = 16;

function autoLayout(
  count: number,
  containerWidth: number,
): CardLayout[] {
  const cols = Math.max(1, Math.floor((containerWidth + GAP) / (DEFAULT_CARD_W + GAP)));
  return Array.from({ length: count }, (_, i) => ({
    x: (i % cols) * (DEFAULT_CARD_W + GAP),
    y: Math.floor(i / cols) * (DEFAULT_CARD_H + GAP),
    w: DEFAULT_CARD_W,
    h: DEFAULT_CARD_H,
  }));
}

interface JamProfessorViewProps {
  session: JamSession;
  participants: JamStreamParticipant[];
  submissionResults: Record<number, JamSubmissionResult>;
  onEndSession: () => void;
  onGiveFeedback: (studentId: number, feedback: string) => void;
  onUpdateSettings: (settings: { titulo?: string; instrucoes?: string | null; tempoLimite?: number | null }) => void;
  isFinished?: boolean;
}

export default function JamProfessorView({
  session,
  participants,
  submissionResults,
  onEndSession,
  onGiveFeedback,
  onUpdateSettings,
  isFinished = false,
}: JamProfessorViewProps) {
  const [layouts, setLayouts] = useState<Record<number, CardLayout>>({});
  const [focusedUserId, setFocusedUserId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTitulo, setSettingsTitulo] = useState(session.titulo || "");
  const [settingsInstrucoes, setSettingsInstrucoes] = useState(session.instrucoes || "");
  const [settingsTempoLimite, setSettingsTempoLimite] = useState<string>(
    session.tempo_limite != null ? String(session.tempo_limite) : ""
  );
  const canvasRef = useRef<HTMLDivElement>(null);

  // Sync form state when session changes
  useEffect(() => {
    if (!showSettings) {
      setSettingsTitulo(session.titulo || "");
      setSettingsInstrucoes(session.instrucoes || "");
      setSettingsTempoLimite(session.tempo_limite != null ? String(session.tempo_limite) : "");
    }
  }, [session.titulo, session.instrucoes, session.tempo_limite, showSettings]);

  // Auto-assign layout to new participants
  useEffect(() => {
    const containerW = canvasRef.current?.clientWidth || 900;
    setLayouts((prev) => {
      const next = { ...prev };
      // IDs that already have a layout
      const existingIds = new Set(Object.keys(next).map(Number));
      // IDs that need a new layout
      const newParticipants = participants.filter((p) => !existingIds.has(p.userId));
      if (newParticipants.length === 0) return prev;

      // Find the next free grid slots
      const allPositions = autoLayout(
        participants.length,
        containerW,
      );
      // Assign used slots
      const usedSlots = new Set<number>();
      participants.forEach((p, i) => {
        if (existingIds.has(p.userId)) usedSlots.add(i);
      });
      // Find free slots for new participants
      let slotIdx = 0;
      for (const p of newParticipants) {
        while (usedSlots.has(slotIdx)) slotIdx++;
        next[p.userId] = allPositions[slotIdx] || {
          x: slotIdx * (DEFAULT_CARD_W + GAP),
          y: 0,
          w: DEFAULT_CARD_W,
          h: DEFAULT_CARD_H,
        };
        usedSlots.add(slotIdx);
        slotIdx++;
      }
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants.length]);

  const handleSaveSettings = () => {
    onUpdateSettings({
      titulo: settingsTitulo,
      instrucoes: settingsInstrucoes || null,
      tempoLimite: settingsTempoLimite ? Number(settingsTempoLimite) : null,
    });
    setShowSettings(false);
  };

  const handleLayoutChange = useCallback(
    (userId: number, layout: CardLayout) => {
      setLayouts((prev) => ({ ...prev, [userId]: layout }));
    },
    []
  );

  const handleResetLayout = () => {
    const containerW = canvasRef.current?.clientWidth || 900;
    const positions = autoLayout(participants.length, containerW);
    const next: Record<number, CardLayout> = {};
    participants.forEach((p, i) => {
      next[p.userId] = positions[i];
    });
    setLayouts(next);
  };

  const focusedParticipant = focusedUserId !== null
    ? participants.find((p) => p.userId === focusedUserId) || null
    : null;

  const stats = {
    total: participants.length,
    submitted: participants.filter((p) => ["submitted", "passed", "failed"].includes(p.status)).length,
    passed: participants.filter((p) => p.status === "passed").length,
  };

  // Compute canvas height to allow scrolling
  const canvasHeight = Math.max(
    600,
    ...participants.map((p) => {
      const l = layouts[p.userId];
      return l ? l.y + l.h + GAP : 0;
    })
  );

  return (
    <div className="flex h-full flex-col p-3">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-800">{session.titulo}</h2>
          <p className="text-sm text-stone-500">
            Problema: {session.problema?.titulo}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isFinished && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-sm font-medium text-stone-600">
              Sessão Encerrada
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-sm">
            <Users className="h-3.5 w-3.5 text-stone-500" />
            <span className="font-semibold text-stone-800">{stats.total}</span>
            <span className="text-stone-400">participantes</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-100 bg-yellow-50 px-3 py-1 text-sm">
            <Square className="h-3.5 w-3.5 text-yellow-500" />
            <span className="font-semibold text-yellow-700">{stats.submitted}</span>
            <span className="text-yellow-400">submetidos</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-3 py-1 text-sm">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            <span className="font-semibold text-green-700">{stats.passed}</span>
            <span className="text-green-400">aprovados</span>
          </span>
          {!isFinished && (
            <>
              <div className="mx-1 h-6 w-px bg-stone-200" />
              <JamTimer
                startedAt={session.started_at}
                timeLimitMinutes={session.tempo_limite}
              />
              <Button
                onClick={handleResetLayout}
                variant="outline"
                className="flex items-center gap-2 border-stone-300"
                title="Reorganizar cards"
              >
                <RotateCcw className="h-4 w-4" />
                Reorganizar
              </Button>
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
            </>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div ref={canvasRef} className="relative flex-1 overflow-auto rounded-lg border border-stone-200 bg-stone-50">
        <div style={{ position: "relative", minHeight: canvasHeight }}>
          {participants.map((p) => {
            const l = layouts[p.userId];
            if (!l) return null;
            return (
              <JamStudentCard
                key={p.userId}
                participant={p}
                layout={l}
                onClick={() => setFocusedUserId(p.userId)}
                onLayoutChange={(newLayout) => handleLayoutChange(p.userId, newLayout)}
              />
            );
          })}
          {participants.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-stone-400">
              {isFinished ? "Nenhum participante registrado nesta sessão." : "Nenhum participante conectado ainda."}
            </div>
          )}
        </div>
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

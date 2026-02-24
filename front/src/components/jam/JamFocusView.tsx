import { useState } from "react";
import { X, Send } from "lucide-react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import type { JamStreamParticipant } from "@/types/jam";

interface JamFocusViewProps {
  participant: JamStreamParticipant;
  onClose: () => void;
  onGiveFeedback: (studentId: number, feedback: string) => void;
}

const statusLabels: Record<string, string> = {
  joined: "Conectado",
  coding: "Codificando",
  submitted: "Submetido",
  passed: "Aprovado",
  failed: "Reprovado",
  error: "Erro",
};

export default function JamFocusView({ participant, onClose, onGiveFeedback }: JamFocusViewProps) {
  const [feedback, setFeedback] = useState(participant.feedback || "");

  const handleSendFeedback = () => {
    if (feedback.trim()) {
      onGiveFeedback(participant.userId, feedback);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex h-[90vh] w-[90vw] flex-col rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-800">{participant.userName}</h2>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              {statusLabels[participant.status] || participant.status}
            </span>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Code Editor - Read Only */}
          <div className="flex-1 border-r">
            <div className="border-b bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600">
              Código do Aluno
            </div>
            <Editor
              height="100%"
              language="c"
              value={participant.code || "// Sem código"}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: true },
                fontSize: 14,
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          {/* Feedback Panel */}
          <div className="flex w-80 flex-col">
            <div className="border-b bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600">
              Feedback
            </div>
            <div className="flex flex-1 flex-col p-4">
              {participant.feedback && (
                <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                  <span className="font-medium">Feedback anterior:</span>
                  <p className="mt-1">{participant.feedback}</p>
                </div>
              )}
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Escreva um feedback para o aluno..."
                className="flex-1 resize-none rounded-lg border border-gray-200 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Button
                onClick={handleSendFeedback}
                className="mt-3 flex items-center gap-2"
                disabled={!feedback.trim()}
              >
                <Send className="h-4 w-4" />
                Enviar Feedback
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

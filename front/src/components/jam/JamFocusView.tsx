import { useState } from "react";
import { X, Send, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import type { JamStreamParticipant } from "@/types/jam";
import type { JamSubmissionResult } from "@/hooks/useJamSession";

interface JamFocusViewProps {
  participant: JamStreamParticipant;
  submissionResult: JamSubmissionResult | null;
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

export default function JamFocusView({ participant, submissionResult, onClose, onGiveFeedback }: JamFocusViewProps) {
  const [feedback, setFeedback] = useState("");
  const compileError = submissionResult?.testResults?.find((t) => t.compile_output)?.compile_output || null;

  const handleSendFeedback = () => {
    if (feedback.trim()) {
      onGiveFeedback(participant.userId, feedback);
      setFeedback("");
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

          {/* Results & Feedback Panel */}
          <div className="flex w-80 flex-col overflow-y-auto">
            {/* Submission Results */}
            {(participant.status === "passed" || participant.status === "failed" || participant.status === "error") && (
              <div className="border-b">
                <div className="border-b bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600">
                  Resultado da Submissão
                </div>
                <div className="space-y-2 p-4">
                  {participant.status === "passed" && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span className="text-sm font-medium">Todos os testes passaram!</span>
                    </div>
                  )}
                  {(participant.status === "failed" || participant.status === "error") && (
                    <>
                      <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700">
                        <XCircle className="h-4 w-4 shrink-0" />
                        <span className="text-sm font-medium">
                          {submissionResult?.statusMessage || (participant.status === "error" ? "Erro na execução" : "Alguns testes falharam")}
                        </span>
                      </div>
                      {compileError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                          <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-red-700">
                            <AlertTriangle className="h-3 w-3" />
                            Saída do compilador
                          </div>
                          <pre className="whitespace-pre-wrap break-words text-xs text-red-800 font-mono">
                            {compileError}
                          </pre>
                        </div>
                      )}
                      {submissionResult?.testResults && !compileError && (
                        <div className="space-y-1">
                          {submissionResult.testResults.map((t, i) => (
                            <div
                              key={i}
                              className={`rounded-lg border p-2 text-xs ${
                                t.status === "Aceita"
                                  ? "border-green-200 bg-green-50 text-green-700"
                                  : "border-red-200 bg-red-50 text-red-700"
                              }`}
                            >
                              <span className="font-medium">Teste {i + 1}:</span> {t.status}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Feedback */}
            <div className="border-b bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600">
              Feedback ({participant.feedback?.length || 0})
            </div>
            <div className="flex flex-1 flex-col p-4">
              {participant.feedback?.length > 0 && (
                <div className="mb-4 space-y-2 max-h-48 overflow-y-auto">
                  {participant.feedback.map((entry, i) => (
                    <div key={i} className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                      <p>{entry.message}</p>
                      <p className="mt-1 text-xs text-blue-400">
                        {new Date(entry.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  ))}
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

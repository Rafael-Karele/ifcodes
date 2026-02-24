import { useState, useRef, useEffect } from "react";
import { X, Send, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor as monacoEditor } from "monaco-editor";
import { Button } from "@/components/ui/button";
import type { JamStreamParticipant } from "@/types/jam";
import type { JamSubmissionResult } from "@/hooks/useJamSession";

function injectJamCursorStyles() {
  const styleId = "jam-cursor-styles";
  if (document.getElementById(styleId)) return;
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .jam-cursor-line {
      background: rgba(250, 204, 21, 0.12);
    }
    .jam-cursor-caret {
      border-left: 2px solid #facc15;
      margin-left: -1px;
      animation: jam-caret-blink 1s step-end infinite;
    }
    .jam-cursor-char {
      outline: 1.5px solid rgba(250, 204, 21, 0.7);
      border-radius: 1px;
      background: rgba(250, 204, 21, 0.18);
    }
    @keyframes jam-caret-blink {
      0%, 100% { border-left-color: #facc15; }
      50% { border-left-color: transparent; }
    }
  `;
  document.head.appendChild(style);
}

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
  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<monacoEditor.IEditorDecorationsCollection | null>(null);
  const compileError = submissionResult?.testResults?.find((t) => t.compile_output)?.compile_output || null;

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !participant.cursor) return;

    const { line, column } = participant.cursor;
    editor.revealLineInCenter(line);

    const newDecorations: monacoEditor.IModelDeltaDecoration[] = [
      {
        range: {
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: "jam-cursor-line",
        },
      },
      {
        range: {
          startLineNumber: line,
          startColumn: column,
          endLineNumber: line,
          endColumn: column,
        },
        options: {
          beforeContentClassName: "jam-cursor-caret",
        },
      },
      {
        range: {
          startLineNumber: line,
          startColumn: column,
          endLineNumber: line,
          endColumn: column + 1,
        },
        options: {
          inlineClassName: "jam-cursor-char",
        },
      },
    ];

    if (decorationsRef.current) {
      decorationsRef.current.set(newDecorations);
    } else {
      decorationsRef.current = editor.createDecorationsCollection(newDecorations);
    }
  }, [participant.cursor?.line, participant.cursor?.column, participant.code]);

  const handleSendFeedback = () => {
    if (feedback.trim()) {
      onGiveFeedback(participant.userId, feedback);
      setFeedback("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="flex h-[90vh] w-[90vw] flex-col rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-stone-800">{participant.userName}</h2>
            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700">
              {statusLabels[participant.status] || participant.status}
            </span>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Code Editor - Read Only */}
          <div className="flex-1 border-r">
            <div className="border-b bg-stone-50 px-4 py-2 text-sm font-medium text-stone-600">
              Código do Aluno
            </div>
            <Editor
              height="100%"
              language="c"
              value={participant.code || "// Sem código"}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: true },
                fontSize: 14,
                scrollBeyondLastLine: false,
              }}
              beforeMount={() => {
                injectJamCursorStyles();
              }}
            />
          </div>

          {/* Results & Feedback Panel */}
          <div className="flex w-80 flex-col overflow-y-auto">
            {/* Submission Results */}
            {(participant.status === "passed" || participant.status === "failed" || participant.status === "error") && (
              <div className="border-b">
                <div className="border-b bg-stone-50 px-4 py-2 text-sm font-medium text-stone-600">
                  Resultado da Submissão
                </div>
                <div className="space-y-2 p-4">
                  {participant.status === "passed" && (
                    <>
                      <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span className="text-sm font-medium">Todos os testes passaram!</span>
                      </div>
                      {submissionResult?.testResults && (
                        <div className="space-y-1">
                          {submissionResult.testResults.map((t, i) => (
                            <div
                              key={i}
                              className="rounded-lg border border-green-200 bg-green-50 p-2 text-xs text-green-700"
                            >
                              <div className="font-medium">Teste {i + 1}: {t.status}</div>
                              {t.stdout && (
                                <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-green-600 leading-relaxed">
                                  {t.stdout}
                                </pre>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
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
                              <div className="font-medium">Teste {i + 1}: {t.status}</div>
                              {t.stdout && (
                                <pre className="mt-1 whitespace-pre-wrap break-words font-mono leading-relaxed">
                                  {t.stdout}
                                </pre>
                              )}
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
            <div className="border-b bg-stone-50 px-4 py-2 text-sm font-medium text-stone-600">
              Feedback ({participant.feedback?.length || 0})
            </div>
            <div className="flex flex-1 flex-col p-4">
              {participant.feedback?.length > 0 && (
                <div className="mb-4 space-y-2 max-h-48 overflow-y-auto">
                  {participant.feedback.map((entry, i) => (
                    <div key={i} className="rounded-lg bg-teal-50 p-3 text-sm text-teal-700">
                      <p>{entry.message}</p>
                      <p className="mt-1 text-xs text-teal-400">
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
                className="flex-1 resize-none rounded-lg border border-stone-200 p-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <Button
                onClick={handleSendFeedback}
                className="mt-3 flex items-center gap-2 hover:opacity-90"
                disabled={!feedback.trim()}
                style={{ backgroundColor: "#0d9488" }}
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

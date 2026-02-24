import { useState, useEffect, useRef } from "react";
import { Send, CheckCircle2, XCircle, Loader2, MessageSquare, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Editor, { type OnMount } from "@monaco-editor/react";
import { RichTextViewer } from "@/components/RichTextEditor";
import JamTimer from "@/components/jam/JamTimer";
import type { JamSession, JamParticipant, JamStreamParticipant } from "@/types/jam";
import type { JamSubmissionResult } from "@/hooks/useJamSession";

interface JamStudentViewProps {
  session: JamSession;
  myParticipant: JamParticipant | null;
  participants: JamStreamParticipant[];
  submissionResult: JamSubmissionResult | null;
  onUpdateCode: (code: string) => void;
  onUpdateCursor: (line: number, column: number) => void;
  onSubmitCode: () => void;
}

const DEFAULT_CODE = "#include <stdio.h>\n\nint main() {\n    \n    return 0;\n}";

export default function JamStudentView({
  session,
  myParticipant,
  participants,
  submissionResult,
  onUpdateCode,
  onUpdateCursor,
  onSubmitCode,
}: JamStudentViewProps) {
  const [code, setCode] = useState(myParticipant?.codigo || DEFAULT_CODE);
  const [submitting, setSubmitting] = useState(false);
  const onUpdateCursorRef = useRef(onUpdateCursor);
  onUpdateCursorRef.current = onUpdateCursor;

  const handleEditorMount: OnMount = (editor) => {
    editor.onDidChangeCursorPosition((e) => {
      onUpdateCursorRef.current(e.position.lineNumber, e.position.column);
    });
  };

  // Find my stream data for real-time status/feedback
  const myStream = participants.find((p) => p.userId === myParticipant?.user_id);
  const myStatus = myStream?.status || myParticipant?.status || "joined";
  const myFeedback = myStream?.feedback?.length ? myStream.feedback : myParticipant?.feedback || [];

  // Submission result details
  const myResult = submissionResult?.userId === myParticipant?.user_id ? submissionResult : null;
  const compileError = myResult?.testResults?.find((t) => t.compile_output)?.compile_output || null;

  useEffect(() => {
    if (myParticipant?.codigo) {
      setCode(myParticipant.codigo);
    }
  }, [myParticipant?.codigo]);

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || "";
    setCode(newCode);
    onUpdateCode(newCode);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    onSubmitCode();
    setTimeout(() => setSubmitting(false), 2000);
  };

  const statusIcon = () => {
    switch (myStatus) {
      case "passed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "failed":
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "submitted":
        return <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />;
      default:
        return null;
    }
  };

  const statusLabel: Record<string, string> = {
    joined: "Conectado",
    coding: "Codificando",
    submitted: "Avaliando...",
    passed: "Aprovado!",
    failed: "Reprovado",
    error: "Erro",
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-3">
        <div>
          <h2 className="text-lg font-bold text-stone-800">{session.titulo}</h2>
          <p className="text-sm text-stone-500">
            Problema: {session.problema?.titulo}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {statusIcon()}
            <span className="text-sm font-medium text-stone-600">
              {statusLabel[myStatus] || myStatus}
            </span>
          </div>
          <JamTimer
            startedAt={session.started_at}
            timeLimitMinutes={session.tempo_limite}
          />
        </div>
      </div>

      {/* Main Content - 3 Panels */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Panel - Problem Statement */}
        <div className="w-1/3 overflow-y-auto border-r border-stone-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-stone-700">Enunciado</h3>
          {session.problema?.enunciado ? (
            <RichTextViewer content={session.problema.enunciado} />
          ) : (
            <p className="text-sm text-stone-400">Carregando enunciado...</p>
          )}
          {session.instrucoes && (
            <div className="mt-4 rounded-lg bg-teal-50 border border-teal-200 p-3">
              <h4 className="mb-1 text-xs font-semibold text-teal-700">
                Instruções do Professor
              </h4>
              <p className="text-sm text-teal-700">{session.instrucoes}</p>
            </div>
          )}
        </div>

        {/* Center Panel - Code Editor */}
        <div className="flex flex-1 min-h-0 flex-col">
          <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-4 py-2 shrink-0">
            <span className="text-sm font-medium text-stone-600">Editor de Código</span>
            <Button
              onClick={handleSubmit}
              disabled={submitting || myStatus === "submitted"}
              size="sm"
              className="flex items-center gap-2 hover:opacity-90"
              style={{ backgroundColor: "#0d9488" }}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submeter
            </Button>
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language="c"
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Right Panel - Results & Feedback */}
        <div className="w-1/4 overflow-y-auto border-l bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-stone-700">Resultados</h3>

          {myStatus === "passed" && (
            <div className="mb-4 rounded-lg bg-green-50 p-3">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Todos os testes passaram!</span>
              </div>
            </div>
          )}

          {myStatus === "failed" && (
            <div className="mb-4 space-y-3">
              <div className="rounded-lg bg-red-50 p-3">
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="h-5 w-5 shrink-0" />
                  <span className="font-semibold">
                    {myResult?.statusMessage || "Alguns testes falharam"}
                  </span>
                </div>
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
              {myResult?.testResults && !compileError && (
                <div className="space-y-2">
                  {myResult.testResults.map((t, i) => (
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
            </div>
          )}

          {myStatus === "error" && (
            <div className="mb-4 space-y-3">
              <div className="rounded-lg bg-red-50 p-3">
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="h-5 w-5 shrink-0" />
                  <span className="font-semibold">
                    {myResult?.statusMessage || "Erro na execução"}
                  </span>
                </div>
              </div>
              {compileError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-red-700">
                    <AlertTriangle className="h-3 w-3" />
                    Detalhes do erro
                  </div>
                  <pre className="whitespace-pre-wrap break-words text-xs text-red-800 font-mono">
                    {compileError}
                  </pre>
                </div>
              )}
            </div>
          )}

          {myStatus === "submitted" && (
            <div className="mb-4 rounded-lg bg-yellow-50 p-3">
              <div className="flex items-center gap-2 text-yellow-700">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-semibold">Avaliando...</span>
              </div>
            </div>
          )}

          {(myStatus === "joined" || myStatus === "coding") && (
            <div className="mb-4 rounded-lg bg-stone-50 p-3 text-sm text-stone-500">
              Submeta seu código para ver os resultados.
            </div>
          )}

          {/* Feedback Section */}
          {myFeedback.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-700">
                <MessageSquare className="h-4 w-4" />
                Feedback do Professor ({myFeedback.length})
              </h3>
              <div className="space-y-2">
                {myFeedback.map((entry, i) => (
                  <div key={i} className="rounded-lg bg-teal-50 p-3 text-sm text-teal-700">
                    <p>{entry.message}</p>
                    <p className="mt-1 text-xs text-teal-400">
                      {new Date(entry.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

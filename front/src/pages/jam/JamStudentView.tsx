import { useState, useEffect, useRef, useCallback } from "react";
import { Send, CheckCircle2, XCircle, Loader2, FileText, X, BookOpen, GraduationCap, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Editor, { type OnMount } from "@monaco-editor/react";
import { RichTextViewer } from "@/components/RichTextEditor";
import JamTimer from "@/components/jam/JamTimer";
import JamResultsPanel from "./JamResultsPanel";
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
  const [showProblem, setShowProblem] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const onUpdateCursorRef = useRef(onUpdateCursor);
  onUpdateCursorRef.current = onUpdateCursor;

  const toggleProblem = useCallback(() => setShowProblem((v) => !v), []);
  const toggleResults = useCallback(() => setShowResults((v) => !v), []);

  // Ctrl+E to toggle problem panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "e") {
        e.preventDefault();
        toggleProblem();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleProblem]);

  const handleEditorMount: OnMount = (editor) => {
    editor.onDidChangeCursorPosition((e) => {
      onUpdateCursorRef.current(e.position.lineNumber, e.position.column);
    });
  };

  // Find my stream data for real-time status/feedback
  const myStream = participants.find((p) => p.userId === myParticipant?.user_id);
  const rawStatus = myStream?.status || myParticipant?.status || "joined";
  const myStatus = rawStatus === "joined" && session.status === "finished" ? "finished" : rawStatus;
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
    finished: "Encerrada",
    coding: "Codificando",
    submitted: "Avaliando...",
    passed: "Aprovado!",
    failed: "Reprovado",
    error: "Erro",
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-200 bg-white px-3 sm:px-6 py-2 sm:py-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm sm:text-base font-bold text-stone-800 truncate">{session.titulo}</h2>
          <p className="text-xs sm:text-sm text-stone-500 truncate">
            Problema: {session.problema?.titulo}
          </p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="flex items-center gap-2">
            {statusIcon()}
            <span className="text-xs sm:text-sm font-medium text-stone-600">
              {statusLabel[myStatus] || myStatus}
            </span>
          </div>
          <JamTimer
            startedAt={session.started_at}
            timeLimitMinutes={session.tempo_limite}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {/* Problem Panel - Slide-over */}
        <div
          className={`absolute inset-y-0 left-0 z-20 flex w-full max-w-xs sm:max-w-sm md:max-w-[520px] transition-transform duration-300 ease-out ${
            showProblem ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full w-full flex-col bg-white/95 backdrop-blur-sm shadow-2xl">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-4 w-4 text-stone-400" />
                <span className="text-xs font-semibold uppercase tracking-widest text-stone-500 text-[0.7rem]">
                  Enunciado
                </span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-mono text-stone-400 border border-stone-200">
                  Ctrl+E
                </kbd>
                <button
                  onClick={toggleProblem}
                  className="rounded-md p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
                  title="Fechar (Ctrl+E)"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Separator line */}
            <div className="mx-5 h-px bg-stone-200" />

            {/* Content area */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {/* Problem title */}
              <h2 className="mb-4 text-base sm:text-lg font-bold text-stone-800 leading-snug">
                {session.problema?.titulo || "Problema"}
              </h2>

              {/* Problem statement */}
              <div className="text-sm leading-relaxed text-stone-600 [&_p]:mb-3 [&_strong]:text-stone-800 [&_em]:text-stone-700 [&_ul]:ml-4 [&_ul]:list-disc [&_ol]:ml-4 [&_ol]:list-decimal [&_li]:mb-1 [&_code]:rounded [&_code]:bg-stone-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-teal-700 [&_code]:font-mono [&_code]:text-xs [&_pre]:rounded-lg [&_pre]:bg-stone-50 [&_pre]:p-3 [&_pre]:text-xs [&_h1]:text-stone-800 [&_h2]:text-stone-800 [&_h3]:text-stone-700 [&_h1]:text-base [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:mb-1.5">
                {session.problema?.enunciado ? (
                  <RichTextViewer value={session.problema.enunciado} />
                ) : (
                  <p className="text-stone-400">Carregando enunciado...</p>
                )}
              </div>

              {/* Instructor notes */}
              {session.instrucoes && (
                <div className="mt-6 rounded-lg border border-stone-200 bg-stone-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <GraduationCap className="h-3.5 w-3.5 text-stone-400" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-stone-500 text-[0.7rem]">
                      Instrucoes do Professor
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-600">{session.instrucoes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Backdrop */}
        {showProblem && (
          <div
            className="absolute inset-0 z-10 bg-black/30 transition-opacity duration-300"
            onClick={toggleProblem}
          />
        )}

        {/* Code Editor */}
        <div className="flex flex-1 min-h-0 min-w-0 flex-col">
          <div className="flex items-center gap-1 sm:gap-2 border-b border-stone-200 bg-stone-50 px-2 sm:px-4 py-2 shrink-0 min-w-0">
            <button
              onClick={toggleProblem}
              className={`flex items-center gap-1.5 rounded-md px-1.5 sm:px-2 py-1 text-xs font-medium transition-colors shrink-0 ${
                showProblem
                  ? "bg-teal-100 text-teal-700"
                  : "text-stone-500 hover:bg-stone-100 hover:text-stone-700"
              }`}
              title="Enunciado (Ctrl+E)"
            >
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Enunciado</span>
            </button>
            <button
              onClick={toggleResults}
              className={`flex items-center gap-1.5 rounded-md px-1.5 sm:px-2 py-1 text-xs font-medium transition-colors shrink-0 ${
                showResults
                  ? "bg-teal-100 text-teal-700"
                  : "text-stone-500 hover:bg-stone-100 hover:text-stone-700"
              }`}
              title="Resultados"
            >
              <BarChart3 className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Resultados</span>
            </button>
            <span className="hidden md:inline text-sm font-medium text-stone-600 truncate">Editor de Codigo</span>
            <div className="flex-1" />
            <Button
              onClick={handleSubmit}
              disabled={submitting || myStatus === "submitted"}
              size="sm"
              className="flex items-center gap-1.5 sm:gap-2 bg-teal-600 text-white hover:bg-teal-700 shrink-0"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Submeter</span>
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

        {/* Results Panel - Slide-over on top of editor */}
        <div className={`absolute inset-y-0 right-0 z-20 w-full max-w-xs sm:max-w-sm overflow-y-auto border-l border-stone-200 bg-white/95 backdrop-blur-sm shadow-2xl transition-transform duration-300 ease-out ${
          showResults ? "translate-x-0" : "translate-x-full"
        }`}>
          <JamResultsPanel
            myStatus={myStatus}
            myResult={myResult}
            compileError={compileError}
            myFeedback={myFeedback}
            onClose={toggleResults}
            showClose
          />
        </div>
      </div>
    </div>
  );
}

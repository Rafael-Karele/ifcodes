import { CheckCircle2, XCircle, Loader2, MessageSquare, Terminal, FlaskConical, X } from "lucide-react";
import type { JamSubmissionResult } from "@/hooks/useJamSession";

interface ResultsPanelProps {
  myStatus: string;
  myResult: JamSubmissionResult | null;
  compileError: string | null;
  myFeedback: { message: string; created_at: string }[];
  onClose?: () => void;
  showClose?: boolean;
}

export default function JamResultsPanel({ myStatus, myResult, compileError, myFeedback, onClose, showClose }: ResultsPanelProps) {
  return (
    <div className="overflow-hidden">
      <div className="px-3 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 shrink-0 text-stone-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 text-[0.7rem] tracking-[0.08em]">
            Resultados
          </span>
        </div>
        {showClose && onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="mx-3 h-px bg-stone-200" />

      <div className="p-3 space-y-3">
        {myStatus === "passed" && (
          <div className="space-y-2">
            <div className="rounded-lg border border-green-200 bg-green-50 p-2.5">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span className="text-xs font-semibold break-words">Todos os testes passaram!</span>
              </div>
            </div>
            {myResult?.testResults && (
              <div className="space-y-1.5">
                {myResult.testResults.map((t, i) => (
                  <div
                    key={i}
                    className="rounded-md border border-green-200 bg-green-50 p-2 text-xs font-medium text-green-700 overflow-hidden"
                  >
                    <div>Teste {i + 1}: {t.status}</div>
                    {t.stdout && (
                      <pre className="mt-1 whitespace-pre-wrap break-all font-mono text-green-600 leading-relaxed text-[11px]">
                        {t.stdout}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {myStatus === "failed" && (
          <div className="space-y-2">
            <div className="rounded-lg border border-red-200 bg-red-50 p-2.5">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="h-4 w-4 shrink-0" />
                <span className="text-xs font-semibold break-words">
                  {myResult?.statusMessage || "Alguns testes falharam"}
                </span>
              </div>
            </div>
            {compileError && (
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-2.5 overflow-hidden">
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-stone-500">
                  <Terminal className="h-3 w-3 shrink-0" />
                  Saida do compilador
                </div>
                <pre className="whitespace-pre-wrap break-all text-[11px] text-red-600 font-mono leading-relaxed">
                  {compileError}
                </pre>
              </div>
            )}
            {myResult?.testResults && !compileError && (
              <div className="space-y-1.5">
                {myResult.testResults.map((t, i) => (
                  <div
                    key={i}
                    className={`rounded-md border p-2 text-xs font-medium ${
                      t.status === "Aceita"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    Teste {i + 1}: {t.status}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {myStatus === "error" && (
          <div className="space-y-2">
            <div className="rounded-lg border border-red-200 bg-red-50 p-2.5">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="h-4 w-4 shrink-0" />
                <span className="text-xs font-semibold break-words">
                  {myResult?.statusMessage || "Erro na execucao"}
                </span>
              </div>
            </div>
            {compileError && (
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-2.5 overflow-hidden">
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-stone-500">
                  <Terminal className="h-3 w-3 shrink-0" />
                  Detalhes do erro
                </div>
                <pre className="whitespace-pre-wrap break-all text-[11px] text-red-600 font-mono leading-relaxed">
                  {compileError}
                </pre>
              </div>
            )}
          </div>
        )}

        {myStatus === "submitted" && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-2.5">
            <div className="flex items-center gap-2 text-yellow-700">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              <span className="text-xs font-semibold">Avaliando...</span>
            </div>
          </div>
        )}

        {(myStatus === "joined" || myStatus === "coding") && (
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-500">
            Submeta seu codigo para ver os resultados.
          </div>
        )}

        {/* Feedback Section */}
        {myFeedback.length > 0 && (
          <div>
            <div className="mb-2 mt-1 h-px bg-stone-200" />
            <div className="mb-2 flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5 shrink-0 text-stone-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 text-[0.7rem] tracking-[0.08em]">
                Feedback ({myFeedback.length})
              </span>
            </div>
            <div className="space-y-2">
              {myFeedback.map((entry, i) => (
                <div key={i} className="rounded-lg border border-stone-200 bg-stone-50 p-2.5">
                  <p className="text-xs leading-relaxed text-stone-600 break-words">{entry.message}</p>
                  <p className="mt-1 text-[10px] text-stone-400">
                    {new Date(entry.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { AlertCircle } from "lucide-react";
import type { TestCaseResult } from "@/types";

interface ErrorSectionsProps {
  results: TestCaseResult[];
}

export function ErrorSections({ results }: ErrorSectionsProps) {
  const hasCompileOutput = results.some((r) => r.compileOutput);
  const hasRuntimeError =
    !hasCompileOutput && results.some((r) => r.message || r.stderr);

  return (
    <>
      {/* Erro de compilacao */}
      {hasCompileOutput && (
        <section className="rounded-xl border border-amber-200 bg-white overflow-hidden">
          <div className="border-b border-amber-200 px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3">
            <div className="bg-amber-50 rounded-lg p-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-stone-800">
              Saida do Compilador
            </h2>
          </div>
          <div className="px-4 py-4 sm:px-6 sm:py-5">
            <pre className="overflow-x-auto rounded-lg bg-stone-900 p-3 sm:p-4 text-sm font-mono text-stone-300 whitespace-pre-wrap max-h-80">
              {results.find((r) => r.compileOutput)?.compileOutput}
            </pre>
          </div>
        </section>
      )}

      {/* Erro de execucao (runtime error, timeout, etc.) */}
      {hasRuntimeError && (
        <section className="rounded-xl border border-red-200 bg-white overflow-hidden">
          <div className="border-b border-red-200 px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3">
            <div className="bg-red-50 rounded-lg p-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-stone-800">
              Erro de Execucao
            </h2>
          </div>
          <div className="px-4 py-4 sm:px-6 sm:py-5">
            <pre className="overflow-x-auto rounded-lg bg-stone-900 p-3 sm:p-4 text-sm font-mono text-stone-300 whitespace-pre-wrap max-h-80">
              {results.find((r) => r.message)?.message ||
                results.find((r) => r.stderr)?.stderr}
            </pre>
          </div>
        </section>
      )}
    </>
  );
}

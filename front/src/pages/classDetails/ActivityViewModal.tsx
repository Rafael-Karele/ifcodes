import type { Activity, Problem } from "@/types";
import { Label } from "@/components/ui/label";
import { Codesandbox, Calendar, Clock, HardDrive, X, Settings2 } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { RichTextViewer } from "@/components/RichTextEditor";

interface ActivityViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity;
  problem: Problem | null;
}

export default function ActivityViewModal({ isOpen, onClose, activity, problem }: ActivityViewModalProps) {
  const { hasAnyRole } = useUserRole();
  if (!isOpen || !problem) return null;

  const dueDate = new Date(activity.dueDate);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <h2 className="text-xl font-bold text-stone-900 flex items-center">
              <Codesandbox className="w-6 h-6 mr-3 text-stone-600" />
              {problem.title}
            </h2>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center text-teal-900">
                <Calendar className="w-5 h-5 mr-2" />
                Data de Entrega
              </h3>
              <p className="text-lg font-medium text-teal-900">
                {dueDate.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })} às {dueDate.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Enunciado</h3>
              <div className="bg-stone-50 p-4 rounded-lg">
                <RichTextViewer value={problem.statement} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Tempo Limite</h3>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {activity.tempoLimite ?? problem.timeLimitMs} ms
                    {activity.tempoLimite != null && (
                      <span className="text-xs text-teal-600 ml-1">(override)</span>
                    )}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Memória Limite</h3>
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  <span>
                    {activity.memoriaLimite ?? problem.memoryLimitKb} KB
                    {activity.memoriaLimite != null && (
                      <span className="text-xs text-teal-600 ml-1">(override)</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {(activity.compilerOptions || activity.commandLineArguments || activity.redirectStderrToStdout || activity.wallTimeLimit != null || activity.stackLimit != null || activity.maxFileSize != null || activity.maxProcessesAndOrThreads != null) && (
              <div className="border border-stone-200 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Settings2 className="w-5 h-5 mr-2 text-stone-600" />
                  Configurações Avançadas
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {activity.wallTimeLimit != null && (
                    <div>
                      <span className="text-stone-500">Wall Time Limit:</span>{" "}
                      <span className="font-medium">{activity.wallTimeLimit}s</span>
                    </div>
                  )}
                  {activity.stackLimit != null && (
                    <div>
                      <span className="text-stone-500">Stack Limit:</span>{" "}
                      <span className="font-medium">{activity.stackLimit} KB</span>
                    </div>
                  )}
                  {activity.maxFileSize != null && (
                    <div>
                      <span className="text-stone-500">Tamanho Máx. Arquivo:</span>{" "}
                      <span className="font-medium">{activity.maxFileSize} KB</span>
                    </div>
                  )}
                  {activity.maxProcessesAndOrThreads != null && (
                    <div>
                      <span className="text-stone-500">Máx Processos/Threads:</span>{" "}
                      <span className="font-medium">{activity.maxProcessesAndOrThreads}</span>
                    </div>
                  )}
                  {activity.compilerOptions && (
                    <div className="col-span-2">
                      <span className="text-stone-500">Opções do Compilador:</span>{" "}
                      <code className="bg-stone-100 px-2 py-0.5 rounded text-xs">{activity.compilerOptions}</code>
                    </div>
                  )}
                  {activity.commandLineArguments && (
                    <div className="col-span-2">
                      <span className="text-stone-500">Argumentos de Linha de Comando:</span>{" "}
                      <code className="bg-stone-100 px-2 py-0.5 rounded text-xs">{activity.commandLineArguments}</code>
                    </div>
                  )}
                  {activity.redirectStderrToStdout && (
                    <div className="col-span-2">
                      <span className="text-stone-500">Redirecionar stderr para stdout:</span>{" "}
                      <span className="font-medium">Sim</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {problem.testCases && problem.testCases.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4">Casos de Teste</h3>
                <div className="space-y-4">
                  {problem.testCases
                    .filter(testCase => !testCase.private || hasAnyRole(['professor', 'admin']))
                    .map((testCase, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium">Caso {index + 1}</h4>
                          {testCase.private && (
                            <span className="px-2 py-1 bg-stone-200 text-stone-700 text-xs rounded">
                              Privado
                            </span>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs font-medium">Entrada</Label>
                            <div className="bg-stone-50 p-3 rounded mt-1">
                              <pre className="text-sm">{testCase.input}</pre>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Saída Esperada</Label>
                            <div className="bg-stone-50 p-3 rounded mt-1">
                              <pre className="text-sm">{testCase.expectedOutput}</pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

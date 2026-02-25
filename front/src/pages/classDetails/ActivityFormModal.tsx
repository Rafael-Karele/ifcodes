import { useState } from "react";
import type { Activity, Problem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Search, X, Codesandbox, ChevronDown } from "lucide-react";
import type { ActivityFormData } from "./types";
import { formatDateForApi } from "./types";

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ActivityFormData) => void;
  problems: Problem[];
  onViewProblem: (problem: Problem) => void;
  activity?: Activity;
}

export default function ActivityFormModal({ isOpen, onClose, onSave, problems, onViewProblem, activity }: ActivityFormModalProps) {
  const isEditing = !!activity;

  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(
    activity?.problemId ?? null
  );
  const [dueDate, setDueDate] = useState<Date | null>(
    activity ? new Date(activity.dueDate.replace(' ', 'T')) : null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Judge0 override states
  const [tempoLimite, setTempoLimite] = useState<string>(
    activity?.tempoLimite != null ? String(activity.tempoLimite) : ""
  );
  const [memoriaLimite, setMemoriaLimite] = useState<string>(
    activity?.memoriaLimite != null ? String(activity.memoriaLimite) : ""
  );
  const [compilerOptions, setCompilerOptions] = useState<string>(
    activity?.compilerOptions ?? ""
  );
  const [commandLineArguments, setCommandLineArguments] = useState<string>(
    activity?.commandLineArguments ?? ""
  );
  const [redirectStderrToStdout, setRedirectStderrToStdout] = useState<boolean>(
    activity?.redirectStderrToStdout ?? false
  );
  const [wallTimeLimit, setWallTimeLimit] = useState<string>(
    activity?.wallTimeLimit != null ? String(activity.wallTimeLimit) : ""
  );
  const [stackLimit, setStackLimit] = useState<string>(
    activity?.stackLimit != null ? String(activity.stackLimit) : ""
  );
  const [maxFileSize, setMaxFileSize] = useState<string>(
    activity?.maxFileSize != null ? String(activity.maxFileSize) : ""
  );
  const [maxProcessesAndOrThreads, setMaxProcessesAndOrThreads] = useState<string>(
    activity?.maxProcessesAndOrThreads != null ? String(activity.maxProcessesAndOrThreads) : ""
  );

  const filteredProblems = problems.filter(problem =>
    problem.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProblem = problems.find(p => p.id === selectedProblemId);

  const toNullableInt = (v: string): number | null => {
    const trimmed = v.trim();
    if (trimmed === "") return null;
    const n = parseInt(trimmed, 10);
    return isNaN(n) ? null : n;
  };

  const toNullableFloat = (v: string): number | null => {
    const trimmed = v.trim();
    if (trimmed === "") return null;
    const n = parseFloat(trimmed);
    return isNaN(n) ? null : n;
  };

  const toNullableString = (v: string): string | null => {
    const trimmed = v.trim();
    return trimmed === "" ? null : trimmed;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProblemId || !dueDate) return;

    onSave({
      problema_id: selectedProblemId,
      data_entrega: formatDateForApi(dueDate),
      tempo_limite: toNullableInt(tempoLimite),
      memoria_limite: toNullableInt(memoriaLimite),
      compiler_options: toNullableString(compilerOptions),
      command_line_arguments: toNullableString(commandLineArguments),
      redirect_stderr_to_stdout: redirectStderrToStdout || null,
      wall_time_limit: toNullableFloat(wallTimeLimit),
      stack_limit: toNullableInt(stackLimit),
      max_file_size: toNullableInt(maxFileSize),
      max_processes_and_or_threads: toNullableInt(maxProcessesAndOrThreads),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <h2 className="text-xl font-bold text-stone-900">
              {isEditing
                ? "Editar Atividade"
                : selectedProblem
                  ? selectedProblem.title
                  : "Nova Atividade"}
            </h2>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div>
              <Label htmlFor={`search-problem${isEditing ? '-edit' : ''}`}>Selecione um Problema *</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                <Input
                  id={`search-problem${isEditing ? '-edit' : ''}`}
                  placeholder="Buscar problemas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="mt-3 max-h-64 overflow-y-auto border border-stone-200 rounded-xl">
                {filteredProblems.length === 0 ? (
                  <p className="text-center text-stone-500 py-8">Nenhum problema encontrado</p>
                ) : (
                  filteredProblems.map((problem) => (
                    <div
                      key={problem.id}
                      className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-stone-50 transition-colors ${selectedProblemId === problem.id ? "bg-teal-50 border-l-4 border-l-teal-600" : ""
                        }`}
                      onClick={() => setSelectedProblemId(problem.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center flex-1">
                          <div className="flex-shrink-0 mr-3">
                            <Codesandbox size={24} className="text-stone-500" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-stone-900">{problem.title}</h4>
                            <div className="flex gap-3 mt-1 text-xs text-stone-600">
                              <span>Tempo: {problem.timeLimitMs}ms</span>
                              <span>Memória: {problem.memoryLimitKb}KB</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewProblem(problem);
                          }}
                          className="ml-2"
                        >
                          Visualizar
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedProblem && (
                <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                  <p className="text-sm text-teal-900">
                    <strong>Problema selecionado:</strong> {selectedProblem.title}
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor={`due-date${isEditing ? '-edit' : ''}`}>Data de Entrega *</Label>
              <DateTimePicker
                selected={dueDate}
                onChange={setDueDate}
                placeholderText="dd/mm/aaaa às hh:mm"
                required
                className="mt-2"
              />
            </div>

            {/* Advanced Judge0 Settings */}
            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between px-4 py-3 bg-stone-50 hover:bg-stone-100 transition-colors text-left"
              >
                <span className="text-sm font-medium text-stone-700">Configurações Avançadas</span>
                <ChevronDown
                  className={`w-4 h-4 text-stone-500 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`}
                />
              </button>

              {showAdvanced && (
                <div className="p-4 space-y-4 border-t border-stone-200">
                  <p className="text-xs text-stone-500">
                    Deixe em branco para usar os valores padrão do problema.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tempo_limite" className="text-xs">Tempo Limite (ms)</Label>
                      <Input
                        id="tempo_limite"
                        type="number"
                        min={100}
                        max={10000}
                        value={tempoLimite}
                        onChange={(e) => setTempoLimite(e.target.value)}
                        placeholder={selectedProblem ? String(selectedProblem.timeLimitMs) : ""}
                        className="mt-1"
                      />
                      <p className="text-[10px] text-stone-400 mt-0.5">Min: 100ms | Max: 10.000ms (10s)</p>
                    </div>
                    <div>
                      <Label htmlFor="memoria_limite" className="text-xs">Memoria Limite (KB)</Label>
                      <Input
                        id="memoria_limite"
                        type="number"
                        min={1024}
                        max={256000}
                        value={memoriaLimite}
                        onChange={(e) => setMemoriaLimite(e.target.value)}
                        placeholder={selectedProblem ? String(selectedProblem.memoryLimitKb) : ""}
                        className="mt-1"
                      />
                      <p className="text-[10px] text-stone-400 mt-0.5">Min: 1.024KB (1MB) | Max: 256.000KB (256MB)</p>
                    </div>
                    <div>
                      <Label htmlFor="wall_time_limit" className="text-xs">Wall Time Limit (s)</Label>
                      <Input
                        id="wall_time_limit"
                        type="number"
                        min={0.1}
                        max={20}
                        step={0.1}
                        value={wallTimeLimit}
                        onChange={(e) => setWallTimeLimit(e.target.value)}
                        placeholder=""
                        className="mt-1"
                      />
                      <p className="text-[10px] text-stone-400 mt-0.5">Min: 0.1s | Max: 20s</p>
                    </div>
                    <div>
                      <Label htmlFor="stack_limit" className="text-xs">Stack Limit (KB)</Label>
                      <Input
                        id="stack_limit"
                        type="number"
                        min={8000}
                        max={128000}
                        value={stackLimit}
                        onChange={(e) => setStackLimit(e.target.value)}
                        placeholder=""
                        className="mt-1"
                      />
                      <p className="text-[10px] text-stone-400 mt-0.5">Min: 8.000KB (8MB) | Max: 128.000KB (128MB)</p>
                    </div>
                    <div>
                      <Label htmlFor="max_file_size" className="text-xs">Tamanho Max. Arquivo (KB)</Label>
                      <Input
                        id="max_file_size"
                        type="number"
                        min={64}
                        max={2048}
                        value={maxFileSize}
                        onChange={(e) => setMaxFileSize(e.target.value)}
                        placeholder=""
                        className="mt-1"
                      />
                      <p className="text-[10px] text-stone-400 mt-0.5">Min: 64KB | Max: 2.048KB (2MB)</p>
                    </div>
                    <div>
                      <Label htmlFor="max_processes" className="text-xs">Max Processos/Threads</Label>
                      <Input
                        id="max_processes"
                        type="number"
                        min={5}
                        max={60}
                        value={maxProcessesAndOrThreads}
                        onChange={(e) => setMaxProcessesAndOrThreads(e.target.value)}
                        placeholder=""
                        className="mt-1"
                      />
                      <p className="text-[10px] text-stone-400 mt-0.5">Min: 5 | Max: 60</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="compiler_options" className="text-xs">Opções do Compilador</Label>
                      <Input
                        id="compiler_options"
                        type="text"
                        value={compilerOptions}
                        onChange={(e) => setCompilerOptions(e.target.value)}
                        placeholder="Ex: -lm -std=c99 -Wall"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="command_line_arguments" className="text-xs">Argumentos de Linha de Comando</Label>
                      <Input
                        id="command_line_arguments"
                        type="text"
                        value={commandLineArguments}
                        onChange={(e) => setCommandLineArguments(e.target.value)}
                        placeholder=""
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="redirect_stderr"
                      type="checkbox"
                      checked={redirectStderrToStdout}
                      onChange={(e) => setRedirectStderrToStdout(e.target.checked)}
                      className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-500"
                    />
                    <Label htmlFor="redirect_stderr" className="text-xs cursor-pointer">
                      Redirecionar stderr para stdout
                    </Label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!selectedProblemId || !dueDate}
                className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #0d9488 0%, #065f46 100%)" }}
              >
                {isEditing ? "Atualizar Atividade" : "Criar Atividade"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

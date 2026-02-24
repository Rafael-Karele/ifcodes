import { useState } from "react";
import type { Activity, Problem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Search, X, Codesandbox } from "lucide-react";
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

  const filteredProblems = problems.filter(problem =>
    problem.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProblem = problems.find(p => p.id === selectedProblemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProblemId || !dueDate) return;

    onSave({
      problema_id: selectedProblemId,
      data_entrega: formatDateForApi(dueDate),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
